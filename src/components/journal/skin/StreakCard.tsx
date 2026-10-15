"use client";

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

function getStatusMessage(current: number, todayDone: boolean, atRisk: boolean, best: number): string {
  if (todayDone) {
    return STREAK_MILESTONES.includes(current)
      ? `🎉 ${current}일 연속 달성! 이 흐름 그대로 가요.`
      : `오늘도 완료! ${current}일째 이어가는 중이에요.`;
  }
  if (atRisk) {
    return `오늘 체크하면 ${current + 1}일 연속이에요. 불씨를 지켜주세요!`;
  }
  return best > 0
    ? `다시 시작해볼까요? 최고 기록은 ${best}일이에요.`
    : "오늘 루틴을 체크하고 첫 스트릭을 시작해요.";
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
  const milestoneProgress = Math.min(
    100,
    Math.round(((current - previousMilestone) / Math.max(nextMilestone - previousMilestone, 1)) * 100)
  );

  return (
    <div
      className="streak-card"
      data-tier={tier}
      data-state={todayDone ? "done" : atRisk ? "at-risk" : "idle"}
      aria-label={`${current}일 연속 스트릭`}
    >
      <div className="streak-main">
        {/* Re-keyed so the flame re-ignites (animation) when today gets checked. */}
        <span key={todayDone ? "lit" : "idle"} className="streak-flame" aria-hidden="true">
          <Icon name={current > 0 ? "flame" : "flame-outline"} />
        </span>
        <div className="streak-count">
          <strong key={current} className="streak-number">
            {current}
          </strong>
          <span>일 연속</span>
        </div>
        <span className="streak-best" title="최고 기록">
          <Icon name="trophy-outline" />
          <span>{best}일</span>
        </span>
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

      <div className="streak-milestone">
        <div className="streak-milestone-bar">
          <span style={{ width: `${milestoneProgress}%` }} />
        </div>
        <p>
          <span>다음 목표 {nextMilestone}일</span>
          <span>{Math.max(nextMilestone - current, 0)}일 남음</span>
        </p>
      </div>
    </div>
  );
}
