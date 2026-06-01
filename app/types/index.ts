export type Question = {
    id: number;
    text: string;
    answer: string;
    feedback: {
        score: number;
        strengths: string[];
        missing: string[];
    };
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
    questions: Question[];
};

export type Role = {
    id: string;
    name: string;
};
