import { supabase } from "../../lib/supabase";

interface SessionPageProps {
    params: Promise<{ sessionId: string }>;
}

export default async function SessionPage({ params }: SessionPageProps) {
    const { sessionId } = await params;

    // 1. fetch session
    const { data: session, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

    if (!session || error) {
        return <div>Session not found</div>;
    }

    // 2. fetch questions
    const { data: questions } = await supabase
        .from("questions")
        .select("*")
        .eq("session_id", sessionId);

    const averageScore =
        (questions?.reduce((sum, q) => sum + (q.score ?? 0), 0) ?? 0) /
        (questions?.length || 1);

    return (
        <div>
            <h1>{session.role} - Interview Review</h1>

            <p>Average Score: {averageScore.toFixed(1)}</p>

            {questions?.map((q) => (
                <div key={q.id}>
                    <h2>{q.text}</h2>
                </div>
            ))}
        </div>
    );
}