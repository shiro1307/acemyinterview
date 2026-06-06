import { QuestionTag, Verdict } from "@/app/types";

export const SHORT_ANSWER_WORD_THRESHOLD = 20;

export const QUESTION_TAG_LABELS: Record<QuestionTag, string> = {
    good_structure: "Good structure",
    strong_examples: "Strong examples",
    correct_core: "Correct core",
    too_shallow: "Too shallow",
    missed_edge_case: "Missed edge case",
    factually_incorrect: "Factually incorrect",
    unclear_explanation: "Unclear explanation",
    incomplete: "Incomplete",
};

export const VERDICT_LABELS: Record<Verdict, string> = {
    strong_pass: "Strong pass",
    pass: "Pass",
    borderline: "Borderline",
    needs_work: "Needs work",
    not_ready: "Not ready",
};

export const SCORE_RUBRIC = `Scoring rubric (0-10 integers only):
0 — No substantive attempt, blank, or entirely incorrect.
1-2 — Serious misunderstanding; cannot demonstrate basic knowledge.
3-4 — Fragmentary; touches the topic but misses most required points.
5 — Partial; core idea present but incomplete, imprecise, or unstructured.
6 — Adequate; covers fundamentals with noticeable gaps in depth or clarity.
7 — Good; solid, mostly correct; minor omissions or weak examples.
8 — Strong; thorough, well-structured; addresses tradeoffs or edge cases.
9 — Excellent; near reference quality; clear, precise, interview-ready.
10 — Outstanding; exceptional depth, nuance, and communication (rare).

Calibration:
- 5 is "half-right", not a failure label.
- 7 = "would satisfy most interviewers" for that question.
- 8+ requires depth beyond a textbook definition.
- Reserve 9-10 for answers that need almost no improvement.
- overallScore should reflect the full session, not a simple average if one answer was critical.

Verdict mapping:
- strong_pass: 8-10 overall, no dimension below 6
- pass: 7+ overall, no dimension below 5
- borderline: 5-6 overall or one weak dimension
- needs_work: 3-4 overall
- not_ready: 0-2 overall`;

export const QUESTION_TAGS_LIST = Object.keys(QUESTION_TAG_LABELS).join(" | ");
