"use client";

import { useState } from "react";
import { startInterview } from "../lib/actions/interviews";
import EmptyState from "./EmptyState";
import ErrorMessage from "./ErrorMessage";

interface RoleSelectorProps {
    roles: {
        id: string;
        name: string;
        slug: string;
        description?: string | null;
        difficulty?: string | null;
    }[];
}

export default function RoleSelector({ roles }: RoleSelectorProps) {
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState<string>("");

    const handleStartInterview = async (roleId: string) => {
        setLoading(roleId);
        setError("");
        
        try {
            await startInterview(roleId);
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
                        onClick={() => handleStartInterview(role.id)}
                        disabled={loading !== null}
                        className={loading === role.id ? "loading" : ""}
                    >
                        {loading === role.id ? "Starting..." : role.name}
                    </button>
                    {role.description && (
                        <p style={{ fontSize: "0.9rem", color: "#666", marginTop: "0.25rem" }}>
                            {role.description}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
}