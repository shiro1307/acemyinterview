"use client";

import { useState } from "react";
import { AnalyticsInsights, TrendSeries } from "@/app/lib/analytics/types";
import LineChart from "./LineChart";
import ProgressInsights from "./ProgressInsights";

type TrendTab = keyof TrendSeries;

const TABS: { id: TrendTab; label: string }[] = [
    { id: "overall", label: "Overall Score" },
    { id: "communication", label: "Communication" },
    { id: "technicalDepth", label: "Technical Depth" },
    { id: "problemSolving", label: "Problem Solving" },
];

export default function TrendSection({
    trends,
    insights,
}: {
    trends: TrendSeries;
    insights: AnalyticsInsights;
}) {
    const [activeTab, setActiveTab] = useState<TrendTab>("overall");

    return (
        <section className="analytics-section card">
            <h2 className="card-title">Score Trends</h2>

            <div className="analytics-tabs" role="tablist">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        className={`analytics-tab${activeTab === tab.id ? " analytics-tab--active" : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div role="tabpanel">
                <LineChart data={trends[activeTab]} />
            </div>

            <ProgressInsights insights={insights} />
        </section>
    );
}
