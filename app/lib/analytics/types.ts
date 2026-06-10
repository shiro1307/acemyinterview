import { EvaluationJson } from "@/app/types";

export type ChartDataPoint = {
    label: string;
    value: number;
};

export type TrendSeries = {
    overall: ChartDataPoint[];
    communication: ChartDataPoint[];
    technicalDepth: ChartDataPoint[];
    problemSolving: ChartDataPoint[];
};

export type RoleStats = {
    role: string;
    count: number;
    averageScore: number;
};

export type WeaknessEntry = {
    weakness: string;
    count: number;
};

export type AnalyticsInsights = {
    currentAverage: number | null;
    recentImprovement: number | null;
    bestPerformingArea: string | null;
    mostPracticedRole: string | null;
};

export type AnalyticsSummary = {
    interviewsCompleted: number;
    averageScore: number | null;
    bestScore: number | null;
    totalPracticeTimeMs: number;
};

export type AnalyticsData = {
    summary: AnalyticsSummary;
    trends: TrendSeries;
    insights: AnalyticsInsights;
    rolePerformance: RoleStats[];
    weaknesses: WeaknessEntry[];
};

export type RawInterview = {
    id: string;
    role: string;
    roleName: string;
    createdAt: string;
    overallScore: number | null;
    evaluationJson: EvaluationJson | null;
    durationMs: number;
};
