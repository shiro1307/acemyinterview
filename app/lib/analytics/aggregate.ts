import { EvaluationJson } from "@/app/types";
import {
    AnalyticsData,
    AnalyticsInsights,
    AnalyticsSummary,
    ChartDataPoint,
    RawInterview,
    RoleStats,
    TrendSeries,
    WeaknessEntry,
} from "./types";

const DIMENSION_LABELS: Record<string, string> = {
    communication: "Communication",
    technicalDepth: "Technical Depth",
    problemSolving: "Problem Solving",
};

function average(values: number[]): number | null {
    if (values.length === 0) return null;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function buildTrendSeries(
    interviews: RawInterview[],
    getValue: (interview: RawInterview) => number | null
): ChartDataPoint[] {
    const points: ChartDataPoint[] = [];
    let index = 0;

    for (const interview of interviews) {
        const value = getValue(interview);
        if (value === null) continue;
        index += 1;
        points.push({
            label: `Interview ${index}`,
            value,
        });
    }

    return points;
}

function computeSummary(interviews: RawInterview[]): AnalyticsSummary {
    const scores = interviews
        .map((i) => i.overallScore)
        .filter((s): s is number => s !== null);

    return {
        interviewsCompleted: interviews.length,
        averageScore: average(scores),
        bestScore: scores.length > 0 ? Math.max(...scores) : null,
        totalPracticeTimeMs: interviews.reduce((sum, i) => sum + i.durationMs, 0),
    };
}

function computeTrends(interviews: RawInterview[]): TrendSeries {
    const withOverall = interviews.filter((i) => i.overallScore !== null);
    const withDimensions = interviews.filter(
        (i) => i.evaluationJson?.version === 2 && i.evaluationJson.dimensions
    );

    return {
        overall: buildTrendSeries(withOverall, (i) => i.overallScore),
        communication: buildTrendSeries(withDimensions, (i) =>
            i.evaluationJson?.dimensions.communication ?? null
        ),
        technicalDepth: buildTrendSeries(withDimensions, (i) =>
            i.evaluationJson?.dimensions.technicalDepth ?? null
        ),
        problemSolving: buildTrendSeries(withDimensions, (i) =>
            i.evaluationJson?.dimensions.problemSolving ?? null
        ),
    };
}

function computeRecentImprovement(scores: number[]): number | null {
    if (scores.length < 6) return null;

    const recent = scores.slice(-5);
    const previous = scores.slice(-10, -5);

    if (previous.length < 5) return null;

    const recentAvg = average(recent);
    const previousAvg = average(previous);

    if (recentAvg === null || previousAvg === null || previousAvg === 0) return null;

    return ((recentAvg - previousAvg) / previousAvg) * 100;
}

function computeBestPerformingArea(interviews: RawInterview[]): string | null {
    const v2Interviews = interviews.filter((i) => i.evaluationJson?.version === 2);

    if (v2Interviews.length === 0) return null;

    const dimensionAverages = {
        communication: average(
            v2Interviews.map((i) => i.evaluationJson!.dimensions.communication)
        ),
        technicalDepth: average(
            v2Interviews.map((i) => i.evaluationJson!.dimensions.technicalDepth)
        ),
        problemSolving: average(
            v2Interviews.map((i) => i.evaluationJson!.dimensions.problemSolving)
        ),
    };

    let bestKey: string | null = null;
    let bestValue = -1;

    for (const [key, value] of Object.entries(dimensionAverages)) {
        if (value !== null && value > bestValue) {
            bestValue = value;
            bestKey = key;
        }
    }

    return bestKey ? DIMENSION_LABELS[bestKey] : null;
}

function computeMostPracticedRole(interviews: RawInterview[]): string | null {
    if (interviews.length === 0) return null;

    const counts = new Map<string, number>();

    for (const interview of interviews) {
        counts.set(interview.roleName, (counts.get(interview.roleName) ?? 0) + 1);
    }

    let bestRole: string | null = null;
    let bestCount = 0;

    for (const [role, count] of counts) {
        if (count > bestCount) {
            bestCount = count;
            bestRole = role;
        }
    }

    return bestRole;
}

function computeInsights(interviews: RawInterview[], summary: AnalyticsSummary): AnalyticsInsights {
    const scores = interviews
        .map((i) => i.overallScore)
        .filter((s): s is number => s !== null);

    return {
        currentAverage: summary.averageScore,
        recentImprovement: computeRecentImprovement(scores),
        bestPerformingArea: computeBestPerformingArea(interviews),
        mostPracticedRole: computeMostPracticedRole(interviews),
    };
}

function computeRolePerformance(interviews: RawInterview[]): RoleStats[] {
    const byRole = new Map<string, { scores: number[]; count: number }>();

    for (const interview of interviews) {
        if (interview.overallScore === null) continue;

        const existing = byRole.get(interview.roleName) ?? { scores: [], count: 0 };
        existing.scores.push(interview.overallScore);
        existing.count += 1;
        byRole.set(interview.roleName, existing);
    }

    return Array.from(byRole.entries())
        .map(([role, data]) => ({
            role,
            count: data.count,
            averageScore: average(data.scores) ?? 0,
        }))
        .sort((a, b) => b.averageScore - a.averageScore);
}

function computeWeaknesses(interviews: RawInterview[]): WeaknessEntry[] {
    const counts = new Map<string, number>();

    for (const interview of interviews) {
        if (interview.evaluationJson?.version !== 2) continue;

        for (const weakness of interview.evaluationJson.weaknesses) {
            const trimmed = weakness.trim();
            if (!trimmed) continue;
            counts.set(trimmed, (counts.get(trimmed) ?? 0) + 1);
        }
    }

    return Array.from(counts.entries())
        .map(([weakness, count]) => ({ weakness, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
}

export function aggregateAnalytics(interviews: RawInterview[]): AnalyticsData {
    const summary = computeSummary(interviews);

    return {
        summary,
        trends: computeTrends(interviews),
        insights: computeInsights(interviews, summary),
        rolePerformance: computeRolePerformance(interviews),
        weaknesses: computeWeaknesses(interviews),
    };
}

export function parseEvaluationJson(json: unknown): EvaluationJson | null {
    if (!json || typeof json !== "object") return null;
    const obj = json as EvaluationJson;
    if (obj.version !== 2) return null;
    return obj;
}

export function computeSessionDurationMs(
    answers: { created_at: string }[]
): number {
    if (answers.length < 2) return 0;

    const first = new Date(answers[0].created_at).getTime();
    const last = new Date(answers[answers.length - 1].created_at).getTime();

    return Math.max(0, last - first);
}
