import { formatDateLabel } from "@/lib/journal/dates";
import type { BodyEntry } from "@/lib/journal/types";

const WIDTH = 620;
const HEIGHT = 220;
const PADDING_X = 24;
const PADDING_Y = 24;

export function WeightChart({ entries, targetWeightKg }: { entries: BodyEntry[]; targetWeightKg: string }) {
  if (!entries.length) {
    return <p className="body-chart-empty">아직 몸무게 기록이 없어요. 오늘 체크인부터 하나 추가해보세요.</p>;
  }

  // Latest 8 check-ins, oldest first.
  const recent = entries
    .slice(0, 8)
    .reverse()
    .map((entry) => ({ ...entry, weight: Number(entry.weightKg) }))
    .filter((entry) => !Number.isNaN(entry.weight));

  if (!recent.length) {
    return <p className="body-chart-empty">숫자형 기록이 있어야 차트를 그릴 수 있어요.</p>;
  }

  const target = targetWeightKg.trim() ? Number(targetWeightKg) : NaN;
  const hasTarget = !Number.isNaN(target);
  const values = recent.map((entry) => entry.weight);
  const min = Math.min(...values, hasTarget ? target : Infinity) - 0.5;
  const max = Math.max(...values, hasTarget ? target : -Infinity) + 0.5;
  const toY = (weight: number) =>
    HEIGHT - PADDING_Y - ((weight - min) / Math.max(max - min, 0.1)) * (HEIGHT - PADDING_Y * 2);

  const points = recent.map((entry, index) => ({
    ...entry,
    x: PADDING_X + (index * (WIDTH - PADDING_X * 2)) / Math.max(recent.length - 1, 1),
    y: toY(entry.weight),
  }));
  const targetY = hasTarget ? toY(target) : 0;

  return (
    <svg className="body-chart-svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Weight trend chart">
      {hasTarget && (
        <>
          <line className="body-chart-target-line" x1={PADDING_X} y1={targetY} x2={WIDTH - PADDING_X} y2={targetY} />
          <text className="body-chart-target-label" x={WIDTH - PADDING_X} y={targetY - 8} textAnchor="end">
            Goal {target.toFixed(1)} kg
          </text>
        </>
      )}
      <polyline className="body-chart-line" points={points.map((point) => `${point.x},${point.y}`).join(" ")} />
      {points.map((point) => (
        <g key={point.date}>
          <circle className="body-chart-point" cx={point.x} cy={point.y} r={4} />
          <text className="body-chart-value" x={point.x} y={point.y - 10} textAnchor="middle">
            {point.weight.toFixed(1)}
          </text>
          <text className="body-chart-label" x={point.x} y={HEIGHT - 4} textAnchor="middle">
            {formatDateLabel(point.date)}
          </text>
        </g>
      ))}
    </svg>
  );
}
