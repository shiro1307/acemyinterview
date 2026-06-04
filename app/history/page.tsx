import { getUser } from "../lib/supabase/server";
import { createClient } from "../lib/supabase/server";

export default async function HistoryPage() {
    const user = await getUser();

    if (!user) {
        return <div>Please log in to view your interview history</div>;
    }

    const supabase = await createClient();

    // Fetch only this user's sessions, ordered by most recent first
    const { data: sessions, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        return <div>Error loading sessions: {error.message}</div>;
    }

    return (
        <div>
            <h1>Interview History</h1>
            {sessions && sessions.length === 0 ? (
                <p>No interviews yet. Start your first interview!</p>
            ) : (
                <ul>
                    {sessions?.map((session) => (
                        <li key={session.id}>
                            <a href={`/session/${session.id}`}>
                                {session.role} - {new Date(session.created_at).toLocaleDateString()}
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}