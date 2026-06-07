"use client";

import { useState } from "react";
import SpeakText from "./SpeakText";
import SpeechTextarea from "./SpeechTextArea";

interface QuestionFormProps {
    questionNumber: number;
    totalQuestions: number;
    questionText: string;
    submitQuestion: (answerText: string) => void;
    isLastQuestion: boolean;
    onFinishInterview: (answerText: string) => void;
}

export default function QuestionForm({
    questionNumber,
    questionText,
    totalQuestions,
    submitQuestion,
    isLastQuestion,
    onFinishInterview,
}: QuestionFormProps) {
    const [answerText, setAnswerText] = useState("");

    const handleSubmit = () => {
        if (isLastQuestion) {
            onFinishInterview(answerText);
        } else {
            submitQuestion(answerText);
        }
    };

    //<p>{questionText}</p>

    /*

    <textarea
        value={answerText}
        onChange={(e) => setAnswerText(e.target.value)}
        rows={5}
        cols={50}
        placeholder="Type your answer here..."
    />

    */

    return (
        <div>
            <h1>Question {questionNumber} out of {totalQuestions}</h1>
            <SpeakText text={questionText} />

            <SpeechTextarea
                value={answerText}
                onChange={setAnswerText}
                rows={5}
                cols={50}
                placeholder="Type your answer here..."
            />

            <br />
            <button onClick={handleSubmit} disabled={!answerText.trim()}>
                {isLastQuestion ? "Submit & Finish Interview" : "Submit Answer"}
            </button>
        </div>
    );
}
