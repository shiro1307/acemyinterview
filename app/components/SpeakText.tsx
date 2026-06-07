"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
    text: string;
    autoSpeak?: boolean;
};

export default function SpeakText({
    text,
    autoSpeak = true,
}: Props) {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentWordIndex, setCurrentWordIndex] = useState(-1);

    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
    const hasAutoSpokenRef = useRef<string>("");

    const clearTimers = () => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
    };

    const stop = () => {
        window.speechSynthesis.cancel();
        clearTimers();

        setIsSpeaking(false);
        setCurrentWordIndex(-1);
    };

    const speak = () => {
        if (!("speechSynthesis" in window)) return;
        if (!text.trim()) return;

        // Stop any previous speech
        window.speechSynthesis.cancel();
        clearTimers();

        const words = text.split(/\s+/);

        let boundaryDetected = false;

        const utterance = new SpeechSynthesisUtterance(text);

        utterance.onstart = () => {
            setIsSpeaking(true);

            // Wait briefly to see if boundary events arrive.
            const fallbackStarter = setTimeout(() => {
                if (boundaryDetected) return;

                const totalWeight = words.reduce(
                    (sum, word) => sum + Math.max(word.length, 1),
                    0
                );

                // Rough estimate: ~65ms per character
                const estimatedDuration =
                    Math.max(text.length * 65, 1000);

                let accumulated = 0;

                words.forEach((word, index) => {
                    const weight = word.length / totalWeight;
                    accumulated += weight * estimatedDuration;

                    const timer = setTimeout(() => {
                        if (!boundaryDetected) {
                            setCurrentWordIndex(index);
                        }
                    }, accumulated);

                    timersRef.current.push(timer);
                });
            }, 300);

            timersRef.current.push(fallbackStarter);
        };

        utterance.onboundary = (event: SpeechSynthesisEvent) => {
            boundaryDetected = true;

            const charIndex = event.charIndex;

            let runningLength = 0;

            for (let i = 0; i < words.length; i++) {
                runningLength += words[i].length + 1;

                if (charIndex < runningLength) {
                    setCurrentWordIndex(i);
                    break;
                }
            }
        };

        utterance.onend = () => {
            clearTimers();
            setIsSpeaking(false);
            setCurrentWordIndex(-1);
        };

        utterance.onerror = () => {
            clearTimers();
            setIsSpeaking(false);
            setCurrentWordIndex(-1);
        };

        window.speechSynthesis.speak(utterance);
    };

    const toggle = () => {
        if (isSpeaking) stop();
        else speak();
    };

    useEffect(() => {
        if (!autoSpeak) return;
        if (!text.trim()) return;

        // Prevent React Strict Mode double-speaking
        if (hasAutoSpokenRef.current === text) return;

        hasAutoSpokenRef.current = text;

        // Small delay gives browsers time to initialize voices
        const timer = setTimeout(() => {
            speak();
        }, 100);

        return () => clearTimeout(timer);
    }, [text, autoSpeak]);

    useEffect(() => {
        return () => stop();
    }, []);

    const words = text.split(/\s+/);

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
            }}
        >
            <p
                style={{
                    margin: 0,
                    display: "flex",
                    flexWrap: "wrap",
                }}
            >
                {words.map((word, index) => (
                    <span
                        key={index}
                        style={{
                            backgroundColor:
                                index === currentWordIndex
                                    ? "yellow"
                                    : "transparent",
                            textDecoration:
                                index === currentWordIndex
                                    ? "underline"
                                    : "none",
                            padding: "0 2px",
                        }}
                    >
                        {word + " "}
                    </span>
                ))}
            </p>

            <button
                onClick={toggle}
                style={{
                    padding: "4px 8px",
                    cursor: "pointer",
                    flexShrink: 0,
                }}
            >
                {isSpeaking ? "Stop Speaking" : "Speak"}
            </button>
        </div>
    );
}