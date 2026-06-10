import { WeaknessEntry } from "@/app/lib/analytics/types";

export default function WeaknessAnalysis({ weaknesses }: { weaknesses: WeaknessEntry[] }) {
    return (
        <section className="analytics-section card">
            <h2 className="card-title">Top 5 Most Frequent Weaknesses</h2>

            {weaknesses.length === 0 ? (
                <p className="analytics-empty-text">No weakness data yet.</p>
            ) : (
                <ol className="ranked-list">
                    {weaknesses.map((entry) => (
                        <li key={entry.weakness} className="ranked-item">
                            <span className="ranked-item-name">{entry.weakness}</span>
                            <span className="ranked-item-count">({entry.count})</span>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}
