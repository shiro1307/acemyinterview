export type Question = {
    id: string;
    text: string;
    answer: string;
};

export type SessionQuestion = {
    id: string;
    session_id: string;
    question_id: string;
    order_index: number;
};

export type Session = {
    id: string;
    role: string;
    status: "active" | "completed" | "abandoned";
    questions: Question[];
};

export type Role = {
    id: string;
    name: string;
};

export type QuestionEvaluation = {
    questionId: string;
    questionText: string;
    score: number;
    feedback: string;
    idealAnswer: string;
};

export type SessionFeedback = {
    id: string;
    session_id: string;
    overall_score: number;
    summary: string;
    evaluation_json: {
        questionEvaluations: QuestionEvaluation[];
    };
    created_at: string;
};
