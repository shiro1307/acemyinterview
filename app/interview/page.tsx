import RoleSelector from "../components/RoleSelector";
import { createClient } from "../lib/supabase/server";
import EmptyState from "../components/EmptyState";

export const dynamic = 'force-dynamic';

export default async function InterviewPage() {
    const supabase = await createClient();
    
    const { data: roles, error } = await supabase
        .from("roles")
        .select("id, name, slug, description, difficulty")
        .eq("is_active", true)
        .order("name", { ascending: true });
    
    if (error) {
        return (
            <div className="container">
                <h1>Select a Role</h1>
                <EmptyState
                    title="Error loading roles"
                    description={`We encountered an error while loading available interview roles: ${error.message}`}
                    actionText="Try again"
                    actionHref="/interview"
                />
            </div>
        );
    }

    // Get question counts per role
    const { data: questions } = await supabase
        .from("questions")
        .select("role_id");

    // Count questions per role ID
    const questionCounts: Record<string, number> = {};
    if (questions) {
        questions.forEach((q: any) => {
            const roleId = q.role_id;
            if (roleId) {
                questionCounts[roleId] = (questionCounts[roleId] || 0) + 1;
            }
        });
    }

    return (
        <div className="container">
            <h1>Select Interview Role</h1>
            <p style={{ marginBottom: '24px', color: 'var(--color-gray-600)' }}>
                Choose a role to start your practice interview session
            </p>
            <RoleSelector roles={roles ?? []} questionCounts={questionCounts} />
        </div>
    );
}
