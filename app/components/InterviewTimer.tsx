"use client";

import { useEffect, useState } from "react";

export default function InterviewTimer() {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const pad = (n: number) => n.toString().padStart(2, "0");

    return (
        <div className="interview-timer">
            <span className="timer-label">Time: </span>
            <span className="timer-display">
                {pad(hours)}:{pad(minutes)}:{pad(secs)}
            </span>
        </div>
    );
}
