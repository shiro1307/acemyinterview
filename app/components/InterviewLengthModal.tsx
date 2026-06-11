"use client";

import { useEffect } from "react";

interface InterviewLengthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectLength: (length: "quick" | "standard" | "deep_dive") => void;
    availableQuestions: number;
}

export default function InterviewLengthModal({
    isOpen,
    onClose,
    onSelectLength,
    availableQuestions,
}: InterviewLengthModalProps) {
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const modes = [
        { id: "quick" as const, label: "Quick (5 Questions)", required: 5 },
        { id: "standard" as const, label: "Standard (10 Questions)", required: 10 },
        { id: "deep_dive" as const, label: "Deep Dive (15 Questions)", required: 15 },
    ];

    return (
        <div className="modal-overlay modal-overlay-animated" onClick={onClose}>
            <div className="modal-content modal-content-animated" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">Select Interview Length</h3>
                <div className="modal-options">
                    {modes.map((mode) => {
                        const isEnabled = availableQuestions >= mode.required;
                        return (
                            <button
                                key={mode.id}
                                className={`modal-option ${!isEnabled ? "modal-option-disabled" : ""}`}
                                onClick={() => isEnabled && onSelectLength(mode.id)}
                                disabled={!isEnabled}
                            >
                                {mode.label}
                            </button>
                        );
                    })}
                </div>
                <button className="modal-cancel" onClick={onClose}>
                    Cancel
                </button>
            </div>
        </div>
    );
}
