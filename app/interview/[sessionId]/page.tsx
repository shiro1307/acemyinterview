import InterviewQuestions from "@/app/components/InterviewQuestions";
import { supabase } from "../../lib/supabase";
import { Question } from "@/app/types";

interface InterviewSessionPageProps {
    params: Promise<{ sessionId: string }>;
}

export default async function InterviewSessionPage({ params }: InterviewSessionPageProps) {
    const { sessionId } = await params;

    const { data: session, error: sessionError } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

    // Step 1: Fetch session_questions for this session
    const { data: sessionQuestionsData, error: sessionQuestionsError } = await supabase
        .from("session_questions")
        .select("*")
        .eq("session_id", sessionId)
        .order("order_index", { ascending: true });

    if (sessionQuestionsError) {
        console.error("sessionQuestionsError:", sessionQuestionsError);
    }

    // Step 2: Extract question IDs
    const questionIds = sessionQuestionsData?.map((sq: any) => sq.question_id) ?? [];

    // Step 3: Fetch all questions with those IDs
    let questionsData: any[] = [];
    let questionsError = null;

    if (questionIds.length > 0) {
        const result = await supabase
            .from("questions")
            .select("*")
            .in("id", questionIds);

        questionsData = result.data ?? [];
        questionsError = result.error;
    }

    if (questionsError) {
        console.error("questionsError:", questionsError);
    }

    // Step 4: Create lookup map
    const questionMap: Record<string, any> = {};
    questionsData.forEach((q: any) => {
        questionMap[q.id] = q;
    });

    // Step 5: Join client-side, preserving order from session_questions
    const questions: Question[] = sessionQuestionsData?.map((sq: any) => ({
        id: questionMap[sq.question_id]?.id || sq.question_id,
        text: questionMap[sq.question_id]?.text || "Question not found",
        answer: "",
        feedback: {
            score: 0,
            strengths: [],
            missing: [],
        },
    })) ?? [];

    const questionError = sessionQuestionsError || questionsError;

    if (sessionError || !session) {
        return <div>Session not found</div>;
    }

    if (questionError) {
        return <div>Error loading questions: {(questionError as any)?.message || "Unknown error"}</div>;
    }

    console.log("Session questions loaded:", questions);

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