import { sessions } from "../../data/sessions";
import InterviewQuestions from "@/app/components/InterviewQuestions";

interface InterviewSessionPageProps {
    params: Promise<{
        sessionId: string;
    }>;
}

export default async function InterviewSessionPage({
    params,
}: InterviewSessionPageProps) {
    const { sessionId } = await params;

    const session = sessions.find(
        (s) => s.id === sessionId
    );

    if (!session) {
        return <div>Session not found</div>;
    }

    return (
        <div>
            <h1>Interview Session {sessionId}</h1>

            <InterviewQuestions
                questions={session.questions}
                sessionId={session.id}
            />
        </div>
    );
}