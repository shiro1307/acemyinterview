"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import QuestionForm from "./QuestionForm";
import FeedbackList from "./FeedbackList";
import { Question } from "@/app/types";

export default function InterviewQuestions({ questions, sessionId }: { questions: Question[], sessionId: string }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const [feedbackVisible, setFeedbackVisible] = useState(false);

    const question = questions[currentIndex];

    const router = useRouter();

    function submitQuestion() {
        setFeedbackVisible(true)
    }

    function nextQuestion() {
        setCurrentIndex((prev) => prev + 1)
        setFeedbackVisible(false)
    }

    function finishInterview() {
        router.push(`/session/${sessionId}`);
    }

    const isLastQuestion = (currentIndex === questions.length - 1);

    return (
        <div>

            <QuestionForm
                questionNumber={currentIndex + 1}
                questionText={question.text}
                submitQuestion={submitQuestion}
            />

            {
                feedbackVisible &&
                <div>
                    <h2>Feedback</h2>
                    <p>Score: {question.feedback.score}/10</p>

                    <FeedbackList
                        title="Strengths"
                        items={question.feedback.strengths}
                    />

                    <FeedbackList
                        title="Missing"
                        items={question.feedback.missing}
                    />
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