import InterviewQuestions from "@/app/components/InterviewQuestions";
import { supabase } from "../../lib/supabase";

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

    const { data: questions, error: questionError } = await supabase
        .from("questions")
        .select("*")
        .eq("session_id", sessionId)
        .order("id", { ascending: true });

    if (sessionError || !session) {
        return <div>Session not found</div>;
    }

    if (questionError) {
        return <div>Error loading questions</div>;
    }

    console.log("QUESTIONS:", questions);

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