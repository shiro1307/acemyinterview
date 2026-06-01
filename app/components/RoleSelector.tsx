"use client";

import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

interface RoleSelectorProps {
    roles: {
        name: string;
        id: string;
    }[];
}

export default function RoleSelector({ roles }: RoleSelectorProps) {
    const router = useRouter();

    async function startInterview(role: string) {
        // 1. Create session
        const { data: session, error: sessionError } = await supabase
            .from("sessions")
            .insert({
                id: crypto.randomUUID(),
                role: role,
            })
            .select()
            .single();

        if (sessionError || !session) {
            console.error("Session creation error:", sessionError);
            return;
        }

        // 2. Fetch global questions (filter by role, limit 5)
        const { data: allQuestions, error: fetchError } = await supabase
            .from("questions")
            .select("id")
            .eq("role", role)
            .limit(100);

        if (fetchError || !allQuestions) {
            console.error("Question fetch error:", fetchError);
            return;
        }

        // 3. Select random subset (up to 5)
        const selectedQuestionIds = allQuestions
            .sort(() => Math.random() - 0.5)
            .slice(0, 5)
            .map((q) => q.id);

        // 4. Insert into session_questions with order_index
        const sessionQuestionsToInsert = selectedQuestionIds.map(
            (questionId, index) => ({
                id: crypto.randomUUID(),
                session_id: session.id,
                question_id: questionId,
                order_index: index + 1,
            })
        );

        const { error: insertError } = await supabase
            .from("session_questions")
            .insert(sessionQuestionsToInsert);

        if (insertError) {
            console.error("session_questions insert error:", insertError);
            return;
        }

        // 5. Navigate to interview
        router.push(`/interview/${session.id}`);
    }

    return (
        <div>
            {roles.map((role) => (
                <div key={role.id}>
                    <button onClick={() => startInterview(role.name)}>
                        {role.name}
                    </button>
                </div>
            ))}
        </div>
    );
}