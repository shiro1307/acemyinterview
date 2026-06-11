export default function HistorySkeleton() {
    return (
        <div className="analytics-page container">
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-toolbar" />

            <div className="history-skeleton-list">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="card history-skeleton-card">
                        <div className="skeleton skeleton-history-role" />
                        <div className="skeleton skeleton-history-meta" />
                        <div className="skeleton skeleton-history-actions" />
                    </div>
                ))}
            </div>
        </div>
    );
}
