import { WeaknessEntry } from "@/app/lib/analytics/types";
import RankedListSection from "./RankedListSection";

export default function WeaknessAnalysis({ weaknesses }: { weaknesses: WeaknessEntry[] }) {
    return (
        <RankedListSection
            title="Top 5 Most Frequent Weaknesses"
            emptyText="No weakness data yet."
            items={weaknesses.map((entry) => ({
                name: entry.weakness,
                meta: `(${entry.count})`,
            }))}
        />
    );
}
