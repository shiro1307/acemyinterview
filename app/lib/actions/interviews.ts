"use server"

import { createClient } from "../supabase/server";
import { getCurrentUser } from "./auth";
import { redirect } from "next/navigation";

// --- Helpers ---

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

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

export async function completeInterview(sessionId: string) {
  const { supabase } = await verifySessionOwner(sessionId);

  // Fetch questions + answers in parallel
  const [sqResult, ansResult] = await Promise.all([
    supabase.from("session_questions").select("question_id").eq("session_id", sessionId),
    supabase.from("answers").select("question_id").eq("session_id", sessionId),
  ]);
  if (sqResult.error) throw new Error("Failed to fetch session questions");
  if (ansResult.error) throw new Error("Failed to fetch answers");

  const questionIds = (sqResult.data ?? []).map((sq) => sq.question_id);
  const answeredIds = new Set((ansResult.data ?? []).map((a) => a.question_id));

  // Fetch question texts
  const { data: questions } = questionIds.length > 0
    ? await supabase.from("questions").select("id, text").in("id", questionIds)
    : { data: [] };

  const textOf = Object.fromEntries((questions ?? []).map((q) => [q.id, q.text]));

  // Build dummy evaluation (one entry per answered question)
  const totalCount = questionIds.length;
  const answeredCount = answeredIds.size;
  const overallScore = randomInt(6, 8);

  const summary = answeredCount === totalCount
    ? `Completed all ${totalCount} questions. Solid performance overall.`
    : `Completed ${answeredCount}/${totalCount} questions. Good effort on the attempted questions.`;

  const questionEvaluations = questionIds
    .filter((id) => answeredIds.has(id))
    .map((id) => ({
      questionId: id,
      questionText: textOf[id] ?? "Unknown question",
      score: randomInt(6, 9),
      feedback: "Demonstrated understanding of core concepts. Could add more specific examples.",
      idealAnswer: `A strong answer would cover the key aspects of "${textOf[id] ?? "the topic"}" with concrete examples and clear structure.`,
    }));

  // Save feedback + mark session completed
  const { error: fbErr } = await supabase.from("feedback").insert({
    session_id: sessionId,
    overall_score: overallScore,
    summary,
    evaluation_json: { questionEvaluations },
  });
  if (fbErr) throw new Error(`Failed to save feedback: ${fbErr.message}`);

  const { error: upErr } = await supabase
    .from("sessions")
    .update({ status: "completed" })
    .eq("id", sessionId);
  if (upErr) throw new Error(`Failed to update session status: ${upErr.message}`);

  redirect(`/session/${sessionId}`);
}
