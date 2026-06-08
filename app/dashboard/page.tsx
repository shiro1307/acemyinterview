import { redirect } from "next/navigation";
import { getUser } from "../lib/supabase/server";
import HomePage from "../components/HomePage";

/**
 * Dashboard route - Protected route for authenticated users
 * Currently displays the same content as the Landing Page
 * Future: Will be redesigned with dashboard-specific features
 */
export default async function DashboardPage() {
  const user = await getUser();

  // Redirect to landing page if not authenticated
  if (!user) {
    redirect("/");
  }

  return (
    <>
    This is the dashboard
    for logged in users.
    
    Will hold details about users, statistics, progress, etc.
    </>
  );
}
