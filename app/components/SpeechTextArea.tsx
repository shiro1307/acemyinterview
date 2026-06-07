"use client";

import { useEffect, useRef, useState } from "react";

interface SpeechTextareaProps {
    value: string;
    onChange: (value: string) => void;
    rows?: number;
    cols?: number;
    placeholder?: string;
}

export default function SpeechTextarea({
    value,
    onChange,
    rows = 5,
    cols = 50,
    placeholder,
}: SpeechTextareaProps) {
    const [isListening, setIsListening] = useState(false);

    const recognitionRef = useRef<any>(null);
    const finalTranscriptRef = useRef("");

    useEffect(() => {
        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
            setIsListening(true);
            finalTranscriptRef.current = value;
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = () => {
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            let finalText = finalTranscriptRef.current;
            let interimText = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;

                if (event.results[i].isFinal) {
                    finalText += transcript + " ";
                } else {
                    interimText += transcript;
                }
            }

            finalTranscriptRef.current = finalText;

            onChange(finalText + interimText);
        };

        recognitionRef.current = recognition;

        return () => recognition.stop();
    }, []);

    const toggleListening = () => {
        const recognition = recognitionRef.current;

        if (!recognition) {
            alert("Speech recognition is not supported.");
            return;
        }

        if (isListening) {
            recognition.stop();
        } else {
            window.speechSynthesis.cancel();
            recognition.start();
        }
    };

    return (
        <div>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={rows}
                cols={cols}
                placeholder={placeholder}
            />

            <br />

            <button
                type="button"
                onClick={toggleListening}
                style={{
                    marginTop: "4px",
                    padding: "4px 8px",
                    cursor: "pointer",
                }}
            >
                {isListening ? "Stop Dictation" : "Start Dictation"}
            </button>
        </div>
    );
}