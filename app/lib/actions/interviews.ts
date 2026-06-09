"use server"

import { createClient } from "../supabase/server";
import { getCurrentUser } from "./auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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

export async function startInterview(roleId: string) {
  const { user, supabase } = await getSupabase();

  // Fetch role to get the name for backward compatibility
  const { data: role, error: roleError } = await supabase
    .from("roles")
    .select("id, name")
    .eq("id", roleId)
    .eq("is_active", true)
    .single();
  
  if (roleError || !role) throw new Error("Role not found or inactive");

  // Create session with both role_id (new) and role (deprecated, for backward compatibility)
  const { data: session, error } = await supabase
    .from("sessions")
    .insert({ 
      id: crypto.randomUUID(), 
      role_id: role.id,
      role: role.name, // Keep for backward compatibility during migration
      user_id: user.id, 
      created_at: new Date().toISOString() 
    })
    .select()
    .single();
  if (error || !session) throw new Error("Failed to create session");

  // Pick 5 random questions for this role
  const { data: allQuestions, error: qErr } = await supabase
    .from("questions")
    .select("id")
    .eq("role_id", role.id)
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
    supabase.from("sessions").select("role, role_id, roles(name)").eq("id", sessionId).single(),
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
  
  // Get role name - prefer from join, fallback to deprecated role field
  const roleName = (sessionResult.data.roles as any)?.name || sessionResult.data.role;
  
  const { overallScore, summary, evaluationJson } = await evaluateInterview(
    roleName,
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
  const { supabase, user } = await getSupabase();
  
  console.log("Deleting session:", sessionId, "for user:", user.id);
  
  // First verify the session exists and belongs to the user
  const { data: sessionData, error: verifyError } = await supabase
    .from("sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();
  
  console.log("Session verification:", { sessionData, verifyError });
  
  if (verifyError || !sessionData) {
    throw new Error("Session not found or unauthorized");
  }

  // Explicitly delete related records in the correct order to avoid foreign key issues
  // Note: Supabase delete() doesn't error if no rows match, so we don't check errors for missing data
  
  // 1. Delete feedback (references session_id)
  const feedbackResult = await supabase
    .from("feedback")
    .delete()
    .eq("session_id", sessionId);
  console.log("Feedback delete result:", feedbackResult);

  // 2. Delete answers (references session_id)
  const answersResult = await supabase
    .from("answers")
    .delete()
    .eq("session_id", sessionId);
  console.log("Answers delete result:", answersResult);

  // 3. Delete session_questions (references session_id)
  const sessionQuestionsResult = await supabase
    .from("session_questions")
    .delete()
    .eq("session_id", sessionId);
  console.log("Session questions delete result:", sessionQuestionsResult);

  // 4. Finally delete the session itself (with user_id check for security)
  const sessionDeleteResult = await supabase
    .from("sessions")
    .delete({ count: 'exact' })
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .select();
  
  console.log("Session delete result:", sessionDeleteResult);
  
  if (sessionDeleteResult.error) {
    throw new Error(`Failed to delete session: ${sessionDeleteResult.error.message}`);
  }
  
  if (!sessionDeleteResult.data || sessionDeleteResult.data.length === 0) {
    throw new Error("Session was not deleted - possibly due to RLS policies or it doesn't exist");
  }

  // Revalidate the history page so it shows updated data on next render
  revalidatePath("/history");

  console.log("Delete completed successfully");
  return { success: true };
}
