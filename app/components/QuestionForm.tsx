"use client";

import { useState } from "react";

interface QuestionFormProps {
    questionNumber: number;
    questionText: string;
    submitQuestion: (answerText: string) => void;
}

export default function QuestionForm({
    questionNumber,
    questionText,
    submitQuestion
}: QuestionFormProps) {
    const [answerText, setAnswerText] = useState("");

    const handleSubmit = () => {
        submitQuestion(answerText);
    };

    return (
        <div>
            <h1>Question {questionNumber}</h1>
            <p>{questionText}</p>
            <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                rows={5}
                cols={50}
                placeholder="Type your answer here..."
            />
            <br />
            <button onClick={handleSubmit} disabled={!answerText.trim()}>
                Submit Answer
            </button>
        </div>
    );
}
