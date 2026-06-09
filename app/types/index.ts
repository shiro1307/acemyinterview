export type Question = {
    id: string;
    text: string;
    answer: string;
};

export type SessionQuestion = {
    id: string;
    session_id: string;
    question_id: string;
    order_index: number;
};

export type Session = {
    id: string;
    role: string; // Deprecated: use role_id
    role_id: string;
    status: "active" | "completed" | "abandoned";
    questions: Question[];
};

export type RoleDifficulty = "entry" | "mid" | "senior" | "staff";

export type Role = {
    id: string;
    name: string;
    slug: string;
    description?: string;
    difficulty?: RoleDifficulty;
    is_active: boolean;
    created_at: string;
};

export const QUESTION_TAGS = [
    "good_structure",
    "strong_examples",
    "correct_core",
    "too_shallow",
    "missed_edge_case",
    "factually_incorrect",
    "unclear_explanation",
    "incomplete",
] as const;

export type QuestionTag = (typeof QUESTION_TAGS)[number];

export const VERDICTS = [
    "strong_pass",
    "pass",
    "borderline",
    "needs_work",
    "not_ready",
] as const;

export type Verdict = (typeof VERDICTS)[number];

export type CompletenessSignal = "complete" | "partial" | "minimal_effort";

export type Completeness = {
    questionsTotal: number;
    questionsAnswered: number;
    shortAnswerCount: number;
    signal: CompletenessSignal;
};

export type DimensionScores = {
    communication: number;
    technicalDepth: number;
    problemSolving: number;
};

export type QuestionEvaluation = {
    questionId: string;
    questionText: string;
    score: number;
    whatWorked: string;
    whatMissed: string;
    howToImprove: string;
    idealAnswer: string;
    tags: QuestionTag[];
    conceptsMentioned: string[];
    conceptsMissed: string[];
};

export type EvaluationJson = {
    version: 2;
    dimensions: DimensionScores;
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
    verdict: Verdict;
    verdictRationale: string;
    studyTopics: string[];
    completeness: Completeness;
    questionEvaluations: QuestionEvaluation[];
};

export type SessionFeedback = {
    id: string;
    session_id: string;
    overall_score: number;
    summary: string;
    evaluation_json: EvaluationJson;
    created_at: string;
};
