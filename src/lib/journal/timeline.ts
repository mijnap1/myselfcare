import { ROUTINE_FIELDS, TIMELINE_WINDOW_DAYS } from "./constants";
import { addDays, getTodayDateKey, getWeekStartDateKey } from "./dates";
import type { RoutineEntry } from "./types";

export function createEmptyEntry(dateKey: string): RoutineEntry {
  return {
    date: dateKey,
    morning: "",
    faceRoutine: "",
    eveningCleanse: "",
    skincare: "",
    extraCare: "",
    mood: "",
    done: false,
    notes: "",
    grooming: [],
  };
}

export function createEmptyTimeline(
  startDateKey = getWeekStartDateKey(),
  days = TIMELINE_WINDOW_DAYS
): RoutineEntry[] {
  return Array.from({ length: days }, (_, index) => createEmptyEntry(addDays(startDateKey, index)));
}

/**
 * Fills date gaps and makes sure the timeline covers at least three weeks
 * and the whole current week.
 */
export function ensureTimelineWindow(entries: RoutineEntry[]): RoutineEntry[] {
  if (!entries.length) {
    return createEmptyTimeline();
  }

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const mondayStart = getWeekStartDateKey(sorted[0].date);
  const firstDate = mondayStart < sorted[0].date ? mondayStart : sorted[0].date;
  const targetLength = Math.max(TIMELINE_WINDOW_DAYS, sorted.length);
  const entryMap = new Map(sorted.map((entry) => [entry.date, entry]));
  const timeline: RoutineEntry[] = [];

  for (let index = 0; index < targetLength; index += 1) {
    const dateKey = addDays(firstDate, index);
    timeline.push(entryMap.get(dateKey) ?? createEmptyEntry(dateKey));
  }

  const todayKey = getTodayDateKey();
  const currentWeekStart = getWeekStartDateKey(todayKey);

  while (timeline[0].date > currentWeekStart) {
    timeline.unshift(createEmptyEntry(addDays(timeline[0].date, -1)));
  }

  while (timeline[timeline.length - 1].date < addDays(currentWeekStart, 6)) {
    timeline.push(createEmptyEntry(addDays(timeline[timeline.length - 1].date, 1)));
  }

  return timeline;
}

/** Appends empty days until the timeline reaches `dateKey`. */
export function extendTimelineTo(timeline: RoutineEntry[], dateKey: string): void {
  if (!timeline.length) {
    timeline.push(createEmptyEntry(dateKey));
  }
  while (timeline[timeline.length - 1].date < dateKey) {
    timeline.push(createEmptyEntry(addDays(timeline[timeline.length - 1].date, 1)));
  }
}

export function getTodayIndex(timeline: RoutineEntry[]): number {
  const todayKey = getTodayDateKey();
  const foundIndex = timeline.findIndex((entry) => entry.date === todayKey);
  return foundIndex >= 0 ? foundIndex : 0;
}

export function getWeekStartIndex(timeline: RoutineEntry[], index = getTodayIndex(timeline)): number {
  const targetDate = timeline[index]?.date ?? getTodayDateKey();
  const mondayKey = getWeekStartDateKey(targetDate);
  const foundIndex = timeline.findIndex((entry) => entry.date === mondayKey);
  return foundIndex >= 0 ? foundIndex : Math.max(0, index);
}

export function getRoutineParts(value: string): string[] {
  return value
    .split(/\n|→/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function stripRoutineAccentMarkers(value: string): string {
  return value.replace(/==([^=]+)==/g, "$1");
}

export function getEntryFilledCount(entry: RoutineEntry): number {
  return ROUTINE_FIELDS.filter(({ field }) => entry[field].trim()).length;
}

export const STREAK_MILESTONES = [3, 7, 14, 30, 50, 100, 200, 365];

export interface StreakInfo {
  /** Consecutive done days ending today, or ending yesterday if today isn't done yet. */
  current: number;
  todayDone: boolean;
  /** Streak is alive but today still needs a check to keep it. */
  atRisk: boolean;
  best: number;
  /** Last milestone reached (0 if none) and the next one to aim for. */
  previousMilestone: number;
  nextMilestone: number;
}

function countDoneRun(timeline: RoutineEntry[], fromIndex: number): number {
  let count = 0;
  for (let index = fromIndex; index >= 0 && timeline[index]?.done; index -= 1) {
    count += 1;
  }
  return count;
}

export function getStreakInfo(timeline: RoutineEntry[]): StreakInfo {
  const todayIndex = getTodayIndex(timeline);
  const todayDone = Boolean(timeline[todayIndex]?.done);
  // Today isn't over yet, so an unchecked today doesn't break yesterday's streak.
  const current = todayDone ? countDoneRun(timeline, todayIndex) : countDoneRun(timeline, todayIndex - 1);

  let best = 0;
  let run = 0;
  for (let index = 0; index <= todayIndex; index += 1) {
    run = timeline[index]?.done ? run + 1 : 0;
    best = Math.max(best, run);
  }

  const nextMilestone = STREAK_MILESTONES.find((milestone) => milestone > current) ?? current + 100;
  const previousMilestone = [...STREAK_MILESTONES].reverse().find((milestone) => milestone <= current) ?? 0;

  return {
    current,
    todayDone,
    atRisk: !todayDone && current > 0,
    best: Math.max(best, current),
    previousMilestone,
    nextMilestone,
  };
}
