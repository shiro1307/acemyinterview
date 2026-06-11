import Link from "next/link";
import { ReactNode } from "react";

interface PageHeaderProps {
    title: string;
    description?: string;
    backHref?: string;
    backLabel?: string;
    actions?: ReactNode;
}

export default function PageHeader({
    title,
    description,
    backHref,
    backLabel = "Back to history",
    actions,
}: PageHeaderProps) {
    return (
        <header className="page-header">
            <div className="page-header-main">
                {backHref && (
                    <Link href={backHref} className="page-header-back">
                        ← {backLabel}
                    </Link>
                )}
                <div className="page-header-text">
                    <h1>{title}</h1>
                    {description && <p className="page-header-description">{description}</p>}
                </div>
            </div>
            {actions && <div className="page-header-actions">{actions}</div>}
        </header>
    );
}
