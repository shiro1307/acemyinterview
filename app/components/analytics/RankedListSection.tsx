interface RankedListItem {
    name: string;
    meta: string;
}

interface RankedListSectionProps {
    title: string;
    emptyText: string;
    items: RankedListItem[];
}

export default function RankedListSection({ title, emptyText, items }: RankedListSectionProps) {
    return (
        <section className="analytics-section card">
            <h2 className="card-title">{title}</h2>

            {items.length === 0 ? (
                <p className="analytics-empty-text">{emptyText}</p>
            ) : (
                <ol className="ranked-list">
                    {items.map((item) => (
                        <li key={item.name} className="ranked-item">
                            <span className="ranked-item-name">{item.name}</span>
                            <span className="ranked-item-meta">{item.meta}</span>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}
