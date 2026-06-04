"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import QuestionForm from "./QuestionForm";
import FeedbackList from "./FeedbackList";
import { Question } from "@/app/types";
import { submitAnswer } from "../lib/actions/interviews";

interface FeedbackState {
    score: number;
    strengths: string[];
    missing: string[];
    modelAnswer?: string;
}

export default function InterviewQuestions({ questions, sessionId }: { questions: Question[], sessionId: string }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [feedbackVisible, setFeedbackVisible] = useState(false);
    const [currentFeedback, setCurrentFeedback] = useState<FeedbackState | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const question = questions[currentIndex];
    const router = useRouter();

    async function handleAnswerSubmit(answerText: string) {
        setIsSubmitting(true);
        setSubmitError("");
        try {
            const feedback = await submitAnswer(sessionId, question.id, answerText);
            setCurrentFeedback({
                score: feedback.score,
                strengths: feedback.strengths,
                missing: feedback.missing,
                modelAnswer: feedback.modelAnswer,
            });
            setFeedbackVisible(true);
        } catch (error: unknown) {
            console.error("Failed to submit answer:", error);
            const errMsg = error instanceof Error ? error.message : "Something went wrong while submitting answer";
            setSubmitError(errMsg);
        } finally {
            setIsSubmitting(false);
        }
    }

    function nextQuestion() {
        setCurrentFeedback(null);
        setFeedbackVisible(false);
        setSubmitError("");
        setCurrentIndex((prev) => prev + 1);
    }

    function finishInterview() {
        router.push(`/session/${sessionId}`);
    }

    const isLastQuestion = (currentIndex === questions.length - 1);

    return (
        <div>
            {isSubmitting && <p>Evaluating your answer...</p>}
            {submitError && <p>Error: {submitError}</p>}

            {!feedbackVisible && !isSubmitting && (
                <QuestionForm
                    key={question.id}
                    questionNumber={currentIndex + 1}
                    questionText={question.text}
                    submitQuestion={handleAnswerSubmit}
                />
            )}

            {
                feedbackVisible && currentFeedback &&
                <div>
                    <h2>Feedback</h2>
                    <p>Score: {currentFeedback.score}/10</p>

                    <FeedbackList
                        title="Strengths"
                        items={currentFeedback.strengths}
                    />

                    <FeedbackList
                        title="Missing"
                        items={currentFeedback.missing}
                    />

                    {currentFeedback.modelAnswer && (
                        <div>
                            <h3>Model Answer Guide</h3>
                            <p>{currentFeedback.modelAnswer}</p>
                        </div>
                    )}
                </div>
            }

            {
                feedbackVisible &&
                <button
                    onClick={!isLastQuestion ? nextQuestion : finishInterview}
                >
                    {!isLastQuestion ? <>Next Question</> : <>Finish Interview</>}
                </button>
            }

        </div>
    );
}