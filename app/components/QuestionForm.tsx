interface QuestionFormProps {
    questionNumber: number;
    questionText: string;
}

export default function QuestionForm({
    questionNumber,
    questionText,
}: QuestionFormProps) {
    return (
        <div>
            <h1>Question {questionNumber}</h1>
            <p>{questionText}</p>
            <textarea />
            <button>Submit Answer</button>
        </div>
    );
}
