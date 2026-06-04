"use client";

import { startInterview } from "../lib/actions/interviews";

interface RoleSelectorProps {
    roles: {
        name: string;
        id: string;
    }[];
}

export default function RoleSelector({ roles }: RoleSelectorProps) {
    const handleStartInterview = async (role: string) => {
        try {
            await startInterview(role);
        } catch (error) {
            console.error("Error starting interview:", error);
        }
    };

    return (
        <div>
            {roles.map((role) => (
                <div key={role.id}>
                    <button onClick={() => handleStartInterview(role.name)}>
                        {role.name}
                    </button>
                </div>
            ))}
        </div>
    );
}