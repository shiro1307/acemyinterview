import { Completeness } from "@/app/types";
import { SHORT_ANSWER_WORD_THRESHOLD } from "./constants";

function wordCount(text: string): number {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
}

export function computeCompleteness(
    questionIds: string[],
    answers: { question_id: string; text: string }[]
): Completeness {
    const answerMap = Object.fromEntries(answers.map((a) => [a.question_id, a.text]));
    const questionsTotal = questionIds.length;

    let questionsAnswered = 0;
    let shortAnswerCount = 0;

    for (const id of questionIds) {
        const text = answerMap[id]?.trim() ?? "";
        if (text.length > 0) {
            questionsAnswered++;
            if (wordCount(text) < SHORT_ANSWER_WORD_THRESHOLD) {
                shortAnswerCount++;
            }
        }
    }

    let signal: Completeness["signal"] = "complete";
    const majorityShort = questionsAnswered > 0 && shortAnswerCount > questionsAnswered / 2;
    const answeredRatio = questionsTotal > 0 ? questionsAnswered / questionsTotal : 0;

    if (answeredRatio < 0.5 || majorityShort) {
        signal = "minimal_effort";
    } else if (questionsAnswered < questionsTotal || shortAnswerCount >= 2) {
        signal = "partial";
    }

    return { questionsTotal, questionsAnswered, shortAnswerCount, signal };
}
