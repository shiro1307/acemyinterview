import { RoleStats } from "@/app/lib/analytics/types";
import { formatScore } from "@/app/lib/analytics/format";

export default function RolePerformance({ roles }: { roles: RoleStats[] }) {
    return (
        <section className="analytics-section card">
            <h2 className="card-title">Role Performance</h2>

            {roles.length === 0 ? (
                <p className="analytics-empty-text">No role performance data yet.</p>
            ) : (
                <ol className="ranked-list">
                    {roles.map((role) => (
                        <li key={role.role} className="ranked-item">
                            <span className="ranked-item-name">{role.role}</span>
                            <span className="ranked-item-meta">
                                {formatScore(role.averageScore)} ({role.count}{" "}
                                {role.count === 1 ? "interview" : "interviews"})
                            </span>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}
