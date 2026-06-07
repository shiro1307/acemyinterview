import { getUser } from "../lib/supabase/server";
import { createClient } from "../lib/supabase/server";
import HistoryList from "../components/HistoryList";

type SessionRow = {
    id: string;
    role: string;
    created_at: string;
    status: string;
    feedback: { overall_score: number }[] | { overall_score: number } | null;
};

function getScore(feedback: SessionRow["feedback"]): number | null {
    if (!feedback) return null;
    if (Array.isArray(feedback)) return feedback[0]?.overall_score ?? null;
    return feedback.overall_score ?? null;
}

export default async function HistoryPage() {
    const user = await getUser();

    if (!user) {
        return <div>Please log in to view your interview history</div>;
    }

    const supabase = await createClient();

    const { data: sessions, error } = await supabase
        .from("sessions")
        .select("id, role, created_at, status, feedback(overall_score)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        return <div>Error loading sessions: {error.message}</div>;
    }

    const sessionData = (sessions as SessionRow[] ?? []).map((s) => ({
        id: s.id,
        role: s.role,
        date: new Date(s.created_at).toLocaleDateString(),
        status: s.status,
        score: getScore(s.feedback),
        createdAt: s.created_at,
    }));

    return (
        <div>
            <h1>Interview History</h1>
            <HistoryList initialSessions={sessionData} />
        </div>
    );
}
