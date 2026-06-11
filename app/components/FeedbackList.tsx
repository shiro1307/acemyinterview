import MarkdownRenderer from "@/app/components/MarkdownRenderer";

interface FeedbackListProps {
    title: string;
    items: string[];
    className?: string;
    emptyMessage?: string;
}

export default function FeedbackList({ title, items, className = "", emptyMessage }: FeedbackListProps) {
    if (items.length === 0 && !emptyMessage) return null;

    return (
        <div className={`card ${className}`.trim()}>
            <h3 className="card-title">{title}</h3>
            {items.length === 0 ? (
                <p className="feedback-list-empty">{emptyMessage}</p>
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
