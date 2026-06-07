import Link from "next/link";

interface EmptyStateProps {
    title: string;
    description: string;
    actionText?: string;
    actionHref?: string;
}

export default function EmptyState({
    title,
    description,
    actionText,
    actionHref
}: EmptyStateProps) {
    return (
        <div className="empty-state">
            <h2>{title}</h2>
            <p>{description}</p>
            {actionText && actionHref && (
                <Link href={actionHref}>
                    {actionText}
                </Link>
            )}
        </div>
    );
}
