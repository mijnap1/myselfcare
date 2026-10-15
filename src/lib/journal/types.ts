import type {
  BODY_PARTS,
  MOOD_OPTIONS,
  PRODUCT_STATUSES,
  ROUTINE_FIELDS,
  SKIN_SEASONS,
  SKIN_TYPES,
  STYLE_CATEGORIES,
} from "./constants";

export type Season = (typeof SKIN_SEASONS)[number]["value"];
export type SkinType = (typeof SKIN_TYPES)[number]["value"];
export type ProductStatus = (typeof PRODUCT_STATUSES)[number]["value"];
export type BodyPart = (typeof BODY_PARTS)[number]["value"];
export type StyleCategory = (typeof STYLE_CATEGORIES)[number]["value"];
export type Mood = (typeof MOOD_OPTIONS)[number]["value"];
export type RoutineField = (typeof ROUTINE_FIELDS)[number]["field"];
/** Text fields plus the grooming checklist; a grooming repeat's `value` is the item id. */
export type RepeatField = RoutineField | "grooming";
export type Sex = "female" | "male" | "";

/**
 * An image is stored in Supabase Storage (`imagePath`). Older data kept
 * base64 JPEGs inline (`imageDataUrl`); those are uploaded and cleared on load.
 */
export interface ImageRef {
  imagePath: string;
  imageDataUrl: string;
}

export interface RoutineEntry {
  date: string;
  morning: string;
  faceRoutine: string;
  eveningCleanse: string;
  skincare: string;
  /** No longer shown (replaced by grooming); kept so older entries aren't lost. */
  extraCare: string;
  mood: Mood | "";
  done: boolean;
  notes: string;
  /** Ids of grooming items done (or planned) that day. */
  grooming: string[];
}

export interface GroomingItem {
  id: string;
  label: string;
}

/**
 * A repeat applied from one routine cell. `dates` are the cells it filled, so
 * the repeat can be removed later without touching cells edited by hand.
 */
export interface RoutineRepeat {
  id: string;
  field: RepeatField;
  value: string;
  sourceDate: string;
  intervalDays: number;
  dates: string[];
  createdAt: string;
}

export interface BodyEntry {
  date: string;
  weightKg: string;
  note: string;
}

export interface Workout extends ImageRef {
  id: string;
  bodyPart: BodyPart;
  title: string;
  youtubeUrl: string;
  note: string;
  addedAt: string;
}

export interface BodyProgress {
  heightCm: string;
  age: string;
  sex: Sex;
  targetWeightKg: string;
  entries: BodyEntry[];
  workouts: Workout[];
}

export interface SkinVideo {
  id: string;
  url: string;
  videoId: string;
  customTitle: string;
  note: string;
  youtubeTitle: string;
  thumbnailUrl: string;
  addedAt: string;
}

export interface SkinProduct extends ImageRef {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: string;
  link: string;
  season: Season;
  skinType: SkinType;
  status: ProductStatus;
  note: string;
  addedAt: string;
}

export interface SkinLibrary {
  videos: SkinVideo[];
  products: SkinProduct[];
}

export interface StyleItem extends ImageRef {
  id: string;
  category: StyleCategory;
  title: string;
  link: string;
  note: string;
  addedAt: string;
}

export interface StyleBoard {
  items: StyleItem[];
}

export interface JournalData {
  skinTimeline: RoutineEntry[];
  routineRepeats: RoutineRepeat[];
  groomingItems: GroomingItem[];
  bodyProgress: BodyProgress;
  skinLibrary: SkinLibrary;
  styleBoard: StyleBoard;
}

export const JOURNAL_PAYLOAD_VERSION = 7;

export interface JournalPayload extends JournalData {
  version: typeof JOURNAL_PAYLOAD_VERSION;
}
