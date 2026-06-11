export default function ReviewSkeleton() {
    return (
        <div className="review-page">
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-review-meta" />

            <div className="card card-hero">
                <div className="skeleton skeleton-hero-score" />
                <div className="skeleton skeleton-hero-text" />
                <div className="skeleton skeleton-dimension-bar" />
                <div className="skeleton skeleton-dimension-bar" />
                <div className="skeleton skeleton-dimension-bar" />
            </div>

            <div className="feedback-grid">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="card">
                        <div className="skeleton skeleton-section-title" />
                        <div className="skeleton skeleton-list-row" />
                        <div className="skeleton skeleton-list-row" />
                    </div>
                ))}
            </div>

            {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="card">
                    <div className="skeleton skeleton-section-title" />
                    <div className="skeleton skeleton-list-row" />
                </div>
            ))}
        </div>
    );
}
