import { addDays } from "./dates";
import { createId } from "./format";
import { extendTimelineTo } from "./timeline";
import type { JournalData, RepeatField, RoutineEntry, RoutineRepeat } from "./types";

/** How far ahead a repeat fills cells. */
export const REPEAT_HORIZON_DAYS = 84;

export function describeInterval(days: number): string {
  if (days === 1) return "매일";
  if (days === 7) return "매주";
  if (days % 7 === 0) return `${days / 7}주마다`;
  return `${days}일마다`;
}

/*
 * A repeat "cell" is either a text field (value = the text) or one grooming
 * chip (value = the grooming item id). These helpers hide the difference.
 */
function cellHas(entry: RoutineEntry, field: RepeatField, value: string): boolean {
  return field === "grooming" ? entry.grooming.includes(value) : entry[field] === value;
}

function cellIsFree(entry: RoutineEntry, field: RepeatField, value: string): boolean {
  return field === "grooming" ? !entry.grooming.includes(value) : !entry[field].trim();
}

function fillCell(entry: RoutineEntry, field: RepeatField, value: string): void {
  if (field === "grooming") {
    entry.grooming.push(value);
  } else {
    entry[field] = value;
  }
}

function clearCell(entry: RoutineEntry, field: RepeatField, value: string): void {
  if (field === "grooming") {
    entry.grooming = entry.grooming.filter((id) => id !== value);
  } else {
    entry[field] = "";
  }
}

/** Key for a repeatable cell, e.g. "2026-10-15|morning" or "2026-10-15|grooming|nails". */
export function repeatCellKey(date: string, field: RepeatField, groomingId?: string): string {
  return field === "grooming" ? `${date}|grooming|${groomingId}` : `${date}|${field}`;
}

function entriesByDate(timeline: RoutineEntry[]) {
  return new Map(timeline.map((entry) => [entry.date, entry]));
}

/** Dates (including the source) whose cell still holds the repeated value. */
export function getLiveRepeatDates(repeat: RoutineRepeat, timeline: RoutineEntry[]): string[] {
  const byDate = entriesByDate(timeline);
  return [repeat.sourceDate, ...repeat.dates].filter((date) => {
    const entry = byDate.get(date);
    return entry ? cellHas(entry, repeat.field, repeat.value) : false;
  });
}

/** Keys (see `repeatCellKey`) for every cell that is part of a live repeat. */
export function getRepeatedCellKeys(data: JournalData): Set<string> {
  const keys = new Set<string>();
  data.routineRepeats.forEach((repeat) => {
    const live = getLiveRepeatDates(repeat, data.skinTimeline);
    // A lone source cell (all copies gone) isn't really a repeat anymore.
    if (live.length > 1 || (live.length === 1 && live[0] !== repeat.sourceDate)) {
      live.forEach((date) => keys.add(repeatCellKey(date, repeat.field, repeat.value)));
    }
  });
  return keys;
}

/** The repeat a cell belongs to, if its value still matches. Newest wins. */
export function findRepeatForCell(
  data: JournalData,
  date: string,
  field: RepeatField,
  groomingId?: string
): RoutineRepeat | null {
  const entry = data.skinTimeline.find((item) => item.date === date);
  if (!entry) return null;
  for (let index = data.routineRepeats.length - 1; index >= 0; index -= 1) {
    const repeat = data.routineRepeats[index];
    const matchesTarget = field === "grooming" ? repeat.value === groomingId : true;
    if (
      repeat.field === field &&
      matchesTarget &&
      cellHas(entry, field, repeat.value) &&
      (repeat.sourceDate === date || repeat.dates.includes(date))
    ) {
      return repeat;
    }
  }
  return null;
}

/**
 * Copies a cell into every `intervalDays`-th free cell for the next 12 weeks
 * and records the repeat. For grooming, `groomingId` is the chip to repeat.
 * Returns the repeat, or null if nothing was filled.
 */
export function applyRepeat(
  draft: JournalData,
  sourceIndex: number,
  field: RepeatField,
  intervalDays: number,
  groomingId?: string
): RoutineRepeat | null {
  const timeline = draft.skinTimeline;
  const source = timeline[sourceIndex];
  if (!source) return null;

  const value = field === "grooming" ? groomingId : source[field].trim();
  if (!value) return null;
  // A grooming chip can only be repeated from a day where it's switched on.
  if (field === "grooming" && !source.grooming.includes(value)) return null;

  const endDate = addDays(source.date, REPEAT_HORIZON_DAYS);
  extendTimelineTo(timeline, endDate);

  const dates: string[] = [];
  for (let target = sourceIndex + intervalDays; target < timeline.length; target += intervalDays) {
    const entry = timeline[target];
    if (entry.date > endDate) break;
    if (cellIsFree(entry, field, value)) {
      fillCell(entry, field, value);
      dates.push(entry.date);
    }
  }
  if (!dates.length) return null;

  const repeat: RoutineRepeat = {
    id: createId(),
    field,
    value,
    sourceDate: source.date,
    intervalDays,
    dates,
    createdAt: new Date().toISOString(),
  };
  draft.routineRepeats.push(repeat);
  return repeat;
}

export interface RepeatRemoval {
  repeat: RoutineRepeat;
  clearedDates: string[];
}

/**
 * Clears the cells a repeat filled (only those still holding its value) from
 * `fromDate` onward, or all of them. The source cell is never cleared.
 */
export function removeRepeat(draft: JournalData, repeatId: string, fromDate?: string): RepeatRemoval | null {
  const index = draft.routineRepeats.findIndex((item) => item.id === repeatId);
  if (index < 0) return null;

  const repeat = draft.routineRepeats[index];
  const snapshot: RoutineRepeat = { ...repeat, dates: [...repeat.dates] };
  const byDate = entriesByDate(draft.skinTimeline);
  const clearedDates: string[] = [];

  const kept = repeat.dates.filter((date) => {
    if (fromDate && date < fromDate) return true;
    const entry = byDate.get(date);
    if (entry && cellHas(entry, repeat.field, repeat.value)) {
      clearCell(entry, repeat.field, repeat.value);
      clearedDates.push(date);
    }
    return false;
  });

  if (kept.length) {
    repeat.dates = kept;
  } else {
    draft.routineRepeats.splice(index, 1);
  }
  return { repeat: snapshot, clearedDates };
}

/** Puts back what `removeRepeat` cleared, skipping cells filled in since. */
export function restoreRepeat(draft: JournalData, removal: RepeatRemoval): void {
  const { repeat, clearedDates } = removal;
  const byDate = entriesByDate(draft.skinTimeline);
  clearedDates.forEach((date) => {
    const entry = byDate.get(date);
    if (entry && cellIsFree(entry, repeat.field, repeat.value)) {
      fillCell(entry, repeat.field, repeat.value);
    }
  });

  const index = draft.routineRepeats.findIndex((item) => item.id === repeat.id);
  if (index >= 0) {
    draft.routineRepeats[index] = repeat;
  } else {
    draft.routineRepeats.push(repeat);
  }
}
