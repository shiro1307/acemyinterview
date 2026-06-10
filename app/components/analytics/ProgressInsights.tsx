import { AnalyticsInsights } from "@/app/lib/analytics/types";
import { formatPercentChange, formatScoreWithMax } from "@/app/lib/analytics/format";

export default function ProgressInsights({ insights }: { insights: AnalyticsInsights }) {
    const items = [
        {
            label: "Current Average",
            value: formatScoreWithMax(insights.currentAverage),
        },
        {
            label: "Recent Improvement",
            value: formatPercentChange(insights.recentImprovement),
        },
        {
            label: "Best Performing Area",
            value: insights.bestPerformingArea ?? "—",
        },
        {
            label: "Most Practiced Role",
            value: insights.mostPracticedRole ?? "—",
        },
    ];

    return (
        <div className="insights-grid">
            {items.map((item) => (
                <div key={item.label} className="insight-item">
                    <div className="insight-label">{item.label}</div>
                    <div className="insight-value">{item.value}</div>
                </div>
            ))}
        </div>
    );
}
