"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteSession } from "../lib/actions/interviews";
import EmptyState from "./EmptyState";

type SessionData = {
    id: string;
    role: string;
    date: string;
    status: string;
    score: number | null;
    createdAt: string;
};

type SortOrder = "newest" | "oldest";

export default function HistoryList({ initialSessions }: { initialSessions: SessionData[] }) {
    const router = useRouter();
    const [sessions, setSessions] = useState(initialSessions);
    const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
    const [deletingId, setDeletingId] = useState<string | null>(null);
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
        if (!window.confirm("Are you sure you want to delete this interview session? This action cannot be undone.")) {
            return;
        }

        setDeletingId(sessionId);
        setError("");
        
        try {
            const result = await deleteSession(sessionId);
            console.log("Delete result:", result);
            setSessions(sessions.filter(s => s.id !== sessionId));
            // Refresh the page data from the server to ensure consistency
            router.refresh();
        } catch (err) {
            console.error("Failed to delete session:", err);
            setError(err instanceof Error ? err.message : "Failed to delete session");
            // Don't update local state if deletion failed
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <label htmlFor="sort-order">Sort by:</label>
                <select
                    id="sort-order"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                    style={{
                        padding: "0.5rem",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                        backgroundColor: "white",
                        cursor: "pointer"
                    }}
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                </select>
            </div>

            {error && <div className="error-message">{error}</div>}

            {sortedSessions.length === 0 ? (
                <EmptyState
                    title="No interview history yet"
                    description="You haven't completed any interviews yet. Start your first mock interview to see your progress here."
                    actionText="Start your first interview"
                    actionHref="/interview"
                />
            ) : (
                <ul className="history-list">
                    {sortedSessions.map((session, index) => {
                        const delta = computeDelta(index);
                        const isDeleting = deletingId === session.id;
                        
                        return (
                            <li key={session.id} className="history-item">
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                                    <div style={{ flex: 1 }}>
                                        <Link href={`/session/${session.id}`}>
                                            {session.role} — {session.date}
                                        </Link>
                                        {session.score !== null && (
                                            <span className="history-score">{session.score}/10</span>
                                        )}
                                        {delta !== null && delta !== 0 && (
                                            <span className={`history-delta ${delta > 0 ? "history-delta-positive" : "history-delta-negative"}`}>
                                                {delta > 0 ? `+${delta}` : delta} vs prior {session.role}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleDelete(session.id)}
                                        disabled={isDeleting}
                                        style={{
                                            padding: "0.5rem 1rem",
                                            backgroundColor: "#dc3545",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: isDeleting ? "not-allowed" : "pointer",
                                            opacity: isDeleting ? 0.6 : 1,
                                            marginLeft: "1rem"
                                        }}
                                    >
                                        {isDeleting ? "Deleting..." : "Delete"}
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
