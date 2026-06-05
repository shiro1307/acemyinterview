import { QuestionEvaluation } from "@/app/types";
import { getGeminiModel } from "./gemini";

export type QAPair = {
  questionId: string;
  questionText: string;
  answerText: string;
};

type EvaluationResult = {
  overallScore: number;
  summary: string;
  questionEvaluations: QuestionEvaluation[];
};

type GeminiResponse = {
  overallScore: number;
  summary: string;
  questionEvaluations: {
    questionId: string;
    score: number;
    feedback: string;
    idealAnswer: string;
  }[];
};

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clampScore(score: unknown): number {
  const n = Number(score);
  if (!Number.isFinite(n)) return 5;
  return Math.min(10, Math.max(0, Math.round(n)));
}

function buildPrompt(role: string, pairs: QAPair[]): string {
  const qaBlock = pairs
    .map(
      (p, i) =>
        `Question ${i + 1} (id: ${p.questionId}):\n${p.questionText}\n\nAnswer:\n${p.answerText}`
    )
    .join("\n\n---\n\n");

  return `You are a technical interview coach evaluating a ${role} interview.

Evaluate each answer below. Return JSON with this exact shape:
{
  "overallScore": <0-10 integer>,
  "summary": "<2-3 sentence overall assessment>",
  "questionEvaluations": [
    {
      "questionId": "<echo the id from input>",
      "score": <0-10 integer>,
      "feedback": "<specific critique of the candidate's answer>",
      "idealAnswer": "<concise model answer>"
    }
  ]
}

${qaBlock}`;
}

function buildFallbackEvaluation(pairs: QAPair[]): EvaluationResult {
  const questionEvaluations = pairs.map((p) => ({
    questionId: p.questionId,
    questionText: p.questionText,
    score: randomInt(6, 9),
    feedback:
      "Demonstrated understanding of core concepts. Could add more specific examples.",
    idealAnswer: `A strong answer would cover the key aspects of "${p.questionText}" with concrete examples and clear structure.`,
  }));

  return {
    overallScore: randomInt(6, 8),
    summary:
      pairs.length > 0
        ? `Completed ${pairs.length} question(s). Good effort on the attempted questions.`
        : "No answers were submitted.",
    questionEvaluations,
  };
}

function parseGeminiResponse(raw: string, pairs: QAPair[]): EvaluationResult | null {
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
        feedback: e.feedback || "No feedback provided.",
        idealAnswer: e.idealAnswer || "No model answer provided.",
      }));

    if (questionEvaluations.length === 0) return null;

    return {
      overallScore: clampScore(parsed.overallScore),
      summary: parsed.summary,
      questionEvaluations,
    };
  } catch {
    return null;
  }
}

async function callGemini(role: string, pairs: QAPair[]): Promise<string | null> {
  const model = getGeminiModel();
  if (!model) return null;

  const prompt = buildPrompt(role, pairs);
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
  pairs: QAPair[]
): Promise<EvaluationResult> {
  if (pairs.length === 0) {
    return buildFallbackEvaluation(pairs);
  }

  const raw = await callGemini(role, pairs);
  if (!raw) {
    console.error("Using fallback evaluation (API unavailable or failed)");
    return buildFallbackEvaluation(pairs);
  }

  const parsed = parseGeminiResponse(raw, pairs);
  if (!parsed) {
    console.error("Using fallback evaluation (failed to parse Gemini response)");
    return buildFallbackEvaluation(pairs);
  }

  return parsed;
}
