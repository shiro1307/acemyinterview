import { DimensionScores, Verdict } from "@/app/types";
import { VERDICT_LABELS } from "@/app/lib/feedback/constants";
import MarkdownRenderer from "@/app/components/MarkdownRenderer";

function getScoreClass(score: number): string {
    if (score >= 7) return "hero-score--high";
    if (score >= 5) return "hero-score--mid";
    return "hero-score--low";
}

function DimensionBar({ label, score }: { label: string; score: number }) {
    return (
        <div className="dimension-row">
            <span className="dimension-label">{label}</span>
            <div className="dimension-bar-track">
                <div className="dimension-bar-fill" style={{ width: `${score * 10}%` }} />
            </div>
            <span className="dimension-score">{score}/10</span>
        </div>
    );
}

export default function SessionSummaryCard({
    overallScore,
    summary,
    dimensions,
    verdict,
    verdictRationale,
}: {
    overallScore: number;
    summary: string;
    dimensions: DimensionScores;
    verdict: Verdict;
    verdictRationale: string;
}) {
    return (
        <div className="card card-hero">
            <div className="hero-header">
                <div className={`hero-score ${getScoreClass(overallScore)}`}>
                    {overallScore}
                    <span className="hero-score-max">/10</span>
                </div>
                <div className="hero-verdict">
                    <span className={`verdict-badge verdict-${verdict}`}>{VERDICT_LABELS[verdict]}</span>
                    <div>
                        <MarkdownRenderer content={verdictRationale} />
                    </div>
                </div>
            </div>
            <div className="summary-text">
                <MarkdownRenderer content={summary} />
            </div>
            <div className="dimensions">
                <DimensionBar label="Communication" score={dimensions.communication} />
                <DimensionBar label="Technical depth" score={dimensions.technicalDepth} />
                <DimensionBar label="Problem solving" score={dimensions.problemSolving} />
            </div>
        </div>
    );
}
