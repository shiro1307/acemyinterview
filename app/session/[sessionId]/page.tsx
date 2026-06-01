import { sessions } from "../../data/sessions";

interface SessionPageProps {
    params: Promise<{
        sessionId: string;
    }>;
}

export default async function SessionPage({
    params,
}: SessionPageProps) {
    const { sessionId } = await params;

    const session = sessions.find(
        (s) => s.id === sessionId
    );

    if (!session) {
        return <div>Session not found</div>;
    }

    const averageScore =
        session.questions.reduce(
            (sum, q) => sum + q.feedback.score,
            0
        ) / session.questions.length;

    return (
        <div>
            <h1>{session.role} - Interview Review</h1>

            <p>
                Average Score: {averageScore.toFixed(1)}
            </p>

            {session.questions.map((question) => (
                <div key={question.id}>
                    <h2>
                        Question {question.id}
                    </h2>

                    <p>{question.text}</p>

                    <p>
                        Score:
                        {question.feedback.score}/10
                    </p>

                    <p>
                        <strong>Your Answer:</strong>
                    </p>

                    <p>{question.answer}</p>

                    <p>
                        <strong>Strengths</strong>
                    </p>

                    <ul>
                        {question.feedback.strengths.map(
                            (strength) => (
                                <li key={strength}>
                                    {strength}
                                </li>
                            )
                        )}
                    </ul>

                    <p>
                        <strong>Missing</strong>
                    </p>

                    <ul>
                        {question.feedback.missing.map(
                            (item) => (
                                <li key={item}>
                                    {item}
                                </li>
                            )
                        )}
                    </ul>

                </div>
            ))}
        </div>
    );
}