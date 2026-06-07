"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
    text: string;
    autoSpeak?: boolean;
};

export default function SpeakText({ text, autoSpeak = true }: Props) {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentWordIndex, setCurrentWordIndex] = useState(-1);

    const wordsRef = useRef<string[]>([]);
    const timersRef = useRef<NodeJS.Timeout[]>([]);
    const useBoundaryRef = useRef(false);
    const boundarySeenRef = useRef(false);

    const clearTimers = () => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
    };

    const stop = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setCurrentWordIndex(-1);
        clearTimers();
    };

    const speak = () => {
        if (!("speechSynthesis" in window)) return;
        if (!text) return;

        stop();

        const words = text.split(" ");
        wordsRef.current = words;

        useBoundaryRef.current = false;
        boundarySeenRef.current = false;

        const utterance = new SpeechSynthesisUtterance(text);

        setIsSpeaking(true);

        // ----------------------------
        // BOUNDARY MODE (preferred)
        // ----------------------------
        utterance.onboundary = (event: any) => {
            boundarySeenRef.current = true;
            useBoundaryRef.current = true;

            if (typeof event.charIndex !== "number") return;

            const charIndex = event.charIndex;

            let count = 0;
            for (let i = 0; i < words.length; i++) {
                count += words[i].length + 1;
                if (charIndex < count) {
                    setCurrentWordIndex(i);
                    break;
                }
            }
        };

        // ----------------------------
        // FALLBACK (ONLY if boundary fails)
        // ----------------------------
        const fallbackTimeout = setTimeout(() => {
            if (boundarySeenRef.current) return; // boundary is working → skip fallback

            const estimatedDurationMs = Math.max(
                800,
                words.reduce((acc, w) => acc + w.length * 55, 0)
            );

            let elapsed = 0;
            const totalWeight = words.reduce((s, w) => s + w.length, 0);

            words.forEach((word, i) => {
                const delay =
                    ((word.length / totalWeight) * estimatedDurationMs);

                const t = setTimeout(() => {
                    if (!useBoundaryRef.current) {
                        setCurrentWordIndex(i);
                    }
                }, elapsed + delay);

                elapsed += delay;
                timersRef.current.push(t);
            });
        }, 250); // wait briefly to see if boundary kicks in

        utterance.onstart = () => {
            // fallback check already scheduled above
        };

        utterance.onend = () => {
            clearTimeout(fallbackTimeout);
            stop();
        };

        utterance.onerror = () => {
            clearTimeout(fallbackTimeout);
            stop();
        };

        window.speechSynthesis.speak(utterance);
    };

    const toggle = () => {
        if (isSpeaking) stop();
        else speak();
    };

    useEffect(() => {
        if (!autoSpeak || !text) return;
        speak();
    }, [text, autoSpeak]);

    const words = text.split(" ");

    return (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <p style={{ margin: 0 }}>
                {words.map((w, i) => (
                    <span
                        key={i}
                        style={{
                            backgroundColor: i === currentWordIndex ? "yellow" : "transparent",
                            textDecoration: i === currentWordIndex ? "underline" : "none",
                            padding: "0 2px",
                        }}
                    >
                        {w + " "}
                    </span>
                ))}
            </p>

            <button onClick={toggle} style={{ padding: "4px 8px", cursor: "pointer" }}>
                {isSpeaking ? "Stop Speaking" : "Speak"}
            </button>
        </div>
    );
}