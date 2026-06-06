interface FeedbackListProps {
    title: string;
    items: string[];
    className?: string;
}

export default function FeedbackList({ title, items, className = "" }: FeedbackListProps) {
    if (items.length === 0) return null;

    return (
        <div className={`card ${className}`.trim()}>
            <h3 className="card-title">{title}</h3>
            <ul className="feedback-list">
                {items.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    );
}
