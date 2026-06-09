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
            <div>
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

    return (
        <>
            Interview, choose roles and stuff
            <div>
                <h1>Select a Role</h1>
                <RoleSelector roles={roles ?? []} />
            </div>
        </>
    );
}
