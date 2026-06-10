import { AnalyticsSummary } from "@/app/lib/analytics/types";
import { formatPracticeTime, formatScoreWithMax } from "@/app/lib/analytics/format";

export default function StatCards({ summary }: { summary: AnalyticsSummary }) {
    const cards = [
        {
            label: "Interviews Completed",
            value: String(summary.interviewsCompleted),
        },
        {
            label: "Average Score",
            value: formatScoreWithMax(summary.averageScore),
        },
        {
            label: "Best Score",
            value: formatScoreWithMax(summary.bestScore, 0),
        },
        {
            label: "Total Practice Time",
            value: formatPracticeTime(summary.totalPracticeTimeMs),
        },
    ];

    return (
        <div className="stats-grid">
            {cards.map((card) => (
                <div key={card.label} className="card stat-card">
                    <div className="stat-value">{card.value}</div>
                    <div className="stat-label">{card.label}</div>
                </div>
            ))}
        </div>
    );
}
