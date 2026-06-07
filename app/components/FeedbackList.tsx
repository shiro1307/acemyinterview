import MarkdownRenderer from "@/app/components/MarkdownRenderer";

interface FeedbackListProps {
    title: string;
    items: string[];
    className?: string;
    emptyMessage?: string;
}

export default function FeedbackList({ title, items, className = "", emptyMessage }: FeedbackListProps) {
    // If no emptyMessage provided and items are empty, don't render at all (original behavior)
    if (items.length === 0 && !emptyMessage) return null;

    return (
        <div className={`card ${className}`.trim()}>
            <h3 className="card-title">{title}</h3>
            {items.length === 0 ? (
                <p style={{ color: "#666", fontStyle: "italic", margin: "8px 0" }}>
                    {emptyMessage}
                </p>
            ) : (
                <ul className="feedback-list">
                    {items.map((item, index) => (
                        <li key={index}>
                            <MarkdownRenderer content={item} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
