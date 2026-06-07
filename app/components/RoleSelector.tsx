"use client";

import { useState } from "react";
import { startInterview } from "../lib/actions/interviews";
import EmptyState from "./EmptyState";
import ErrorMessage from "./ErrorMessage";

interface RoleSelectorProps {
    roles: {
        name: string;
        id: string;
    }[];
}

export default function RoleSelector({ roles }: RoleSelectorProps) {
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState<string>("");

    const handleStartInterview = async (role: string) => {
        setLoading(role);
        setError("");
        
        try {
            await startInterview(role);
        } catch (err) {
            console.error("Error starting interview:", err);
            setError(err instanceof Error ? err.message : "Failed to start interview");
            setLoading(null);
        }
    };

    if (roles.length === 0) {
        return (
            <EmptyState
                title="No roles available"
                description="There are currently no interview roles configured. Please contact support or check back later."
            />
        );
    }

    return (
        <div>
            {error && <ErrorMessage message={error} />}
            
            {roles.map((role) => (
                <div key={role.id}>
                    <button 
                        onClick={() => handleStartInterview(role.name)}
                        disabled={loading !== null}
                        className={loading === role.name ? "loading" : ""}
                    >
                        {loading === role.name ? "Starting..." : role.name}
                    </button>
                </div>
            ))}
        </div>
    );
}