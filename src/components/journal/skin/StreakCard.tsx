"use client";

import { useState } from "react";
import { getTodayDateKey, getWeekdayLabel } from "@/lib/journal/dates";
import { getStreakInfo, STREAK_MILESTONES } from "@/lib/journal/timeline";
import type { RoutineEntry } from "@/lib/journal/types";
import { Icon } from "../../Icon";

/** Flame intensity: 0 none, 1 = 1–2 days, 2 = 3–6, 3 = 7–29, 4 = 30+. */
function getTier(streak: number): number {
  if (streak >= 30) return 4;
  if (streak >= 7) return 3;
  if (streak >= 3) return 2;
  if (streak >= 1) return 1;
  return 0;
}

const LEVEL_NAMES = ["시작 전", "불씨", "모닥불", "횃불", "불사조"];

const BADGE_ICONS: Record<number, string> = {
  3: "sparkles",
  7: "flame",
  14: "flash",
  30: "medal",
  50: "ribbon",
  100: "trophy",
  200: "diamond",
  365: "planet",
};

const RING_RADIUS = 31;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

function getStatusMessage(current: number, todayDone: boolean, atRisk: boolean, best: number): string {
  if (todayDone) {
    return STREAK_MILESTONES.includes(current)
      ? `${current}일 연속 달성! 새 배지를 얻었어요.`
      : `오늘도 완료했어요. ${current}일째 이어가는 중이에요.`;
  }
  if (atRisk) {
    return `오늘 체크하면 ${current + 1}일 연속이에요. 불씨를 지켜주세요!`;
  }
  return best > 0
    ? `다시 불을 붙여볼까요? 최고 기록은 ${best}일이에요.`
    : "오늘 루틴을 체크하고 첫 기록을 시작해요.";
}

interface StreakCardProps {
  timeline: RoutineEntry[];
  /** The week currently shown in the timeline (Mon–Sun). */
  weekEntries: RoutineEntry[];
}

export function StreakCard({ timeline, weekEntries }: StreakCardProps) {
  const { current, todayDone, atRisk, best, previousMilestone, nextMilestone } = getStreakInfo(timeline);
  const tier = getTier(current);
  const todayKey = getTodayDateKey();
  const totalDone = timeline.filter((entry) => entry.done && entry.date <= todayKey).length;
  const progress = Math.min(1, (current - previousMilestone) / Math.max(nextMilestone - previousMilestone, 1));

  // A ripple plays when today flips to done (not on first render).
  const [wasDone, setWasDone] = useState(todayDone);
  const [burst, setBurst] = useState(0);
  if (todayDone !== wasDone) {
    setWasDone(todayDone);
    if (todayDone) {
      setBurst((count) => count + 1);
    }
  }

  return (
    <div
      className="streak-card"
      data-tier={tier}
      data-state={todayDone ? "done" : atRisk ? "at-risk" : "idle"}
      aria-label={`${current}일 연속 스트릭`}
    >
      <div className="streak-main">
        <div className="streak-orb">
          <svg className="streak-ring" viewBox="0 0 72 72" aria-hidden="true">
            <circle className="streak-ring-track" cx="36" cy="36" r={RING_RADIUS} />
            <circle
              className="streak-ring-fill"
              cx="36"
              cy="36"
              r={RING_RADIUS}
              strokeDasharray={RING_LENGTH}
              strokeDashoffset={RING_LENGTH * (1 - progress)}
            />
          </svg>
          {/* Re-keyed so the flame re-ignites (animation) when today gets checked. */}
          <span key={todayDone ? "lit" : "idle"} className="streak-flame" aria-hidden="true">
            <Icon name={current > 0 ? "flame" : "flame-outline"} />
          </span>
          {burst > 0 && <span key={burst} className="streak-ripple" aria-hidden="true" />}
        </div>

        <div className="streak-headline">
          <p className="streak-level">
            <span>Lv.{tier}</span>
            {LEVEL_NAMES[tier]}
          </p>
          <div className="streak-count">
            <strong key={current} className="streak-number">
              {current}
            </strong>
            <span>일 연속</span>
          </div>
        </div>
      </div>

      <p className="streak-status">{getStatusMessage(current, todayDone, atRisk, best)}</p>

      <ol className="streak-week" aria-label="This week">
        {weekEntries.map((entry) => {
          const state = entry.done
            ? "done"
            : entry.date === todayKey
              ? "today"
              : entry.date < todayKey
                ? "missed"
                : "upcoming";
          return (
            <li key={entry.date} className={`streak-day is-${state}`}>
              <span className="streak-day-dot">{entry.done && <Icon name="checkmark" />}</span>
              <small>{getWeekdayLabel(entry.date)}</small>
            </li>
          );
        })}
      </ol>

      <div className="streak-stats">
        <span title="최고 기록">
          <Icon name="trophy-outline" />
          최고 <strong>{best}</strong>일
        </span>
        <span title="지금까지 체크한 날">
          <Icon name="checkmark-circle-outline" />총 <strong>{totalDone}</strong>일
        </span>
        <span title={`다음 목표 ${nextMilestone}일`}>
          <Icon name="flag-outline" />
          <strong>{Math.max(nextMilestone - current, 0)}</strong>일 남음
        </span>
      </div>

      <ul className="streak-badges" aria-label="Streak badges">
        {STREAK_MILESTONES.map((milestone) => {
          const state = best >= milestone ? "earned" : milestone === nextMilestone ? "next" : "locked";
          return (
            <li
              key={milestone}
              className={`streak-badge is-${state}`}
              title={state === "earned" ? `${milestone}일 배지 획득!` : `${milestone}일 연속 달성 시 획득`}
            >
              <Icon name={state === "locked" ? "lock-closed" : BADGE_ICONS[milestone]} />
              <small>{milestone}</small>
            </li>
          );
        })}
      </ul>

    </div>
  );
}
