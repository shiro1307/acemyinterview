import { getUser } from "../../lib/supabase/server";
import CompletenessBanner from "@/app/components/CompletenessBanner";
import SessionSummaryCard from "@/app/components/SessionSummaryCard";
import FeedbackList from "@/app/components/FeedbackList";
import ScoreRubric from "@/app/components/ScoreRubric";
import QuestionReviewCard from "@/app/components/QuestionReviewCard";
import PrintButton from "@/app/components/PrintButton";
import EmptyState from "@/app/components/EmptyState";
import PageHeader from "@/app/components/PageHeader";
import { getSessionReviewData } from "@/app/lib/session/getSessionReviewData";

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
    const result = await getSessionReviewData(sessionId, user.id);

    if (result.type === "not_found") {
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

    if (result.type === "answers_error") {
        return (
            <div className="review-page">
                <EmptyState
                    title="Error loading answers"
                    description={`We encountered an error while loading your interview answers: ${result.message}`}
                    actionText="View your interview history"
                    actionHref="/history"
                />
            </div>
        );
    }

    if (result.type === "no_feedback") {
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

    if (result.type === "outdated_format") {
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

    const { roleName, date, interviewDuration, feedback, answerMap } = result;
    const evalJson = feedback.evaluation_json;
    const questionCount = evalJson.questionEvaluations.length;

    const metaItems = [
        date,
        ...(interviewDuration ? [`Duration ${interviewDuration}`] : []),
    ];

    return (
        <div className="review-page printable">
            <PageHeader
                title={`${roleName} — Interview Review`}
                backHref="/history"
                backLabel="Back to history"
                actions={<PrintButton />}
            />

            <div className="review-meta-row">
                {metaItems.map((item) => (
                    <span key={item} className="review-meta-chip">
                        {item}
                    </span>
                ))}
            </div>

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

            <section className="review-section">
                <FeedbackList title="Topics to review" items={evalJson.studyTopics} />
            </section>

            <ScoreRubric />

            <section className="questions-section">
                <h2 className="section-title">Question breakdown ({questionCount})</h2>
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
