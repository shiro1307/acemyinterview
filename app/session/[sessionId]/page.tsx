import { getUser } from "../../lib/supabase/server";
import { createClient } from "../../lib/supabase/server";
import { SessionFeedback, QuestionEvaluation } from "@/app/types";

interface SessionPageProps {
    params: Promise<{ sessionId: string }>;
}

export default async function SessionPage({ params }: SessionPageProps) {
    const user = await getUser();

    if (!user) {
        return <div>Please log in to view this session</div>;
    }

    const { sessionId } = await params;
    const supabase = await createClient();

    // Fetch session and verify ownership
    const { data: session, error: sessionError } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", sessionId)
        .eq("user_id", user.id)
        .single();

    if (!session || sessionError) {
        return <div>Session not found or access denied</div>;
    }

    // Fetch answers for display
    const { data: answersData, error: ansError } = await supabase
        .from("answers")
        .select("id, question_id, text")
        .eq("session_id", sessionId);

    if (ansError) {
        return <div>Error loading answers: {ansError.message}</div>;
    }

    const answerMap = new Map<string, string>();
    (answersData ?? []).forEach((a) => {
        answerMap.set(a.question_id, a.text);
    });

    // Fetch session-level feedback
    const { data: feedbackData, error: fbError } = await supabase
        .from("feedback")
        .select("*")
        .eq("session_id", sessionId)
        .single();

    if (fbError || !feedbackData) {
        return <div>No feedback found for this session. The interview may not be completed yet.</div>;
    }

    const feedback = feedbackData as SessionFeedback;
    const evaluations: QuestionEvaluation[] = feedback.evaluation_json.questionEvaluations ?? [];

    return (
        <div>
            <h1>{session.role} - Interview Review</h1>

            <p><strong>Overall Score:</strong> {feedback.overall_score}/10</p>
            <p><strong>Summary:</strong> {feedback.summary}</p>

            <hr />

            <div>
                {evaluations.map((evalItem, idx) => (
                    <div key={evalItem.questionId}>
                        <h2>Question {idx + 1}: {evalItem.questionText}</h2>

                        <p><strong>Your Answer:</strong></p>
                        {answerMap.get(evalItem.questionId) ? (
                            <blockquote>
                                {answerMap.get(evalItem.questionId)}
                            </blockquote>
                        ) : (
                            <p>No answer submitted.</p>
                        )}

                        <p><strong>Score:</strong> {evalItem.score}/10</p>
                        <p><strong>Feedback:</strong> {evalItem.feedback}</p>
                        <p><strong>Ideal Answer:</strong> {evalItem.idealAnswer}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}