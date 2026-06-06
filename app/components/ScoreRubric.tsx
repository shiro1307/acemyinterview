export default function ScoreRubric() {
    const bands = [
        { score: "0", meaning: "No real attempt or completely off track" },
        { score: "1–2", meaning: "Major gaps; core concepts missing or wrong" },
        { score: "3–4", meaning: "Superficial; most important points not covered" },
        { score: "5", meaning: "Partial credit; right direction, incomplete" },
        { score: "6", meaning: "Meets a minimum bar; basics OK, depth lacking" },
        { score: "7", meaning: "Good; solid answer most interviewers would accept" },
        { score: "8", meaning: "Strong; clear structure, depth, and relevant examples" },
        { score: "9", meaning: "Excellent; only minor improvements possible" },
        { score: "10", meaning: "Outstanding; comprehensive and nuanced (uncommon)" },
    ];

    return (
        <details className="card">
            <summary className="card-title">How we score (0–10)</summary>
            <table className="rubric-table">
                <thead>
                    <tr>
                        <th>Score</th>
                        <th>Meaning</th>
                    </tr>
                </thead>
                <tbody>
                    {bands.map((b) => (
                        <tr key={b.score}>
                            <td>{b.score}</td>
                            <td>{b.meaning}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </details>
    );
}
