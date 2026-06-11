import Link from "next/link";
import { getUser } from "../lib/supabase/server";
import { createClient } from "../lib/supabase/server";
import HistoryList from "../components/HistoryList";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";
import { getJoinedRoleName, getJoinedScore } from "../lib/supabase/helpers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SessionRow = {
    id: string;
    role: string;
    role_id: string;
    created_at: string;
    status: string;
    feedback: { overall_score: number }[] | { overall_score: number } | null;
    roles?: { name: string }[] | { name: string } | null;
};

export default async function HistoryPage() {
    const user = await getUser();

    if (!user) {
        return (
            <div className="analytics-page container">
                <PageHeader title="Interview History" />
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
            <div className="analytics-page container">
                <PageHeader title="Interview History" />
                <EmptyState
                    title="Error loading sessions"
                    description={`We encountered an error while loading your interview history: ${error.message}`}
                    actionText="Try again"
                    actionHref="/history"
                />
            </div>
        );
    }

    const sessionData = (sessions as SessionRow[] ?? []).map((s) => ({
        id: s.id,
        role: getJoinedRoleName(s.roles ?? null, s.role),
        date: new Date(s.created_at).toLocaleDateString(),
        status: s.status,
        score: getJoinedScore(s.feedback),
        createdAt: s.created_at,
    }));

    return (
        <div className="analytics-page container">
            <HistoryList initialSessions={sessionData} />
        </div>
    );
}
