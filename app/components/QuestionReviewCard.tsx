import { QuestionEvaluation } from "@/app/types";
import { QUESTION_TAG_LABELS } from "@/app/lib/feedback/constants";
import MarkdownRenderer from "@/app/components/MarkdownRenderer";

export default function QuestionReviewCard({
    index,
    evaluation,
    userAnswer,
}: {
    index: number;
    evaluation: QuestionEvaluation;
    userAnswer: string | undefined;
}) {
    return (
        <div className="card">
            <div className="question-header">
                <h2 className="card-title">Question {index + 1}</h2>
                <span className="question-score">{evaluation.score}/10</span>
            </div>
            <p className="question-text">{evaluation.questionText}</p>

            {evaluation.tags.length > 0 && (
                <div className="chip-row">
                    {evaluation.tags.map((tag) => (
                        <span key={tag} className="chip chip-tag">{QUESTION_TAG_LABELS[tag]}</span>
                    ))}
                </div>
            )}

            <div className="feedback-section">
                <div><strong>What worked:</strong>
                    <MarkdownRenderer content={evaluation.whatWorked} />
                </div>

                <div><strong>What was missed:</strong>
                    <MarkdownRenderer content={evaluation.whatMissed} />
                </div>

                <div><strong>How to improve:</strong>
                    <MarkdownRenderer content={evaluation.howToImprove} />
                </div>
            </div>

            {(evaluation.conceptsMentioned.length > 0 || evaluation.conceptsMissed.length > 0) && (
                <div className="concepts">
                    {evaluation.conceptsMentioned.length > 0 && (
                        <div className="chip-row">
                            <span className="concepts-label">Covered:</span>
                            {evaluation.conceptsMentioned.map((c) => (
                                <span key={c} className="chip chip-covered">{c}</span>
                            ))}
                        </div>
                    )}
                    {evaluation.conceptsMissed.length > 0 && (
                        <div className="chip-row">
                            <span className="concepts-label">Missing:</span>
                            {evaluation.conceptsMissed.map((c) => (
                                <span key={c} className="chip chip-missed">{c}</span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <blockquote className="user-answer">
                {userAnswer ?? "No answer submitted."}
            </blockquote>

            <details>
                <summary>Reference answer</summary>
                <div className="ideal-answer">
                    <MarkdownRenderer content={evaluation.idealAnswer} />
                </div>
            </details>
        </div>
    );
}
