export function formatPracticeTime(totalMs: number): string {
    if (totalMs <= 0) return "0m";

    const totalMinutes = Math.floor(totalMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }

    return `${minutes}m`;
}

export function formatPercentChange(value: number | null): string {
    if (value === null) return "—";
    const rounded = Math.round(value);
    if (rounded > 0) return `+${rounded}%`;
    if (rounded < 0) return `${rounded}%`;
    return "0%";
}

export function formatScore(value: number | null, decimals = 1): string {
    if (value === null) return "—";
    return decimals === 0 ? `${Math.round(value)}` : value.toFixed(decimals);
}

export function formatScoreWithMax(value: number | null, decimals = 1): string {
    if (value === null) return "—";
    return `${formatScore(value, decimals)}/10`;
}
