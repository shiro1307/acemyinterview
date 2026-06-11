import { redirect } from "next/navigation";
import { getUser } from "./lib/supabase/server";
import { LandingPage } from "./components/LandingPage";

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
        <LandingPage></LandingPage>
    );
}
