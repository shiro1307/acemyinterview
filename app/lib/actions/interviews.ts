"use server"

import { createClient } from "../supabase/server";
import { getCurrentUser } from "./auth";
import { redirect } from "next/navigation";

export async function startInterview(role: string) {
  const user = await getCurrentUser();
  const supabase = await createClient();

  // 1. Create session with user_id
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .insert({
      id: crypto.randomUUID(),
      role: role,
      user_id: user.id,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (sessionError || !session) {
    throw new Error(`Failed to create session: ${sessionError?.message}`);
  }

  // 2. Fetch global questions filtered by role
  const { data: allQuestions, error: fetchError } = await supabase
    .from("questions")
    .select("id")
    .eq("role", role)
    .limit(100);

  if (fetchError || !allQuestions) {
    throw new Error("Failed to fetch questions");
  }

  // 3. Select random subset (up to 5)
  const selectedQuestionIds = allQuestions
    .sort(() => Math.random() - 0.5)
    .slice(0, 5)
    .map((q) => q.id);

  // 4. Insert into session_questions with order_index
  const sessionQuestionsToInsert = selectedQuestionIds.map(
    (questionId, index) => ({
      id: crypto.randomUUID(),
      session_id: session.id,
      question_id: questionId,
      order_index: index + 1,
    })
  );

  const { error: insertError } = await supabase
    .from("session_questions")
    .insert(sessionQuestionsToInsert);

  if (insertError) {
    throw new Error("Failed to insert session questions");
  }

  // 5. Redirect to interview
  redirect(`/interview/${session.id}`);
}

export async function submitAnswer(
  sessionId: string,
  questionId: string,
  answerText: string
) {
  const user = await getCurrentUser();
  const supabase = await createClient();

  // 1. Verify ownership of the session
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (sessionError || !session) {
    throw new Error("Unauthorized or session not found");
  }

  // 2. Fetch the question to have its text
  const { data: question } = await supabase
    .from("questions")
    .select("text")
    .eq("id", questionId)
    .single();

  const questionText = question?.text || "the question";

  // 3. Save the answer
  const answerId = crypto.randomUUID();
  const { error: answerError } = await supabase
    .from("answers")
    .insert({
      id: answerId,
      session_id: sessionId,
      question_id: questionId,
      text: answerText,
      created_at: new Date().toISOString(),
    });

  if (answerError) {
    throw new Error(`Failed to save answer: ${answerError.message}`);
  }

  // 4. Generate static dummy feedback
  const score = 8;
  const strengths = ["Good response structure", "Demonstrated clear understanding"];
  const missing = ["Could provide more real-world examples"];
  const modelAnswer = `Reference explanation for: ${questionText}`;

  // 5. Save the feedback
  const feedbackId = crypto.randomUUID();
  const { error: feedbackError } = await supabase
    .from("feedback")
    .insert({
      id: feedbackId,
      answer_id: answerId,
      score: score,
      strengths: strengths,
      missing_points: missing,
      model_answer: modelAnswer,
      created_at: new Date().toISOString(),
    });

  if (feedbackError) {
    throw new Error(`Failed to save feedback: ${feedbackError.message}`);
  }

  return {
    score,
    strengths,
    missing,
    modelAnswer,
  };
}
