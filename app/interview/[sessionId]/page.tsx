import QuestionForm from "../../components/QuestionForm";
import FeedbackList from "../../components/FeedbackList";
import { sessions } from "../../data/sessions";

interface InterviewSessionPageProps {
    params: Promise<{
        sessionId: string;
    }>;
}

export default async function InterviewSessionPage({
    params,
}: InterviewSessionPageProps) {
    const { sessionId } = await params;
    const session = sessions.find((s) => s.id === sessionId);

    if (!session) {
        return <div>Session not found</div>;
    }

    return (
        <div>
            <h1>Interview Session {sessionId}</h1>

            {session.questions.map((question) => (
                <div key={question.id}>
                    <QuestionForm questionNumber={question.id} questionText={question.text} />
                    <div>
                        <h2>Feedback</h2>
                        <p>Score: {question.feedback.score}/10</p>
                        <FeedbackList title="Strengths" items={question.feedback.strengths} />
                        <FeedbackList title="Missing" items={question.feedback.missing} />
                    </div>
                </div>
            ))}

            <button>
                Next Question
            </button>
        </div>
    );
}
