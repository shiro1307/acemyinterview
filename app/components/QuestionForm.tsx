interface QuestionFormProps {
    questionNumber: number;
    questionText: string;
    submitQuestion: () => void;
}

export default function QuestionForm({
    questionNumber,
    questionText,
    submitQuestion
}: QuestionFormProps) {
    return (
        <div>
            <h1>Question {questionNumber}</h1>
            <p>{questionText}</p>
            <textarea />
            <button onClick={submitQuestion}>Submit Answer</button>
        </div>
    );
}
