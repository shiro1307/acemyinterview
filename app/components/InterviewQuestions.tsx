"use client";

import { useState } from "react";
import QuestionForm from "./QuestionForm";
import InterviewTimer from "./InterviewTimer";
import Loading from "./Loading";
import ErrorMessage from "./ErrorMessage";
import { Question } from "@/app/types";
import { submitAnswer, completeInterview } from "../lib/actions/interviews";

interface InterviewQuestionsProps {
    questions: Question[];
    sessionId: string;
}

export default function InterviewQuestions({ questions, sessionId }: InterviewQuestionsProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false);
    const [error, setError] = useState("");

    const question = questions[currentIndex];
    const isLastQuestion = currentIndex === questions.length - 1;

    async function handleSkipQuestion() {
        if (!isLastQuestion) {
            setCurrentIndex((prev) => prev + 1);
        }
    }

    async function handleAnswerSubmit(answerText: string) {
        setIsSubmitting(true);
        setError("");
        
        try {
            await submitAnswer(sessionId, question.id, answerText);

            if (!isLastQuestion) {
                setCurrentIndex((prev) => prev + 1);
            }
        } catch (err) {
            console.error("Failed to submit answer:", err);
            setError(err instanceof Error ? err.message : "Failed to submit answer");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleFinishInterview(answerText: string) {
        setIsSubmitting(true);
        setError("");
        
        try {
            await submitAnswer(sessionId, question.id, answerText);
            setIsFinishing(true);
            await completeInterview(sessionId);
        } catch (err) {
            if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
                throw err;
            }
            console.error("Failed to finish interview:", err);
            setError(err instanceof Error ? err.message : "Failed to finish interview");
            setIsFinishing(false);
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleSkipAndFinish() {
        setIsFinishing(true);
        setError("");
        
        try {
            await completeInterview(sessionId);
        } catch (err) {
            if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
                throw err;
            }
            console.error("Failed to finish interview:", err);
            setError(err instanceof Error ? err.message : "Failed to finish interview");
            setIsFinishing(false);
        }
    }

    if (isFinishing) {
        return <Loading text="Finishing interview and generating results..." />;
    }

    return (
        <div>
            <InterviewTimer />
            
            {error && <ErrorMessage message={error} />}

            {isSubmitting ? (
                <Loading text="Submitting answer..." />
            ) : (
                <>
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

                    <button onClick={handleSkipAndFinish}>
                        Finish Interview Early
                    </button>
                </>
            )}
        </div>
    );
}