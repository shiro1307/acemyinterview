import Link from "next/link";

interface InterviewSessionPageProps {
    params: Promise<{
        sessionId: string;
    }>;
}

export default async function InterviewSessionPage({
    params,
}: InterviewSessionPageProps) {
    const { sessionId } = await params;

    return (
        <div>

            <h1>Interview Session {sessionId}</h1>

            <h1>Question 1</h1>

            <p>
                Explain React reconciliation.
            </p>

            <textarea />

            <button>
                Submit Answer
            </button>

            <div>
                <h2>Feedback</h2>

                <p>Score: 7/10</p>

                <h3>Strengths</h3>

                <ul>
                    <li>Good explanation</li>
                    <li>Clear examples</li>
                </ul>

                <h3>Missing</h3>

                <ul>
                    <li>Virtual DOM discussion</li>
                </ul>
            </div>

            <button>
                Next Question
            </button>

        </div>
    );
}
