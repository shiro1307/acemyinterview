import Link from "next/link";
import { getUser } from "../lib/supabase/server";
import { createClient } from "../lib/supabase/server";

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

function computeDelta(
    sessions: { role: string; score: number | null }[],
    index: number
): number | null {
    const current = sessions[index];
    if (current.score === null) return null;

    for (let i = index + 1; i < sessions.length; i++) {
        if (sessions[i].role === current.role && sessions[i].score !== null) {
            return current.score - sessions[i].score!;
        }
    }
    return null;
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

    const rows = (sessions as SessionRow[] ?? []).map((s) => ({
        id: s.id,
        role: s.role,
        date: new Date(s.created_at).toLocaleDateString(),
        status: s.status,
        score: getScore(s.feedback),
    }));

    return (
        <div>
            <h1>Interview History</h1>
            {rows.length === 0 ? (
                <p>No interviews yet. Start your first interview!</p>
            ) : (
                <ul className="history-list">
                    {rows.map((session, index) => {
                        const delta = computeDelta(rows, index);
                        return (
                            <li key={session.id} className="history-item">
                                <Link href={`/session/${session.id}`}>
                                    {session.role} — {session.date}
                                </Link>
                                {session.score !== null && (
                                    <span className="history-score">{session.score}/10</span>
                                )}
                                {delta !== null && delta !== 0 && (
                                    <span className={`history-delta ${delta > 0 ? "history-delta-positive" : "history-delta-negative"}`}>
                                        {delta > 0 ? `+${delta}` : delta} vs prior {session.role}
                                    </span>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
