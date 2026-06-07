"use server"

import { createClient } from "../supabase/server";
import { getCurrentUser } from "./auth";
import { redirect } from "next/navigation";
import { evaluateInterview, QAPair } from "../ai/evaluate";
import { computeCompleteness } from "../feedback/completeness";

// --- Helpers ---

async function getSupabase() {
  const user = await getCurrentUser();
  const supabase = await createClient();
  return { user, supabase };
}

async function verifySessionOwner(sessionId: string, select = "id") {
  const { supabase, user } = await getSupabase();
  const { data, error } = await supabase
    .from("sessions")
    .select(select)
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (error || !data) throw new Error("Unauthorized or session not found");
  return { session: data, supabase };
}

// --- Actions ---

export async function startInterview(role: string) {
  const { user, supabase } = await getSupabase();

  // Create session
  const { data: session, error } = await supabase
    .from("sessions")
    .insert({ id: crypto.randomUUID(), role, user_id: user.id, created_at: new Date().toISOString() })
    .select()
    .single();
  if (error || !session) throw new Error("Failed to create session");

  // Pick 5 random questions for this role
  const { data: allQuestions, error: qErr } = await supabase
    .from("questions")
    .select("id")
    .eq("role", role)
    .limit(100);
  if (qErr || !allQuestions) throw new Error("Failed to fetch questions");

  const picked = allQuestions.sort(() => Math.random() - 0.5).slice(0, 5);

  // Link them to the session
  const { error: insertErr } = await supabase
    .from("session_questions")
    .insert(picked.map((q, i) => ({
      id: crypto.randomUUID(),
      session_id: session.id,
      question_id: q.id,
      order_index: i + 1,
    })));
  if (insertErr) throw new Error("Failed to insert session questions");

  redirect(`/interview/${session.id}`);
}

export async function submitAnswer(sessionId: string, questionId: string, answerText: string) {
  const { supabase } = await verifySessionOwner(sessionId);

  const { error } = await supabase.from("answers").insert({
    id: crypto.randomUUID(),
    session_id: sessionId,
    question_id: questionId,
    text: answerText,
    created_at: new Date().toISOString(),
  });
  if (error) throw new Error(`Failed to save answer: ${error.message}`);

  return { success: true };
}

function buildOrderedPairs(
  sessionQuestions: { question_id: string; order_index: number }[],
  questions: { id: string; text: string }[],
  answers: { question_id: string; text: string }[]
): QAPair[] {
  const textOf = Object.fromEntries(questions.map((q) => [q.id, q.text]));
  const answerOf = Object.fromEntries(answers.map((a) => [a.question_id, a.text]));

  return sessionQuestions
    .filter((sq) => answerOf[sq.question_id])
    .map((sq) => ({
      questionId: sq.question_id,
      questionText: textOf[sq.question_id] ?? "Unknown question",
      answerText: answerOf[sq.question_id],
    }));
}

export async function completeInterview(sessionId: string) {
  const { supabase } = await verifySessionOwner(sessionId);

  const [sqResult, ansResult, sessionResult] = await Promise.all([
    supabase
      .from("session_questions")
      .select("question_id, order_index")
      .eq("session_id", sessionId)
      .order("order_index", { ascending: true }),
    supabase.from("answers").select("question_id, text").eq("session_id", sessionId),
    supabase.from("sessions").select("role").eq("id", sessionId).single(),
  ]);
  if (sqResult.error) throw new Error("Failed to fetch session questions");
  if (ansResult.error) throw new Error("Failed to fetch answers");
  if (sessionResult.error || !sessionResult.data) throw new Error("Failed to fetch session");

  const questionIds = (sqResult.data ?? []).map((sq) => sq.question_id);
  const { data: questions } = questionIds.length > 0
    ? await supabase.from("questions").select("id, text").in("id", questionIds)
    : { data: [] };

  const answers = ansResult.data ?? [];
  const completeness = computeCompleteness(questionIds, answers);
  const pairs = buildOrderedPairs(sqResult.data ?? [], questions ?? [], answers);
  const { overallScore, summary, evaluationJson } = await evaluateInterview(
    sessionResult.data.role,
    pairs,
    completeness
  );

  const { error: fbErr } = await supabase.from("feedback").insert({
    session_id: sessionId,
    overall_score: overallScore,
    summary,
    evaluation_json: evaluationJson,
  });
  if (fbErr) throw new Error(`Failed to save feedback: ${fbErr.message}`);

  const { error: upErr } = await supabase
    .from("sessions")
    .update({ status: "completed" })
    .eq("id", sessionId);
  if (upErr) throw new Error(`Failed to update session status: ${upErr.message}`);

  redirect(`/session/${sessionId}`);
}

export async function deleteSession(sessionId: string) {
  const { supabase } = await verifySessionOwner(sessionId);

  // Explicitly delete related records in the correct order to avoid foreign key issues
  // This ensures safe deletion even if cascade rules aren't configured
  
  // 1. Delete feedback (references session_id)
  const { error: feedbackError } = await supabase
    .from("feedback")
    .delete()
    .eq("session_id", sessionId);
  if (feedbackError) throw new Error(`Failed to delete feedback: ${feedbackError.message}`);

  // 2. Delete answers (references session_id)
  const { error: answersError } = await supabase
    .from("answers")
    .delete()
    .eq("session_id", sessionId);
  if (answersError) throw new Error(`Failed to delete answers: ${answersError.message}`);

  // 3. Delete session_questions (references session_id)
  const { error: sessionQuestionsError } = await supabase
    .from("session_questions")
    .delete()
    .eq("session_id", sessionId);
  if (sessionQuestionsError) throw new Error(`Failed to delete session questions: ${sessionQuestionsError.message}`);

  // 4. Finally delete the session itself
  const { error: sessionError } = await supabase
    .from("sessions")
    .delete()
    .eq("id", sessionId);
  if (sessionError) throw new Error(`Failed to delete session: ${sessionError.message}`);

  return { success: true };
}
