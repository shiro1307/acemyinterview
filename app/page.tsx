import { redirect } from "next/navigation";
import { getUser } from "./lib/supabase/server";

/**
 * Root route - Authentication gateway
 * - Logged-out users: See Landing Page
 * - Logged-in users: Redirected to Dashboard
 */
export default async function RootPage() {
    const user = await getUser();

    if (user) {
        redirect("/dashboard");
    }

    return (
        <>
            This is the home page or the landing Page
            for visitors and logged out users.
        </>
    );
}
