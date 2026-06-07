import InterviewQuestions from "@/app/components/InterviewQuestions";
import { getUser } from "../../lib/supabase/server";
import { createClient } from "../../lib/supabase/server";
import { Question } from "@/app/types";
import EmptyState from "@/app/components/EmptyState";

interface InterviewSessionPageProps {
    params: Promise<{ sessionId: string }>;
}

export default async function InterviewSessionPage({ params }: InterviewSessionPageProps) {
    const user = await getUser();

    if (!user) {
        return (
            <div>
                <h1>Interview</h1>
                <EmptyState
                    title="Please log in"
                    description="You need to be logged in to take an interview. Create an account or sign in to get started."
                    actionText="Go to login"
                    actionHref="/login"
                />
            </div>
        );
    }

    const { sessionId } = await params;
    const supabase = await createClient();

    // Fetch session and verify ownership
    const { data: session, error: sessionError } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", sessionId)
        .eq("user_id", user.id)
        .single();

    if (sessionError || !session) {
        return (
            <div>
                <h1>Interview</h1>
                <EmptyState
                    title="Session not found"
                    description="This interview session doesn't exist or you don't have permission to access it."
                    actionText="Start a new interview"
                    actionHref="/interview"
                />
            </div>
        );
    }

    interface SessionQuestionData {
        id: string;
        session_id: string;
        question_id: string;
        order_index: number;
    }

    interface DbQuestionData {
        id: string;
        text: string;
        role: string | null;
        created_at: string | null;
    }

    // Step 1: Fetch session_questions for this session
    const { data: sessionQuestionsData, error: sessionQuestionsError } = await supabase
        .from("session_questions")
        .select("id, session_id, question_id, order_index")
        .eq("session_id", sessionId)
        .order("order_index", { ascending: true });

    if (sessionQuestionsError) {
        console.error("sessionQuestionsError:", sessionQuestionsError);
    }

    const typedSessionQuestions = (sessionQuestionsData as SessionQuestionData[] | null) ?? [];

    // Step 2: Extract question IDs
    const questionIds = typedSessionQuestions.map((sq) => sq.question_id);

    // Step 3: Fetch all questions with those IDs
    let questionsData: DbQuestionData[] = [];
    let questionsError = null;

    if (questionIds.length > 0) {
        const result = await supabase
            .from("questions")
            .select("id, text, role, created_at")
            .in("id", questionIds);

        questionsData = (result.data as DbQuestionData[] | null) ?? [];
        questionsError = result.error;
    }

    if (questionsError) {
        console.error("questionsError:", questionsError);
    }

    // Step 4: Create lookup map
    const questionMap: Record<string, DbQuestionData> = {};
    questionsData.forEach((q) => {
        questionMap[q.id] = q;
    });

    // Step 5: Join client-side, preserving order from session_questions
    const questions: Question[] = typedSessionQuestions.map((sq) => ({
        id: questionMap[sq.question_id]?.id || sq.question_id,
        text: questionMap[sq.question_id]?.text || "Question not found",
        answer: "",
    }));

    const questionError = sessionQuestionsError || questionsError;

    if (questionError) {
        return (
            <div>
                <h1>{session.role} Interview</h1>
                <EmptyState
                    title="Error loading questions"
                    description={`We encountered an error while loading the interview questions: ${questionError.message || "Unknown error"}`}
                    actionText="Back to interview selection"
                    actionHref="/interview"
                />
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div>
                <h1>{session.role} Interview</h1>
                <EmptyState
                    title="No questions available"
                    description="This interview session doesn't have any questions assigned yet. This might be a configuration issue."
                    actionText="Back to interview selection"
                    actionHref="/interview"
                />
            </div>
        );
    }

    return (
        <div>
            <h1>{session.role} Interview</h1>

            <InterviewQuestions
                questions={questions ?? []}
                sessionId={session.id}
            />
        </div>
    );
}