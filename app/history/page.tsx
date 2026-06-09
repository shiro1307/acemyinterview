import { getUser } from "../lib/supabase/server";
import { createClient } from "../lib/supabase/server";
import HistoryList from "../components/HistoryList";
import EmptyState from "../components/EmptyState";

// Force dynamic rendering - don't cache this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type SessionRow = {
    id: string;
    role: string; // Deprecated field
    role_id: string;
    created_at: string;
    status: string;
    feedback: { overall_score: number }[] | { overall_score: number } | null;
    roles?: { name: string }[] | { name: string } | null;
};

function getScore(feedback: SessionRow["feedback"]): number | null {
    if (!feedback) return null;
    if (Array.isArray(feedback)) return feedback[0]?.overall_score ?? null;
    return feedback.overall_score ?? null;
}

export default async function HistoryPage() {
    const user = await getUser();

    if (!user) {
        return (
            <div>
                <h1>Interview History</h1>
                <EmptyState
                    title="Please log in"
                    description="You need to be logged in to view your interview history and track your progress over time."
                    actionText="Go to login"
                    actionHref="/login"
                />
            </div>
        );
    }

    const supabase = await createClient();

    const { data: sessions, error } = await supabase
        .from("sessions")
        .select("id, role, role_id, created_at, status, feedback(overall_score), roles(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        return (
            <div>
                <h1>Interview History</h1>
                <EmptyState
                    title="Error loading sessions"
                    description={`We encountered an error while loading your interview history: ${error.message}`}
                    actionText="Try again"
                    actionHref="/history"
                />
            </div>
        );
    }

    const sessionData = (sessions as SessionRow[] ?? []).map((s) => {
        // Handle roles - could be an array (from join), a single object, or null
        const roleName = Array.isArray(s.roles) 
            ? s.roles[0]?.name 
            : s.roles?.name;
        
        return {
            id: s.id,
            role: roleName || s.role, // Prefer new role join, fallback to deprecated field
            date: new Date(s.created_at).toLocaleDateString(),
            status: s.status,
            score: getScore(s.feedback),
            createdAt: s.created_at,
        };
    });

    return (
        <div>
            <h1>Interview History</h1>
            <HistoryList initialSessions={sessionData} />
        </div>
    );
}
