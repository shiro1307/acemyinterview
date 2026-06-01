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
            console.error(sessionError);
            return;
        }

        // 2. Create dummy questions linked to session
        const { error: questionError } = await supabase
            .from("questions")
            .insert([
                {
                    id: crypto.randomUUID(),
                    session_id: session.id,
                    text: "Explain React reconciliation",
                },
                {
                    id: crypto.randomUUID(),
                    session_id: session.id,
                    text: "What is event bubbling?",
                },
            ]);

        if (questionError) {
            console.error(questionError);
            return;
        }

        // 3. Navigate to interview
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