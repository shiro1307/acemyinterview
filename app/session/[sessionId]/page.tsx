import { getUser } from "../../lib/supabase/server";
import { createClient } from "../../lib/supabase/server";
import { SessionFeedback } from "@/app/types";
import CompletenessBanner from "@/app/components/CompletenessBanner";
import SessionSummaryCard from "@/app/components/SessionSummaryCard";
import FeedbackList from "@/app/components/FeedbackList";
import ScoreRubric from "@/app/components/ScoreRubric";
import QuestionReviewCard from "@/app/components/QuestionReviewCard";
import PrintButton from "@/app/components/PrintButton";
import EmptyState from "@/app/components/EmptyState";

interface SessionPageProps {
    params: Promise<{ sessionId: string }>;
}

export default async function SessionPage({ params }: SessionPageProps) {
    const user = await getUser();

    if (!user) {
        return (
            <div className="review-page">
                <EmptyState
                    title="Please log in"
                    description="You need to be logged in to view interview session details and feedback."
                    actionText="Go to login"
                    actionHref="/login"
                />
            </div>
        );
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
        return (
            <div className="review-page">
                <EmptyState
                    title="Session not found"
                    description="This interview session doesn't exist or you don't have permission to view it."
                    actionText="View your interview history"
                    actionHref="/history"
                />
            </div>
        );
    }

    const { data: answersData, error: ansError } = await supabase
        .from("answers")
        .select("id, question_id, text, created_at")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

    if (ansError) {
        return (
            <div className="review-page">
                <EmptyState
                    title="Error loading answers"
                    description={`We encountered an error while loading your interview answers: ${ansError.message}`}
                    actionText="View your interview history"
                    actionHref="/history"
                />
            </div>
        );
    }

    const answerMap = new Map<string, string>();
    (answersData ?? []).forEach((a) => {
        answerMap.set(a.question_id, a.text);
    });

    // Calculate interview duration from first and last answer timestamps
    let interviewDuration: string | null = null;
    if (answersData && answersData.length >= 2) {
        const firstTimestamp = new Date(answersData[0].created_at).getTime();
        const lastTimestamp = new Date(answersData[answersData.length - 1].created_at).getTime();
        const durationMs = lastTimestamp - firstTimestamp;
        
        const hours = Math.floor(durationMs / 3600000);
        const minutes = Math.floor((durationMs % 3600000) / 60000);
        const seconds = Math.floor((durationMs % 60000) / 1000);
        
        const pad = (n: number) => n.toString().padStart(2, "0");
        interviewDuration = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }

    const { data: feedbackData, error: fbError } = await supabase
        .from("feedback")
        .select("*")
        .eq("session_id", sessionId)
        .single();

    if (fbError || !feedbackData) {
        return (
            <div className="review-page">
                <EmptyState
                    title="No feedback available yet"
                    description="This interview hasn't been completed or evaluated yet. Complete all questions and submit your interview to see your detailed feedback and score."
                    actionText="View your interview history"
                    actionHref="/history"
                />
            </div>
        );
    }

    const feedback = feedbackData as SessionFeedback;
    const evalJson = feedback.evaluation_json;

    if (evalJson.version !== 2) {
        return (
            <div className="review-page">
                <EmptyState
                    title="Outdated feedback format"
                    description="This session uses an outdated feedback format. Complete a new interview to see the latest detailed feedback and scoring."
                    actionText="Start a new interview"
                    actionHref="/interview"
                />
            </div>
        );
    }

    const date = new Date(feedback.created_at).toLocaleDateString();

    return (
        <div className="review-page printable">

            <header className="review-header">
                <h1>{session.role} — Interview Review</h1>
                <div className="review-meta">
                    <p className="review-date">{date}</p>
                    {interviewDuration && (
                        <p className="review-duration">
                            <span>
                                Actual interview duration: {interviewDuration} (HH:MM:SS)
                            </span>
                        </p>
                    )}
                </div>
                <PrintButton />
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
