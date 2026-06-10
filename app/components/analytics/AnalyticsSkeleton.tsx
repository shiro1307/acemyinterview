export default function AnalyticsSkeleton() {
    return (
        <div className="analytics-page container">
            <div className="skeleton skeleton-title" />

            <div className="stats-grid">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="card stat-card">
                        <div className="skeleton skeleton-stat-value" />
                        <div className="skeleton skeleton-stat-label" />
                    </div>
                ))}
            </div>

            <div className="card analytics-section">
                <div className="skeleton skeleton-section-title" />
                <div className="skeleton skeleton-tabs" />
                <div className="skeleton skeleton-chart" />
                <div className="insights-grid">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="insight-item">
                            <div className="skeleton skeleton-insight-label" />
                            <div className="skeleton skeleton-insight-value" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="card analytics-section">
                <div className="skeleton skeleton-section-title" />
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton skeleton-list-row" />
                ))}
            </div>

            <div className="card analytics-section">
                <div className="skeleton skeleton-section-title" />
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="skeleton skeleton-list-row" />
                ))}
            </div>
        </div>
    );
}
