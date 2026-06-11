import Link from "next/link";

interface EmptyStateAction {
    text: string;
    href: string;
}

interface EmptyStateProps {
    title: string;
    description: string;
    actionText?: string;
    actionHref?: string;
    secondaryAction?: EmptyStateAction;
}

export default function EmptyState({
    title,
    description,
    actionText,
    actionHref,
    secondaryAction,
}: EmptyStateProps) {
    return (
        <div className="empty-state">
            <h2>{title}</h2>
            <p>{description}</p>
            {(actionText && actionHref) || secondaryAction ? (
                <div className="empty-state-actions">
                    {actionText && actionHref && (
                        <Link href={actionHref} className="empty-state-primary">
                            {actionText}
                        </Link>
                    )}
                    {secondaryAction && (
                        <Link href={secondaryAction.href} className="empty-state-secondary">
                            {secondaryAction.text}
                        </Link>
                    )}
                </div>
            ) : null}
        </div>
    );
}
