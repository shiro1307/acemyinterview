type FeedbackJoin =
    | { overall_score: number; evaluation_json?: unknown }[]
    | { overall_score: number; evaluation_json?: unknown }
    | null;

type RolesJoin = { name: string }[] | { name: string } | null;

export function getJoinedFeedback<T extends { overall_score: number }>(
    feedback: T[] | T | null
): T | null {
    if (!feedback) return null;
    if (Array.isArray(feedback)) return feedback[0] ?? null;
    return feedback;
}

export function getJoinedScore(
    feedback: { overall_score: number }[] | { overall_score: number } | null
): number | null {
    const joined = getJoinedFeedback(feedback);
    return joined?.overall_score ?? null;
}

export function getJoinedRoleName(roles: RolesJoin, fallback: string): string {
    const roleName = Array.isArray(roles) ? roles[0]?.name : roles?.name;
    return roleName || fallback || "Unknown Role";
}

export type { FeedbackJoin, RolesJoin };
