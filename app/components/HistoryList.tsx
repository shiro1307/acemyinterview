"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteSession } from "../lib/actions/interviews";
import EmptyState from "./EmptyState";
import PageHeader from "./PageHeader";
import ConfirmDialog from "./ConfirmDialog";

type SessionData = {
    id: string;
    role: string;
    date: string;
    status: string;
    score: number | null;
    createdAt: string;
};

type SortOrder = "newest" | "oldest";

function getScoreBandClass(score: number | null): string {
    if (score === null) return "";
    if (score >= 7) return "history-score-badge--high";
    if (score >= 5) return "history-score-badge--mid";
    return "history-score-badge--low";
}

function formatStatus(status: string): string {
    if (status === "completed") return "Completed";
    if (status === "active") return "In progress";
    if (status === "abandoned") return "Abandoned";
    return status;
}

function getStatusClass(status: string): string {
    if (status === "completed") return "history-status-badge--completed";
    if (status === "active") return "history-status-badge--active";
    return "history-status-badge--other";
}

export default function HistoryList({ initialSessions }: { initialSessions: SessionData[] }) {
    const router = useRouter();
    const [sessions, setSessions] = useState(initialSessions);
    const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmSessionId, setConfirmSessionId] = useState<string | null>(null);
    const [error, setError] = useState<string>("");

    const sortedSessions = [...sessions].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    function computeDelta(index: number): number | null {
        const current = sortedSessions[index];
        if (current.score === null) return null;

        for (let i = index + 1; i < sortedSessions.length; i++) {
            if (sortedSessions[i].role === current.role && sortedSessions[i].score !== null) {
                return current.score - sortedSessions[i].score!;
            }
        }
        return null;
    }

    const handleDelete = async (sessionId: string) => {
        setDeletingId(sessionId);
        setError("");

        try {
            await deleteSession(sessionId);
            setSessions(sessions.filter((s) => s.id !== sessionId));
            setConfirmSessionId(null);
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete session");
        } finally {
            setDeletingId(null);
        }
    };

    const sortControl = (
        <div className="history-toolbar">
            <label htmlFor="sort-order" className="history-sort-label">
                Sort by
            </label>
            <select
                id="sort-order"
                className="history-sort-select"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
            </select>
        </div>
    );

    return (
        <div>
            <PageHeader title="Interview History" actions={sortedSessions.length > 0 ? sortControl : undefined} />

            {error && <div className="error-message">{error}</div>}

            {sortedSessions.length === 0 ? (
                <EmptyState
                    title="No interview history yet"
                    description="You haven't completed any interviews yet. Start your first mock interview to see your progress here."
                    actionText="Start your first interview"
                    actionHref="/interview"
                    secondaryAction={{ text: "View dashboard", href: "/dashboard" }}
                />
            ) : (
                <ul className="history-list">
                    {sortedSessions.map((session, index) => {
                        const delta = computeDelta(index);
                        const isDeleting = deletingId === session.id;

                        return (
                            <li
                                key={session.id}
                                className="history-card"
                                style={{ "--i": index } as React.CSSProperties}
                            >
                                <Link href={`/session/${session.id}`} className="history-card-link">
                                    <div className="history-card-header">
                                        <h2 className="history-card-role">{session.role}</h2>
                                        {session.score !== null && (
                                            <span
                                                className={`history-score-badge ${getScoreBandClass(session.score)}`}
                                            >
                                                {session.score}/10
                                            </span>
                                        )}
                                    </div>
                                    <div className="history-card-meta">
                                        <span>{session.date}</span>
                                        <span className="history-meta-separator">·</span>
                                        <span className={`history-status-badge ${getStatusClass(session.status)}`}>
                                            {formatStatus(session.status)}
                                        </span>
                                    </div>
                                    {delta !== null && delta !== 0 && (
                                        <span
                                            className={`history-delta ${
                                                delta > 0 ? "history-delta-positive" : "history-delta-negative"
                                            }`}
                                        >
                                            {delta > 0 ? `+${delta}` : delta} vs prior {session.role}
                                        </span>
                                    )}
                                </Link>
                                <div className="history-card-actions">
                                    <Link href={`/session/${session.id}`} className="history-review-link">
                                        Review →
                                    </Link>
                                    <button
                                        type="button"
                                        className={`history-delete-button ${isDeleting ? "loading" : ""}`}
                                        onClick={() => setConfirmSessionId(session.id)}
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? "Deleting..." : "Delete"}
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            <ConfirmDialog
                isOpen={confirmSessionId !== null}
                title="Delete interview session?"
                message="This will permanently delete this session and all associated answers and feedback. This action cannot be undone."
                confirmLabel="Delete session"
                onConfirm={() => confirmSessionId && handleDelete(confirmSessionId)}
                onCancel={() => setConfirmSessionId(null)}
                isLoading={deletingId !== null}
            />
        </div>
    );
}
