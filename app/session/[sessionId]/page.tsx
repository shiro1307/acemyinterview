import { getUser } from "../../lib/supabase/server";
import { createClient } from "../../lib/supabase/server";
import { SessionFeedback } from "@/app/types";
import CompletenessBanner from "@/app/components/CompletenessBanner";
import SessionSummaryCard from "@/app/components/SessionSummaryCard";
import FeedbackList from "@/app/components/FeedbackList";
import ScoreRubric from "@/app/components/ScoreRubric";
import QuestionReviewCard from "@/app/components/QuestionReviewCard";

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

    const { data: session, error: sessionError } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", sessionId)
        .eq("user_id", user.id)
        .single();

    if (!session || sessionError) {
        return <div>Session not found or access denied</div>;
    }

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

    const { data: feedbackData, error: fbError } = await supabase
        .from("feedback")
        .select("*")
        .eq("session_id", sessionId)
        .single();

    if (fbError || !feedbackData) {
        return <div>No feedback found for this session. The interview may not be completed yet.</div>;
    }

    const feedback = feedbackData as SessionFeedback;
    const evalJson = feedback.evaluation_json;

    if (evalJson.version !== 2) {
        return <div>This session uses an outdated feedback format. Complete a new interview for full results.</div>;
    }

    const date = new Date(feedback.created_at).toLocaleDateString();

    return (
        <div className="review-page">

            <header className="review-header">
                <h1>{session.role} — Interview Review</h1>
                <p className="review-date">{date}</p>
            </header>

            <CompletenessBanner completeness={evalJson.completeness} />

            <SessionSummaryCard
                overallScore={feedback.overall_score}
                summary={feedback.summary}
                dimensions={evalJson.dimensions}
                verdict={evalJson.verdict}
                verdictRationale={evalJson.verdictRationale}
            />

            <div className="feedback-grid">
                <FeedbackList title="Strengths" items={evalJson.strengths} />
                <FeedbackList title="Weaknesses" items={evalJson.weaknesses} />
                <FeedbackList title="Improvements" items={evalJson.improvements} />
            </div>

            <FeedbackList title="Topics to review" items={evalJson.studyTopics} />

            <ScoreRubric />

            <section className="questions-section">
                <h2 className="section-title">Question breakdown</h2>
                {evalJson.questionEvaluations.map((evalItem, idx) => (
                    <QuestionReviewCard
                        key={evalItem.questionId}
                        index={idx}
                        evaluation={evalItem}
                        userAnswer={answerMap.get(evalItem.questionId)}
                    />
                ))}
            </section>
        </div>
    );
}
