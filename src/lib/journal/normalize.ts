import {
  BODY_PARTS,
  DEFAULT_GROOMING_ITEMS,
  MEAL_TYPES,
  MOOD_OPTIONS,
  PRODUCT_STATUSES,
  ROUTINE_FIELDS,
  SKIN_SEASONS,
  SKIN_TYPES,
  STYLE_CATEGORIES,
} from "./constants";
import { addDays, getWeekStartDateKey } from "./dates";
import { createEmptyTimeline, ensureTimelineWindow } from "./timeline";
import {
  JOURNAL_PAYLOAD_VERSION,
  type BodyProgress,
  type GroomingItem,
  type JournalData,
  type JournalPayload,
  type RoutineEntry,
  type RoutineRepeat,
  type SkinLibrary,
  type StyleBoard,
} from "./types";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function textOrNumber(value: unknown): string {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function oneOf<T extends string, F extends string = T>(
  options: readonly { value: T }[],
  value: unknown,
  fallback: F
): T | F {
  return options.some((option) => option.value === value) ? (value as T) : fallback;
}

function records(value: unknown): UnknownRecord[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function newestFirst<T extends { addedAt: string }>(items: T[]): T[] {
  return items.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
}

function imageRef(entry: UnknownRecord) {
  return { imagePath: text(entry.imagePath), imageDataUrl: text(entry.imageDataUrl) };
}

/** Older routines had niacinamide without the hydrating serum step. */
function normalizeMorningRoutine(morning: unknown): string {
  const value = text(morning);
  if (!value.includes("나이아신아마이드") || value.includes("수분엠플/세럼")) {
    return value;
  }
  return value.replace("나이아신아마이드", "수분엠플/세럼 → 나이아신아마이드");
}

function normalizeRoutineEntry(entry: UnknownRecord, date: string): RoutineEntry {
  return {
    date,
    morning: normalizeMorningRoutine(entry.morning),
    faceRoutine: text(entry.faceRoutine),
    eveningCleanse: text(entry.eveningCleanse),
    skincare: text(entry.skincare),
    extraCare: text(entry.extraCare),
    mood: oneOf(MOOD_OPTIONS, entry.mood, ""),
    done: Boolean(entry.done),
    notes: text(entry.notes),
    grooming: Array.isArray(entry.grooming)
      ? [...new Set(entry.grooming.filter((id): id is string => typeof id === "string"))]
      : [],
  };
}

function normalizeRoutineData(data: unknown): RoutineEntry[] {
  const entries = records(data);
  if (!entries.length) {
    return createEmptyTimeline();
  }

  if (entries.every((entry) => typeof entry.date === "string")) {
    return ensureTimelineWindow(
      entries.map((entry) => normalizeRoutineEntry(entry, entry.date as string))
    );
  }

  // The very first version stored one undated row per weekday.
  if (entries.every((entry) => typeof entry.day === "string")) {
    const baseDate = getWeekStartDateKey();
    return ensureTimelineWindow(
      entries.map((entry, index) => normalizeRoutineEntry(entry, addDays(baseDate, index)))
    );
  }

  return createEmptyTimeline();
}

function normalizeBodyData(data: unknown): BodyProgress {
  const source = isRecord(data) ? data : {};

  return {
    heightCm: textOrNumber(source.heightCm),
    age: textOrNumber(source.age),
    sex: source.sex === "female" || source.sex === "male" ? source.sex : "",
    targetWeightKg: textOrNumber(source.targetWeightKg),
    entries: records(source.entries)
      .filter((entry) => typeof entry.date === "string")
      .map((entry) => ({
        date: entry.date as string,
        weightKg: textOrNumber(entry.weightKg),
        note: text(entry.note),
      }))
      .sort((a, b) => b.date.localeCompare(a.date)),
    workouts: newestFirst(
      records(source.workouts)
        .filter((entry) => typeof entry.id === "string")
        .map((entry) => ({
          id: entry.id as string,
          bodyPart: entry.bodyPart === "arms" ? "biceps" : oneOf(BODY_PARTS, entry.bodyPart, "chest"),
          title: text(entry.title),
          youtubeUrl: text(entry.youtubeUrl),
          note: text(entry.note),
          ...imageRef(entry),
          addedAt: text(entry.addedAt) || new Date().toISOString(),
        }))
    ),
    meals: newestFirst(
      records(source.meals)
        .filter((entry) => typeof entry.id === "string")
        .map((entry) => ({
          id: entry.id as string,
          mealType: oneOf(MEAL_TYPES, entry.mealType, "breakfast"),
          title: text(entry.title),
          link: text(entry.link),
          note: text(entry.note),
          ...imageRef(entry),
          addedAt: text(entry.addedAt) || new Date().toISOString(),
        }))
    ),
  };
}

function normalizeSkinLibraryData(data: unknown): SkinLibrary {
  const source = isRecord(data) ? data : {};

  return {
    videos: newestFirst(
      records(source.videos)
        .filter((entry) => typeof entry.videoId === "string")
        .map((entry) => {
          const addedAt = text(entry.addedAt) || new Date().toISOString();
          return {
            id: text(entry.id).trim() || `${entry.videoId}-${addedAt}`,
            url: text(entry.url),
            videoId: entry.videoId as string,
            customTitle: text(entry.customTitle),
            note: text(entry.note),
            youtubeTitle: text(entry.youtubeTitle),
            thumbnailUrl: text(entry.thumbnailUrl),
            addedAt,
          };
        })
    ),
    products: newestFirst(
      records(source.products)
        .filter((entry) => typeof entry.id === "string")
        .map((entry) => ({
          id: entry.id as string,
          name: text(entry.name),
          brand: text(entry.brand),
          category: text(entry.category),
          price: textOrNumber(entry.price),
          link: text(entry.link),
          season: oneOf(SKIN_SEASONS, entry.season, "spring"),
          skinType: oneOf(SKIN_TYPES, entry.skinType, "combo"),
          status: oneOf(PRODUCT_STATUSES, entry.status, "interested"),
          note: text(entry.note),
          ...imageRef(entry),
          addedAt: text(entry.addedAt) || new Date().toISOString(),
        }))
    ),
  };
}

function normalizeStyleData(data: unknown): StyleBoard {
  const source = isRecord(data) ? data : {};

  return {
    items: newestFirst(
      records(source.items)
        .filter((entry) => typeof entry.id === "string")
        .map((entry) => ({
          id: entry.id as string,
          category: oneOf(STYLE_CATEGORIES, entry.category, "outfit"),
          title: text(entry.title),
          link: text(entry.link),
          note: text(entry.note),
          ...imageRef(entry),
          addedAt: text(entry.addedAt) || new Date().toISOString(),
        }))
    ),
  };
}

function normalizeRoutineRepeats(data: unknown): RoutineRepeat[] {
  return records(data)
    .filter(
      (entry) =>
        typeof entry.id === "string" &&
        typeof entry.value === "string" &&
        typeof entry.sourceDate === "string" &&
        (entry.field === "grooming" || ROUTINE_FIELDS.some((option) => option.field === entry.field))
    )
    .map((entry) => ({
      id: entry.id as string,
      field: entry.field as RoutineRepeat["field"],
      value: entry.value as string,
      sourceDate: entry.sourceDate as string,
      intervalDays: Number.isInteger(entry.intervalDays) ? (entry.intervalDays as number) : 1,
      dates: Array.isArray(entry.dates)
        ? entry.dates.filter((date): date is string => typeof date === "string").sort()
        : [],
      createdAt: text(entry.createdAt) || new Date().toISOString(),
    }))
    .filter((repeat) => repeat.dates.length > 0);
}

/** Missing list → defaults; an empty list means the user removed them all. */
function normalizeGroomingItems(data: unknown): GroomingItem[] {
  if (!Array.isArray(data)) {
    return DEFAULT_GROOMING_ITEMS.map((item) => ({ ...item }));
  }
  return records(data)
    .filter((entry) => typeof entry.id === "string" && typeof entry.label === "string" && entry.label.trim())
    .map((entry) => ({ id: entry.id as string, label: (entry.label as string).trim() }));
}

/**
 * Accepts anything that was ever stored or exported (current payloads, the
 * `{ routine }` export wrapper, bare timelines, legacy weekly rows) and
 * returns a fully-populated JournalData. Uses the browser's local date, so
 * call it on the client.
 */
export function normalizeJournalData(input: unknown): JournalData {
  const data = isRecord(input) && isRecord(input.routine) ? input.routine : input;

  if (isRecord(data)) {
    return {
      skinTimeline: normalizeRoutineData(data.skinTimeline),
      routineRepeats: normalizeRoutineRepeats(data.routineRepeats),
      groomingItems: normalizeGroomingItems(data.groomingItems),
      bodyProgress: normalizeBodyData(data.bodyProgress),
      skinLibrary: normalizeSkinLibraryData(data.skinLibrary),
      styleBoard: normalizeStyleData(data.styleBoard),
    };
  }

  return {
    skinTimeline: normalizeRoutineData(data),
    routineRepeats: [],
    groomingItems: normalizeGroomingItems(undefined),
    bodyProgress: normalizeBodyData(null),
    skinLibrary: normalizeSkinLibraryData(null),
    styleBoard: normalizeStyleData(null),
  };
}

export function toPayload(data: JournalData): JournalPayload {
  return { version: JOURNAL_PAYLOAD_VERSION, ...data };
}
