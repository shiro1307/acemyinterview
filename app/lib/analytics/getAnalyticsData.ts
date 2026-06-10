import { createClient } from "@/app/lib/supabase/server";
import {
    aggregateAnalytics,
    computeSessionDurationMs,
    parseEvaluationJson,
} from "./aggregate";
import { AnalyticsData, RawInterview } from "./types";

type SessionRow = {
    id: string;
    role: string;
    created_at: string;
    feedback:
        | { overall_score: number; evaluation_json: unknown }[]
        | { overall_score: number; evaluation_json: unknown }
        | null;
    roles?: { name: string }[] | { name: string } | null;
};

function getFeedback(
    feedback: SessionRow["feedback"]
): { overall_score: number; evaluation_json: unknown } | null {
    if (!feedback) return null;
    if (Array.isArray(feedback)) return feedback[0] ?? null;
    return feedback;
}

function getRoleName(session: SessionRow): string {
    const roleName = Array.isArray(session.roles)
        ? session.roles[0]?.name
        : session.roles?.name;
    return roleName || session.role || "Unknown Role";
}

export async function getAnalyticsData(
    userId: string
): Promise<{ data: AnalyticsData | null; error: string | null }> {
    const supabase = await createClient();

    const { data: sessions, error: sessionsError } = await supabase
        .from("sessions")
        .select(
            "id, role, created_at, feedback(overall_score, evaluation_json), roles(name)"
        )
        .eq("user_id", userId)
        .eq("status", "completed")
        .not("feedback", "is", null)
        .order("created_at", { ascending: true });

    if (sessionsError) {
        return { data: null, error: sessionsError.message };
    }

    const sessionRows = (sessions as SessionRow[]) ?? [];

    if (sessionRows.length === 0) {
        return {
            data: aggregateAnalytics([]),
            error: null,
        };
    }

    const sessionIds = sessionRows.map((s) => s.id);

    const { data: answersData, error: answersError } = await supabase
        .from("answers")
        .select("session_id, created_at")
        .in("session_id", sessionIds)
        .order("created_at", { ascending: true });

    if (answersError) {
        return { data: null, error: answersError.message };
    }

    const answersBySession = new Map<string, { created_at: string }[]>();

    for (const answer of answersData ?? []) {
        const existing = answersBySession.get(answer.session_id) ?? [];
        existing.push({ created_at: answer.created_at });
        answersBySession.set(answer.session_id, existing);
    }

    const interviews: RawInterview[] = sessionRows.flatMap((session) => {
        const feedback = getFeedback(session.feedback);
        if (!feedback) return [];

        const evaluationJson = parseEvaluationJson(feedback.evaluation_json);
        const sessionAnswers = answersBySession.get(session.id) ?? [];

        return [
            {
                id: session.id,
                role: session.role,
                roleName: getRoleName(session),
                createdAt: session.created_at,
                overallScore: feedback.overall_score ?? null,
                evaluationJson,
                durationMs: computeSessionDurationMs(sessionAnswers),
            },
        ];
    });

    return {
        data: aggregateAnalytics(interviews),
        error: null,
    };
}
