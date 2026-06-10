import { ChartDataPoint } from "@/app/lib/analytics/types";

type LineChartProps = {
    data: ChartDataPoint[];
    yMin?: number;
    yMax?: number;
    height?: number;
};

const PADDING = { top: 16, right: 16, bottom: 36, left: 40 };
const Y_TICKS = [0, 2, 4, 6, 8, 10];

export default function LineChart({
    data,
    yMin = 0,
    yMax = 10,
    height = 240,
}: LineChartProps) {
    if (data.length === 0) {
        return (
            <div className="line-chart-empty">
                <p>No data available for this metric.</p>
            </div>
        );
    }

    const width = 600;
    const plotWidth = width - PADDING.left - PADDING.right;
    const plotHeight = height - PADDING.top - PADDING.bottom;

    const valueRange = yMax - yMin || 1;

    const getX = (index: number) => {
        if (data.length === 1) return PADDING.left + plotWidth / 2;
        return PADDING.left + (index / (data.length - 1)) * plotWidth;
    };

    const getY = (value: number) =>
        PADDING.top + plotHeight - ((value - yMin) / valueRange) * plotHeight;

    const points = data.map((d, i) => ({
        x: getX(i),
        y: getY(d.value),
        label: d.label,
        value: d.value,
    }));

    const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

    const labelInterval = data.length <= 8 ? 1 : data.length <= 16 ? 2 : 3;

    return (
        <div className="line-chart">
            <svg
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="xMidYMid meet"
                role="img"
                aria-label="Score trend line chart"
            >
                {Y_TICKS.map((tick) => {
                    const y = getY(tick);
                    return (
                        <g key={tick}>
                            <line
                                x1={PADDING.left}
                                y1={y}
                                x2={width - PADDING.right}
                                y2={y}
                                className="line-chart-grid"
                            />
                            <text
                                x={PADDING.left - 8}
                                y={y + 4}
                                textAnchor="end"
                                className="line-chart-tick"
                            >
                                {tick}
                            </text>
                        </g>
                    );
                })}

                <line
                    x1={PADDING.left}
                    y1={PADDING.top}
                    x2={PADDING.left}
                    y2={height - PADDING.bottom}
                    className="line-chart-axis"
                />
                <line
                    x1={PADDING.left}
                    y1={height - PADDING.bottom}
                    x2={width - PADDING.right}
                    y2={height - PADDING.bottom}
                    className="line-chart-axis"
                />

                {data.length > 1 && (
                    <polyline
                        points={polylinePoints}
                        fill="none"
                        className="line-chart-line"
                    />
                )}

                {points.map((point, i) => (
                    <circle
                        key={i}
                        cx={point.x}
                        cy={point.y}
                        r={4}
                        className="line-chart-dot"
                    />
                ))}

                {points.map((point, i) => {
                    if (i % labelInterval !== 0 && i !== points.length - 1) return null;
                    return (
                        <text
                            key={`label-${i}`}
                            x={point.x}
                            y={height - 8}
                            textAnchor="middle"
                            className="line-chart-tick"
                        >
                            {point.label.replace("Interview ", "")}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
}
