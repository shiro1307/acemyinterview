import { sessions } from "../../data/sessions";

interface SessionPageProps {
    params: Promise<{
        sessionId: string;
    }>;
}

export default async function SessionPage({ params }: SessionPageProps) {
    const { sessionId } = await params;
    const session = sessions.find((s) => s.id === sessionId);

    if (!session) {
        return <div>Session not found</div>;
    }

    return (
        <div>
            <h1>{session.role} Interview Review</h1>

            {session.questions.map((question) => (
                <div key={question.id} style={{ marginBottom: "20px", borderBottom: "1px solid #ccc", paddingBottom: "20px" }}>
                    <h2>Question {question.id}</h2>
                    <p>{question.text}</p>

                    <h3>Your Answer</h3>
                    <p>{question.answer}</p>

                    <h3>Feedback</h3>
                    <p>Score: {question.feedback.score}/10</p>
                    <h4>Strengths</h4>
                    <ul>
                        {question.feedback.strengths.map((strength, idx) => (
                            <li key={idx}>{strength}</li>
                        ))}
                    </ul>
                    <h4>Missing</h4>
                    <ul>
                        {question.feedback.missing.map((missing, idx) => (
                            <li key={idx}>{missing}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
