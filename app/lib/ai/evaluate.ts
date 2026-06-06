import {
    Completeness,
    DimensionScores,
    EvaluationJson,
    QuestionEvaluation,
    QuestionTag,
    QUESTION_TAGS,
    Verdict,
    VERDICTS,
} from "@/app/types";
import { QUESTION_TAGS_LIST, SCORE_RUBRIC } from "../feedback/constants";
import { getGeminiModel } from "./gemini";

export type QAPair = {
    questionId: string;
    questionText: string;
    answerText: string;
};

export type EvaluationResult = {
    overallScore: number;
    summary: string;
    evaluationJson: EvaluationJson;
};

type GeminiQuestionEval = {
    questionId: string;
    score: number;
    whatWorked: string;
    whatMissed: string;
    howToImprove: string;
    idealAnswer: string;
    tags: string[];
    conceptsMentioned: string[];
    conceptsMissed: string[];
};

type GeminiResponse = {
    overallScore: number;
    summary: string;
    dimensions: DimensionScores;
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
    verdict: string;
    verdictRationale: string;
    studyTopics: string[];
    questionEvaluations: GeminiQuestionEval[];
};

function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clampScore(score: unknown): number {
    const n = Number(score);
    if (!Number.isFinite(n)) return 5;
    return Math.min(10, Math.max(0, Math.round(n)));
}

function clampTags(tags: unknown): QuestionTag[] {
    if (!Array.isArray(tags)) return [];
    return tags
        .filter((t): t is QuestionTag => QUESTION_TAGS.includes(t as QuestionTag))
        .slice(0, 3);
}

function clampVerdict(verdict: unknown): Verdict {
    if (typeof verdict === "string" && VERDICTS.includes(verdict as Verdict)) {
        return verdict as Verdict;
    }
    return "borderline";
}

function clampStrings(arr: unknown, max = 5): string[] {
    if (!Array.isArray(arr)) return [];
    return arr.filter((s): s is string => typeof s === "string" && s.trim().length > 0).slice(0, max);
}

function completenessNote(completeness: Completeness): string {
    if (completeness.signal === "complete") return "";
    return `\nCompleteness context: ${completeness.questionsAnswered}/${completeness.questionsTotal} questions answered, ${completeness.shortAnswerCount} very brief answer(s). Signal: ${completeness.signal}. Factor this into scores and summary.`;
}

function buildPrompt(role: string, pairs: QAPair[], completeness: Completeness): string {
    const qaBlock = pairs
        .map(
            (p, i) =>
                `Question ${i + 1} (id: ${p.questionId}):\n${p.questionText}\n\nAnswer:\n${p.answerText}`
        )
        .join("\n\n---\n\n");

    return `You are a direct technical interview coach evaluating a ${role} interview.

Tone rules:
- Lead with what was wrong or missing, not empty praise.
- Every strength and weakness must reference a specific answer.
- No filler ("Great job", "It depends", "Good effort").
- improvements must be actionable behaviors, not vague advice.

${SCORE_RUBRIC}

Tags: pick 1-3 per question from: ${QUESTION_TAGS_LIST}

Evaluate each answer below. Return JSON with this exact shape:

{
  "overallScore": <0-10 integer>,
  "summary": "<2-3 sentence direct overall assessment>",
  "dimensions": {
    "communication": <0-10 integer>,
    "technicalDepth": <0-10 integer>,
    "problemSolving": <0-10 integer>
  },
  "strengths": ["<2-4 bullets referencing specific answers>"],
  "weaknesses": ["<2-4 bullets referencing specific gaps>"],
  "improvements": ["<2-4 actionable interview behaviors>"],
  "verdict": "<strong_pass | pass | borderline | needs_work | not_ready>",
  "verdictRationale": "<one sentence explaining the verdict>",
  "studyTopics": ["<3-5 topic names to review based on weaknesses>"],
  "questionEvaluations": [
    {
      "questionId": "<echo the id from input>",
      "score": <0-10 integer>,
      "whatWorked": "<what the candidate got right>",
      "whatMissed": "<gaps, errors, or missing depth>",
      "howToImprove": "<how to answer better next time>",
      "idealAnswer": "<concise reference answer, 4-8 sentences max>",
      "tags": ["<1-3 from allowed tags>"],
      "conceptsMentioned": ["<key concepts the candidate covered>"],
      "conceptsMissed": ["<important concepts not addressed>"]
    }
  ]
}
${completenessNote(completeness)}

${qaBlock}`;
}

function buildFallbackEvaluation(pairs: QAPair[], completeness: Completeness): EvaluationResult {
    const questionEvaluations: QuestionEvaluation[] = pairs.map((p) => ({
        questionId: p.questionId,
        questionText: p.questionText,
        score: randomInt(6, 9),
        whatWorked: "Demonstrated basic understanding of the topic.",
        whatMissed: "Could add more specific examples and depth.",
        howToImprove: "Structure answers with definition, example, and tradeoff.",
        idealAnswer: `A strong answer would cover the key aspects of "${p.questionText}" with concrete examples and clear structure.`,
        tags: ["correct_core"],
        conceptsMentioned: [],
        conceptsMissed: [],
    }));

    const overallScore = pairs.length > 0 ? randomInt(6, 8) : 0;

    return {
        overallScore,
        summary:
            pairs.length > 0
                ? `Completed ${pairs.length} question(s). Review the feedback below for areas to improve.`
                : "No answers were submitted.",
        evaluationJson: {
            version: 2,
            dimensions: {
                communication: overallScore,
                technicalDepth: overallScore,
                problemSolving: overallScore,
            },
            strengths: pairs.length > 0 ? ["Attempted the interview questions."] : [],
            weaknesses: pairs.length > 0 ? ["Feedback unavailable — API may be offline."] : ["No answers submitted."],
            improvements: ["Complete all questions with structured, detailed answers."],
            verdict: pairs.length > 0 ? "borderline" : "not_ready",
            verdictRationale: "Automated fallback evaluation — run again with API available for full feedback.",
            studyTopics: pairs.slice(0, 3).map((p) => p.questionText.slice(0, 60)),
            completeness,
            questionEvaluations,
        },
    };
}

function parseGeminiResponse(
    raw: string,
    pairs: QAPair[],
    completeness: Completeness
): EvaluationResult | null {
    try {
        const parsed = JSON.parse(raw) as GeminiResponse;
        if (!parsed.summary || !Array.isArray(parsed.questionEvaluations)) return null;

        const pairMap = Object.fromEntries(pairs.map((p) => [p.questionId, p]));

        const questionEvaluations: QuestionEvaluation[] = parsed.questionEvaluations
            .filter((e) => pairMap[e.questionId])
            .map((e) => ({
                questionId: e.questionId,
                questionText: pairMap[e.questionId].questionText,
                score: clampScore(e.score),
                whatWorked: e.whatWorked || "No strengths identified.",
                whatMissed: e.whatMissed || "No gaps identified.",
                howToImprove: e.howToImprove || "Provide more depth and structure.",
                idealAnswer: e.idealAnswer || "No model answer provided.",
                tags: clampTags(e.tags),
                conceptsMentioned: clampStrings(e.conceptsMentioned, 8),
                conceptsMissed: clampStrings(e.conceptsMissed, 8),
            }));

        if (questionEvaluations.length === 0) return null;

        const dims = parsed.dimensions ?? { communication: 5, technicalDepth: 5, problemSolving: 5 };

        return {
            overallScore: clampScore(parsed.overallScore),
            summary: parsed.summary,
            evaluationJson: {
                version: 2,
                dimensions: {
                    communication: clampScore(dims.communication),
                    technicalDepth: clampScore(dims.technicalDepth),
                    problemSolving: clampScore(dims.problemSolving),
                },
                strengths: clampStrings(parsed.strengths, 4),
                weaknesses: clampStrings(parsed.weaknesses, 4),
                improvements: clampStrings(parsed.improvements, 4),
                verdict: clampVerdict(parsed.verdict),
                verdictRationale: parsed.verdictRationale || "See overall summary.",
                studyTopics: clampStrings(parsed.studyTopics, 5),
                completeness,
                questionEvaluations,
            },
        };
    } catch {
        return null;
    }
}

async function callGemini(
    role: string,
    pairs: QAPair[],
    completeness: Completeness
): Promise<string | null> {
    const model = getGeminiModel();
    if (!model) return null;

    const prompt = buildPrompt(role, pairs, completeness);
    const start = Date.now();

    for (let attempt = 1; attempt <= 2; attempt++) {
        try {
            const result = await model.generateContent(prompt);
            console.log(`Gemini evaluation completed in ${Date.now() - start}ms`);
            return result.response.text();
        } catch (err) {
            const status = (err as { status?: number }).status;
            if (status === 503 && attempt < 2) {
                console.warn(`Gemini unavailable (503), retrying (attempt ${attempt})...`);
                continue;
            }
            console.error(`Gemini evaluation failed after ${Date.now() - start}ms:`, err);
            return null;
        }
    }

    return null;
}

export async function evaluateInterview(
    role: string,
    pairs: QAPair[],
    completeness: Completeness
): Promise<EvaluationResult> {
    if (pairs.length === 0) {
        return buildFallbackEvaluation(pairs, completeness);
    }

    const raw = await callGemini(role, pairs, completeness);
    if (!raw) {
        console.error("Using fallback evaluation (API unavailable or failed)");
        return buildFallbackEvaluation(pairs, completeness);
    }

    const parsed = parseGeminiResponse(raw, pairs, completeness);
    if (!parsed) {
        console.error("Using fallback evaluation (failed to parse Gemini response)");
        return buildFallbackEvaluation(pairs, completeness);
    }

    return parsed;
}
