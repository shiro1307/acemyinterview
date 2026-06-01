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

export type Session = {
    id: string;
    role: string;
    questions: Question[];
};

export type Role = {
    id: string;
    name: string;
};
