import { formatDateLabel } from "@/lib/journal/dates";
import type { BodyEntry } from "@/lib/journal/types";

const WIDTH = 620;
const HEIGHT = 220;
const PADDING_LEFT = 24;
// Room on the right for the goal label, at the end of its line.
const PADDING_RIGHT = 76;
const PADDING_TOP = 26;
// Room under the lowest point for its value and the date row.
const PADDING_BOTTOM = 50;

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

  // Whether the goal is to gain or to lose, judged from the very first check-in.
  const startWeight = Number(entries[entries.length - 1].weightKg);
  const isGaining = Number.isNaN(startWeight) ? target >= recent[0].weight : target >= startWeight;
  const reachesGoal = (weight: number) =>
    hasTarget && (isGaining ? weight >= target - 0.05 : weight <= target + 0.05);

  const values = recent.map((entry) => entry.weight);
  const min = Math.min(...values, hasTarget ? target : Infinity) - 0.5;
  const max = Math.max(...values, hasTarget ? target : -Infinity) + 0.5;
  const toY = (weight: number) =>
    HEIGHT - PADDING_BOTTOM - ((weight - min) / Math.max(max - min, 0.1)) * (HEIGHT - PADDING_TOP - PADDING_BOTTOM);
  const plotRight = WIDTH - PADDING_RIGHT;

  const points = recent.map((entry, index) => ({
    ...entry,
    x: PADDING_LEFT + (index * (plotRight - PADDING_LEFT)) / Math.max(recent.length - 1, 1),
    y: toY(entry.weight),
    isGoal: reachesGoal(entry.weight),
  }));

  // Values sit above peaks and below dips, so the line never runs through them.
  const valueY = (index: number) => {
    const point = points[index];
    const neighbors = [points[index - 1], points[index + 1]].filter(Boolean);
    const neighborsAbove = neighbors.length > 0 && neighbors.every((other) => other.y < point.y - 2);
    return neighborsAbove ? point.y + 20 : point.y - 11;
  };

  const targetY = hasTarget ? toY(target) : 0;
  const goalReached = points.length > 0 && points[points.length - 1].isGoal;

  return (
    <svg className="body-chart-svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Weight trend chart">
      {hasTarget && (
        <g className={goalReached ? "is-goal" : undefined}>
          <line className="body-chart-target-line" x1={PADDING_LEFT} y1={targetY} x2={plotRight + 8} y2={targetY} />
          <text className="body-chart-target-label" x={plotRight + 16} y={targetY} dominantBaseline="middle">
            {goalReached ? "Goal ✓" : "Goal"}
            <tspan x={plotRight + 16} dy="1.3em">
              {target.toFixed(1)} kg
            </tspan>
          </text>
        </g>
      )}
      <polyline className="body-chart-line" points={points.map((point) => `${point.x},${point.y}`).join(" ")} />
      {points.map((point, index) => (
        <g key={point.date} className={point.isGoal ? "is-goal" : undefined}>
          <circle className="body-chart-point" cx={point.x} cy={point.y} r={point.isGoal ? 5 : 4} />
          <text className="body-chart-value" x={point.x} y={valueY(index)} textAnchor="middle">
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
