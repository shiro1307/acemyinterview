interface FeedbackListProps {
    title: string;
    items: string[];
}

export default function FeedbackList({ title, items }: FeedbackListProps) {
    return (
        <div>
            <h3>{title}</h3>
            <ul>
                {items.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    );
}
