interface SessionPageProps {
    params: Promise<{
        sessionId: string;
    }>;
}

export default async function SessionPage({ params }: SessionPageProps) {
    const { sessionId } = await params;

    return (
        <div>
            <h1>Frontend Interview Review</h1>

            <h2>Question</h2>

            <p>
                Explain React reconciliation.
            </p>

            <h2>Your Answer</h2>

            <p>
                React updates the UI...
            </p>

            <h2>Feedback</h2>

            <p>
                Score: 7/10
            </p>
        </div>
    );
}
