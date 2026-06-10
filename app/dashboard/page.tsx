import { redirect } from "next/navigation";
import { getUser } from "../lib/supabase/server";
import { getAnalyticsData } from "../lib/analytics/getAnalyticsData";
import EmptyState from "../components/EmptyState";
import StatCards from "../components/analytics/StatCards";
import TrendSection from "../components/analytics/TrendSection";
import RolePerformance from "../components/analytics/RolePerformance";
import WeaknessAnalysis from "../components/analytics/WeaknessAnalysis";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
    const user = await getUser();

    if (!user) {
        redirect("/");
    }

    const { data, error } = await getAnalyticsData(user.id);

    if (error || !data) {
        return (
            <div className="analytics-page container">
                <h1>Analytics Dashboard</h1>
                <EmptyState
                    title="Error loading analytics"
                    description={
                        error ??
                        "We encountered an error while loading your analytics data."
                    }
                    actionText="Try again"
                    actionHref="/dashboard"
                />
            </div>
        );
    }

    if (data.summary.interviewsCompleted === 0) {
        return (
            <div className="analytics-page container">
                <h1>Analytics Dashboard</h1>
                <EmptyState
                    title="Complete your first interview to unlock analytics."
                    description="Finish a mock interview to see your performance metrics, score trends, and improvement insights."
                    actionText="Start Interview"
                    actionHref="/interview"
                />
            </div>
        );
    }

    return (
        <div className="analytics-page container">
            <h1>Analytics Dashboard</h1>

            <StatCards summary={data.summary} />

            <TrendSection trends={data.trends} insights={data.insights} />

            <RolePerformance roles={data.rolePerformance} />

            <WeaknessAnalysis weaknesses={data.weaknesses} />
        </div>
    );
}
