import { redirect } from "next/navigation";
import { getUser } from "./lib/supabase/server";
import HomePage from "./components/HomePage";

/**
 * Root route - Authentication gateway
 * - Logged-out users: See Landing Page
 * - Logged-in users: Redirected to Dashboard
 */
export default async function RootPage() {
  const user = await getUser();

  // Redirect authenticated users to dashboard
  if (user) {
    redirect("/dashboard");
  }

  // Show Landing Page for unauthenticated users
  // Currently displays the same content as Dashboard
  // Future: Will be replaced with marketing content

  return (
    <>
      This is the home page or the landing Page
      for visitors and logged out users.
    </>
  );
}

