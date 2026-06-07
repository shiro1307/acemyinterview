"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import QuestionForm from "./QuestionForm";
import { Question } from "@/app/types";
import { submitAnswer, completeInterview } from "../lib/actions/interviews";
import InterviewTimer from "./InterviewTimer";

export default function InterviewQuestions({ questions, sessionId }: { questions: Question[], sessionId: string }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const question = questions[currentIndex];
    const isLastQuestion = currentIndex === questions.length - 1;
    const router = useRouter();

    async function handleSkipQuestion() {
        if (!isLastQuestion) {
            setCurrentIndex((prev) => prev + 1);
        }
    }

    async function handleAnswerSubmit(answerText: string) {
        setIsSubmitting(true);
        setSubmitError("");
        try {
            await submitAnswer(sessionId, question.id, answerText);

            if (!isLastQuestion) {
                setCurrentIndex((prev) => prev + 1);
            }
        } catch (error: unknown) {
            console.error("Failed to submit answer:", error);
            const errMsg = error instanceof Error ? error.message : "Something went wrong while submitting answer";
            setSubmitError(errMsg);
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleFinishInterview(answerText: string) {
        setIsSubmitting(true);
        setSubmitError("");
        try {
            // Submit the last answer first
            await submitAnswer(sessionId, question.id, answerText);

            // Then complete the interview (generates feedback + redirects)
            setIsFinishing(true);
            await completeInterview(sessionId);
        } catch (error: unknown) {
            // redirect() throws a NEXT_REDIRECT error — let it propagate
            if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
                throw error;
            }
            console.error("Failed to finish interview:", error);
            const errMsg = error instanceof Error ? error.message : "Something went wrong";
            setSubmitError(errMsg);
            setIsFinishing(false);
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleSkipAndFinish() {
        setIsFinishing(true);
        setSubmitError("");
        try {
            await completeInterview(sessionId);
        } catch (error: unknown) {
            if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
                throw error;
            }
            console.error("Failed to finish interview:", error);
            const errMsg = error instanceof Error ? error.message : "Something went wrong";
            setSubmitError(errMsg);
            setIsFinishing(false);
        }
    }

    if (isFinishing) {
        return <p>Finishing interview and generating results...</p>;
    }

    return (
        <div>
            <InterviewTimer />
            
            {isSubmitting && <p>Submitting...</p>}
            {submitError && <p>Error: {submitError}</p>}

            {!isSubmitting && (
                <QuestionForm
                    key={question.id}
                    questionNumber={currentIndex + 1}
                    totalQuestions={questions.length}
                    questionText={question.text}
                    submitQuestion={handleAnswerSubmit}
                    isLastQuestion={isLastQuestion}
                    onFinishInterview={handleFinishInterview}
                    onSkipQuestion={handleSkipQuestion}
                />
            )}

            {!isSubmitting && (
                <button onClick={handleSkipAndFinish}>
                    Finish Interview Early
                </button>
            )}
        </div>
    );
}