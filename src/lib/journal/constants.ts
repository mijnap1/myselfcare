export const TIMELINE_WINDOW_DAYS = 21;
export const TIMELINE_APPEND_DAYS = 7;
export const KOREAN_WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

export const SKIN_SEASONS = [
  { value: "spring", label: "봄", icon: "leaf-outline" },
  { value: "summer", label: "여름", icon: "sunny-outline" },
  { value: "fall", label: "가을", icon: "leaf-outline" },
  { value: "winter", label: "겨울", icon: "snow-outline" },
] as const;

export const SKIN_TYPES = [
  { value: "dry", label: "건성" },
  { value: "oily", label: "지성" },
  { value: "combo", label: "수부지 / 복합성" },
] as const;

export const PRODUCT_STATUSES = [
  { value: "interested", label: "Interested" },
  { value: "buy-next", label: "Buy next" },
  { value: "bought", label: "Bought" },
  { value: "testing", label: "Testing" },
] as const;

export const BODY_PARTS = [
  { value: "chest", label: "가슴", icon: "body-outline" },
  { value: "back", label: "등", icon: "body-outline" },
  { value: "shoulders", label: "어깨", icon: "accessibility-outline" },
  { value: "biceps", label: "이두", icon: "barbell-outline" },
  { value: "triceps", label: "삼두", icon: "barbell-outline" },
  { value: "forearms", label: "전완", icon: "barbell-outline" },
  { value: "core", label: "복근", icon: "ellipse-outline" },
  { value: "legs", label: "하체", icon: "walk-outline" },
  { value: "cardio", label: "유산소", icon: "pulse-outline" },
] as const;

export const MEAL_TYPES = [
  { value: "breakfast", label: "아침", icon: "cafe-outline" },
  { value: "lunch", label: "점심", icon: "restaurant-outline" },
  { value: "dinner", label: "저녁", icon: "moon-outline" },
  { value: "snack", label: "간식", icon: "nutrition-outline" },
] as const;

export const STYLE_CATEGORIES = [
  { value: "outfit", label: "코디", icon: "shirt-outline" },
  { value: "fragrance", label: "향수", icon: "sparkles-outline" },
  { value: "hair", label: "헤어스타일", icon: "cut-outline" },
  { value: "wishlist", label: "위시리스트", icon: "bag-handle-outline" },
] as const;

export const MOOD_OPTIONS = [
  { value: "calm", label: "Calm", icon: "leaf-outline" },
  { value: "glowy", label: "Glowy", icon: "sparkles-outline" },
  { value: "dry", label: "Dry", icon: "water-outline" },
  { value: "sensitive", label: "Sensitive", icon: "rose-outline" },
] as const;

export const ROUTINE_FIELDS = [
  { field: "morning", label: "Morning routine", icon: "sunny-outline" },
  { field: "faceRoutine", label: "Face routine", icon: "happy-outline" },
  { field: "eveningCleanse", label: "Evening cleanse", icon: "moon-outline" },
  { field: "skincare", label: "Afternoon/Evening skincare", icon: "flask-outline" },
  { field: "notes", label: "Notes", icon: "document-text-outline" },
] as const;

/** Starting grooming checklist; users can add and remove items. */
export const DEFAULT_GROOMING_ITEMS = [
  { id: "shave", label: "면도" },
  { id: "nails", label: "손톱 깎기" },
  { id: "hand-hair", label: "손 털" },
  { id: "belly-hair", label: "배 털" },
  { id: "mask-pack", label: "마스크팩" },
];

export const THEME_STORAGE_KEY = "my-skin-journal-theme";
export const ACTIVE_VIEW_KEY = "my-skin-journal-active-view";
export const ACTIVE_SKIN_SECTION_KEY = "my-skin-journal-active-skin-section";
export const ACTIVE_BODY_SECTION_KEY = "my-skin-journal-active-body-section";
export const ACTIVE_BODY_NOTES_KEY = "my-skin-journal-active-body-notes";

export const IMAGE_BUCKET = "journal-images";
