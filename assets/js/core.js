const STORAGE_KEY = "my-skin-journal-routine-v1";
const THEME_STORAGE_KEY = "my-skin-journal-theme";
const SESSION_STORAGE_KEY = "my-skin-journal-session";
const SUPABASE_URL = "https://vglbxczlwztpwdpvcmte.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_xruzoF0QoYwU5V7nHspv1g_yfICa38n";
const TIMELINE_WINDOW_DAYS = 21;
const TIMELINE_APPEND_DAYS = 7;
const KOREAN_WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const ACTIVE_VIEW_KEY = "my-skin-journal-active-view";
const ACTIVE_SKIN_SECTION_KEY = "my-skin-journal-active-skin-section";
const ACTIVE_BODY_SECTION_KEY = "my-skin-journal-active-body-section";

const legacySampleRoutine = [
  {
    day: "월",
    morning: "물 or 폼 → 수분엠플/세럼 → 나이아신아마이드 → 수분크림 → 선크림",
    eveningCleanse: "폼",
    skincare: "비타민C → 수분크림 → (필요 시) 에스트라",
    extraCare: "면도",
    done: false,
    notes: "",
  },
  {
    day: "화",
    morning: "물 or 폼 → 수분엠플/세럼 → 나이아신아마이드 → 수분크림 → 선크림",
    eveningCleanse: "오일 → 폼",
    skincare: "레티놀 → 수분크림 → 에스트라",
    extraCare: "코털 정리",
    done: false,
    notes: "",
  },
  {
    day: "수",
    morning: "물 or 폼 → 수분엠플/세럼 → 나이아신아마이드 → 수분크림 → 선크림",
    eveningCleanse: "폼",
    skincare: "비타민C → 수분크림 → (필요 시) 에스트라",
    extraCare: "면도",
    done: false,
    notes: "",
  },
  {
    day: "목",
    morning: "물 or 폼 → 수분엠플/세럼 → 나이아신아마이드 → 수분크림 → 선크림",
    eveningCleanse: "폼",
    skincare: "비타민C → 수분크림 → (필요 시) 에스트라",
    extraCare: "없음",
    done: false,
    notes: "",
  },
  {
    day: "금",
    morning: "물 or 폼 → 수분엠플/세럼 → 나이아신아마이드 → 수분크림 → 선크림",
    eveningCleanse: "오일 → 폼",
    skincare: "레티놀 → 수분크림 → 에스트라",
    extraCare: "면도",
    done: false,
    notes: "",
  },
  {
    day: "토",
    morning: "물 or 폼 → 수분엠플/세럼 → 나이아신아마이드 → 수분크림 → 선크림",
    eveningCleanse: "폼",
    skincare: "클레이 → 토너 → 수분크림 → 에스트라",
    extraCare: "코털 정리",
    done: false,
    notes: "",
  },
  {
    day: "일",
    morning: "물 or 폼 → 수분엠플/세럼 → 나이아신아마이드 → 수분크림 → 선크림",
    eveningCleanse: "폼",
    skincare: "비타민C → 수분·진정 마스크팩 → 수분크림 → (필요 시) 에스트라",
    extraCare: "면도",
    done: false,
    notes: "",
  },
];

const tableBody = document.getElementById("routineTableBody");
const mobileCards = document.getElementById("mobileCards");
const saveStatus = document.getElementById("saveStatus");
const themeToggle = document.getElementById("themeToggle");
const settingsButton = document.getElementById("settingsButton");
const settingsPanel = document.getElementById("settingsPanel");
const duplicateWeekButton = document.getElementById("duplicateWeekButton");
const exportButton = document.getElementById("exportButton");
const importButton = document.getElementById("importButton");
const importFileInput = document.getElementById("importFileInput");
const prevWeekButton = document.getElementById("prevWeekButton");
const nextWeekButton = document.getElementById("nextWeekButton");
const weekRangeLabel = document.getElementById("weekRangeLabel");
const journalSummary = document.getElementById("journalSummary");
const skinVideoForm = document.getElementById("skinVideoForm");
const skinVideoUrlInput = document.getElementById("skinVideoUrlInput");
const skinVideoTitleInput = document.getElementById("skinVideoTitleInput");
const skinVideoNoteInput = document.getElementById("skinVideoNoteInput");
const skinVideoPreview = document.getElementById("skinVideoPreview");
const skinVideoList = document.getElementById("skinVideoList");
const skinRoutineTab = document.getElementById("skinRoutineTab");
const skinProductsTab = document.getElementById("skinProductsTab");
const skinRoutineSection = document.getElementById("skinRoutineSection");
const skinProductsSection = document.getElementById("skinProductsSection");
const skinProductMatrix = document.getElementById("skinProductMatrix");
const skinProductMobileList = document.getElementById("skinProductMobileList");
const skinProductForm = document.getElementById("skinProductForm");
const skinProductTarget = document.getElementById("skinProductTarget");
const skinProductNameInput = document.getElementById("skinProductNameInput");
const skinProductBrandInput = document.getElementById("skinProductBrandInput");
const skinProductCategoryInput = document.getElementById("skinProductCategoryInput");
const skinProductPriceInput = document.getElementById("skinProductPriceInput");
const skinProductLinkInput = document.getElementById("skinProductLinkInput");
const skinProductStatusInput = document.getElementById("skinProductStatusInput");
const skinProductNoteInput = document.getElementById("skinProductNoteInput");
const skinProductImageZone = document.getElementById("skinProductImageZone");
const skinProductImagePreview = document.getElementById("skinProductImagePreview");
const skinProductImageInput = document.getElementById("skinProductImageInput");
const skinTypeSelector = document.getElementById("skinTypeSelector");
const skinViewTab = document.getElementById("skinViewTab");
const bodyViewTab = document.getElementById("bodyViewTab");
const styleViewTab = document.getElementById("styleViewTab");
const skinSubtabs = document.querySelector(".skin-subtabs");
const bodySubtabs = document.querySelector(".body-subtabs");
const skinView = document.getElementById("skinView");
const bodyView = document.getElementById("bodyView");
const styleView = document.getElementById("styleView");
const bodyProgressTab = document.getElementById("bodyProgressTab");
const bodyWorkoutTab = document.getElementById("bodyWorkoutTab");
const bodyProgressSection = document.getElementById("bodyProgressSection");
const bodyWorkoutSection = document.getElementById("bodyWorkoutSection");
const bodyHero = document.getElementById("bodyHero");
const heightInput = document.getElementById("heightInput");
const ageInput = document.getElementById("ageInput");
const sexInput = document.getElementById("sexInput");
const sexButtons = sexInput ? Array.from(sexInput.querySelectorAll("[data-sex-value]")) : [];
const targetWeightInput = document.getElementById("targetWeightInput");
const bodyEntryForm = document.getElementById("bodyEntryForm");
const bodyWeightInput = document.getElementById("bodyWeightInput");
const bodyDateInput = document.getElementById("bodyDateInput");
const bodyDateToggle = document.getElementById("bodyDateToggle");
const bodyCalendarPanel = document.getElementById("bodyCalendarPanel");
const bodyNoteInput = document.getElementById("bodyNoteInput");
const bodyChart = document.getElementById("bodyChart");
const bodyHistory = document.getElementById("bodyHistory");
const bodyWorkoutForm = document.getElementById("bodyWorkoutForm");
const bodyWorkoutPartInput = document.getElementById("bodyWorkoutPartInput");
const bodyPartButtons = bodyWorkoutPartInput
  ? Array.from(bodyWorkoutPartInput.querySelectorAll("[data-body-part]"))
  : [];
const bodyWorkoutTitleInput = document.getElementById("bodyWorkoutTitleInput");
const bodyWorkoutYoutubeInput = document.getElementById("bodyWorkoutYoutubeInput");
const bodyWorkoutNoteInput = document.getElementById("bodyWorkoutNoteInput");
const bodyWorkoutImageZone = document.getElementById("bodyWorkoutImageZone");
const bodyWorkoutImagePreview = document.getElementById("bodyWorkoutImagePreview");
const bodyWorkoutImageInput = document.getElementById("bodyWorkoutImageInput");
const bodyWorkoutList = document.getElementById("bodyWorkoutList");
const styleItemForm = document.getElementById("styleItemForm");
const styleCategoryInput = document.getElementById("styleCategoryInput");
const styleCategoryButtons = styleCategoryInput
  ? Array.from(styleCategoryInput.querySelectorAll("[data-style-category]"))
  : [];
const styleItemTitleInput = document.getElementById("styleItemTitleInput");
const styleItemLinkInput = document.getElementById("styleItemLinkInput");
const styleItemNoteInput = document.getElementById("styleItemNoteInput");
const styleItemImageZone = document.getElementById("styleItemImageZone");
const styleItemImagePreview = document.getElementById("styleItemImagePreview");
const styleItemImageInput = document.getElementById("styleItemImageInput");
const styleItemList = document.getElementById("styleItemList");
const authCard = document.getElementById("authCard");
const appContent = document.getElementById("appContent");
const authStatus = document.getElementById("authStatus");
const authUserEmail = document.getElementById("authUserEmail");
const logoutButton = document.getElementById("logoutButton");
const authForm = document.getElementById("authForm");
const authUsername = document.getElementById("authUsername");
const authPassword = document.getElementById("authPassword");
const authMessage = document.getElementById("authMessage");
const authSubmit = document.getElementById("authSubmit");
const signInTab = document.getElementById("signInTab");
const signUpTab = document.getElementById("signUpTab");
const resetPasswordButton = document.getElementById("resetPasswordButton");
const undoToast = document.getElementById("undoToast");
const undoToastMessage = document.getElementById("undoToastMessage");
const undoToastButton = document.getElementById("undoToastButton");
const undoToastClose = document.getElementById("undoToastClose");

const SKIN_SEASONS = [
  { value: "spring", label: "봄", icon: "leaf-outline" },
  { value: "summer", label: "여름", icon: "sunny-outline" },
  { value: "fall", label: "가을", icon: "leaf-outline" },
  { value: "winter", label: "겨울", icon: "snow-outline" },
];
const SKIN_TYPES = [
  { value: "dry", label: "건성" },
  { value: "oily", label: "지성" },
  { value: "combo", label: "수부지 / 복합성" },
];
const BODY_PARTS = [
  { value: "chest", label: "가슴", icon: "body-outline" },
  { value: "back", label: "등", icon: "body-outline" },
  { value: "shoulders", label: "어깨", icon: "accessibility-outline" },
  { value: "biceps", label: "이두", icon: "barbell-outline" },
  { value: "triceps", label: "삼두", icon: "barbell-outline" },
  { value: "forearms", label: "전완", icon: "barbell-outline" },
  { value: "core", label: "복근", icon: "ellipse-outline" },
  { value: "legs", label: "하체", icon: "walk-outline" },
  { value: "cardio", label: "유산소", icon: "pulse-outline" },
];
const STYLE_CATEGORIES = [
  { value: "outfit", label: "코디", icon: "shirt-outline" },
  { value: "fragrance", label: "향수", icon: "sparkles-outline" },
  { value: "hair", label: "헤어스타일", icon: "cut-outline" },
  { value: "wishlist", label: "위시리스트", icon: "bag-handle-outline" },
];
const moodOptions = [
  { value: "calm", label: "Calm", icon: "leaf-outline" },
  { value: "glowy", label: "Glowy", icon: "sparkles-outline" },
  { value: "dry", label: "Dry", icon: "water-outline" },
  { value: "sensitive", label: "Sensitive", icon: "rose-outline" },
];

let routineData = loadRoutine();
let bodyData = loadBodyData();
let skinLibraryData = loadSkinLibraryData();
let styleData = loadStyleData();
let currentTheme = loadTheme();
let mobileOpenDay = getTodayIndex();
let mobileEditDay = null;
let authMode = "sign-in";
let supabaseClient = null;
let currentUser = null;
let currentSessionToken = loadSessionToken();
let remoteSaveTimer = null;
let visibleWeekStart = 0;
let isSettingsOpen = false;
let activeView = loadActiveView();
let activeSkinSection = loadActiveSkinSection();
let activeBodySection = loadActiveBodySection();
let fallbackClipboard = "";
let contextMenuState = null;
let longPressTimer = null;
let isBodyCalendarOpen = false;
let bodyCalendarMonth = getWeekStartDateKey().slice(0, 7);
let skinVideoPreviewState = null;
let skinVideoPreviewTimer = null;
let editingSkinVideoId = "";
let skinProductStatus = "interested";
let skinProductImageData = "";
let skinProductTargetCell = { season: "spring", skinType: "combo" };
let editingSkinProductId = "";
let bodyWorkoutPart = "chest";
let bodyWorkoutImageData = "";
let editingBodyWorkoutId = "";
let styleCategory = "outfit";
let styleItemImageData = "";
let editingStyleItemId = "";
let undoToastTimer = null;
let pendingUndoAction = null;
const cellContextMenu = createCellContextMenu();

function normalizeMorningRoutine(morning) {
  if (typeof morning !== "string" || !morning.includes("나이아신아마이드")) {
    return typeof morning === "string" ? morning : "";
  }

  if (morning.includes("수분엠플/세럼")) {
    return morning;
  }

  return morning.replace(
    "나이아신아마이드",
    "수분엠플/세럼 → 나이아신아마이드"
  );
}

function getRoutineParts(value) {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/\n|→/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getTodayDateKey() {
  return formatDateKey(new Date());
}

function addDays(dateKey, days) {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + days);
  return formatDateKey(date);
}

function getWeekStartDateKey(dateKey = getTodayDateKey()) {
  const date = parseDateKey(dateKey);
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diffToMonday);
  return formatDateKey(date);
}

function getWeekdayLabel(dateKey) {
  return KOREAN_WEEKDAYS[parseDateKey(dateKey).getDay()];
}

function formatDateLabel(dateKey) {
  const date = parseDateKey(dateKey);
  return `${date.getMonth() + 1}.${date.getDate()}`;
}

function formatCalendarDateLabel(dateKey) {
  const date = parseDateKey(dateKey);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function formatCalendarMonthLabel(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return `${year}.${String(month).padStart(2, "0")}`;
}

function shiftMonth(monthKey, delta) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function normalizeDecimalInput(value) {
  return String(value || "")
    .trim()
    .replace(",", ".")
    .replace(/[^0-9.]/g, "")
    .replace(/(\..*)\./g, "$1");
}

function readImageFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error || new Error("Failed to read image."));
    reader.readAsDataURL(file);
  });
}

function loadImageElement(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image."));
    image.src = source;
  });
}

async function getOptimizedImageDataUrl(file, maxSize = 900, quality = 0.72) {
  if (!file || !file.type.startsWith("image/")) {
    return "";
  }

  const originalDataUrl = await readImageFileAsDataUrl(file);
  if (file.type === "image/svg+xml") {
    return originalDataUrl;
  }

  const image = await loadImageElement(originalDataUrl);
  const ratio = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * ratio));
  const height = Math.max(1, Math.round(image.naturalHeight * ratio));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    return originalDataUrl;
  }

  context.fillStyle = "#111518";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}

function createSkinVideoId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function extractYouTubeVideoId(url) {
  if (typeof url !== "string" || !url.trim()) {
    return "";
  }

  try {
    const parsedUrl = new URL(url.trim());
    const host = parsedUrl.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return parsedUrl.pathname.slice(1).split("/")[0];
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsedUrl.pathname === "/watch") {
        return parsedUrl.searchParams.get("v") || "";
      }

      if (parsedUrl.pathname.startsWith("/shorts/")) {
        return parsedUrl.pathname.split("/")[2] || "";
      }

      if (parsedUrl.pathname.startsWith("/embed/")) {
        return parsedUrl.pathname.split("/")[2] || "";
      }
    }
  } catch (error) {
    return "";
  }

  return "";
}

function buildYouTubeWatchUrl(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

function buildYouTubeEmbedUrl(videoId) {
  return `https://www.youtube.com/embed/${videoId}`;
}

function buildYouTubeThumbnailUrl(videoId) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function fetchYouTubeTitle(videoId) {
  if (!videoId) {
    return "";
  }

  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(
        buildYouTubeWatchUrl(videoId)
      )}&format=json`
    );

    if (!response.ok) {
      throw new Error(`oEmbed request failed: ${response.status}`);
    }

    const data = await response.json();
    return typeof data.title === "string" ? data.title : "";
  } catch (error) {
    console.warn("Failed to fetch YouTube title:", error);
    return "";
  }
}

function renderSkinVideoPreview() {
  if (!skinVideoPreviewState?.videoId) {
    skinVideoPreview.hidden = true;
    skinVideoPreview.innerHTML = "";
    return;
  }

  const previewTitle =
    skinVideoTitleInput.value.trim() ||
    skinVideoPreviewState.youtubeTitle ||
    "YouTube video preview";
  const previewNote = skinVideoNoteInput.value.trim();

  skinVideoPreview.hidden = false;
  skinVideoPreview.innerHTML = `
    <div class="skin-video-preview-frame">
      <iframe
        src="${buildYouTubeEmbedUrl(skinVideoPreviewState.videoId)}"
        title="${escapeHtml(previewTitle)}"
        loading="lazy"
        referrerpolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      ></iframe>
    </div>
    <div class="skin-video-preview-copy">
      <p class="summary-kicker">Preview</p>
      <h3>${escapeHtml(previewTitle)}</h3>
      ${
        skinVideoPreviewState.youtubeTitle
          ? `<p class="skin-video-source-title">${escapeHtml(
              skinVideoPreviewState.youtubeTitle
            )}</p>`
          : `<p class="skin-video-source-title is-muted">${
              skinVideoPreviewState.isLoading ? "영상 제목 불러오는 중..." : "영상 제목을 불러오지 못했어요."
            }</p>`
      }
      ${
        previewNote
          ? `<p class="skin-video-preview-note">${escapeHtml(previewNote)}</p>`
          : '<p class="skin-video-preview-note is-muted">개인 제목이나 메모를 남겨두면 나중에 찾기 쉬워져요.</p>'
      }
    </div>
  `;
}

async function syncSkinVideoPreview() {
  const videoId = extractYouTubeVideoId(skinVideoUrlInput.value);

  if (!videoId) {
    skinVideoPreviewState = null;
    renderSkinVideoPreview();
    return;
  }

  if (skinVideoPreviewState?.videoId !== videoId) {
    skinVideoPreviewState = {
      videoId,
      youtubeTitle: "",
      isLoading: true,
    };
    renderSkinVideoPreview();
  }

  const youtubeTitle = await fetchYouTubeTitle(videoId);
  if (!skinVideoPreviewState || skinVideoPreviewState.videoId !== videoId) {
    return;
  }

  skinVideoPreviewState = {
    videoId,
    youtubeTitle,
    isLoading: false,
  };
  renderSkinVideoPreview();
}

function queueSkinVideoPreviewSync() {
  window.clearTimeout(skinVideoPreviewTimer);
  skinVideoPreviewTimer = window.setTimeout(() => {
    syncSkinVideoPreview();
  }, 180);
}

function createEmptyEntry(dateKey) {
  return {
    date: dateKey,
    morning: "",
    eveningCleanse: "",
    skincare: "",
    extraCare: "",
    mood: "",
    done: false,
    notes: "",
  };
}

function createEmptyTimeline(
  startDateKey = getWeekStartDateKey(),
  days = TIMELINE_WINDOW_DAYS
) {
  return Array.from({ length: days }, (_, index) => createEmptyEntry(addDays(startDateKey, index)));
}

function createEmptyBodyData() {
  return {
    heightCm: "",
    age: "",
    sex: "",
    targetWeightKg: "",
    entries: [],
    workouts: [],
  };
}

function createEmptySkinLibraryData() {
  return {
    videos: [],
    products: [],
  };
}

function createEmptyStyleData() {
  return {
    items: [],
  };
}

function normalizeBodyData(data) {
  if (!data || typeof data !== "object") {
    return createEmptyBodyData();
  }

  const entries = Array.isArray(data.entries)
    ? data.entries
        .filter((entry) => entry && typeof entry.date === "string")
        .map((entry) => ({
          date: entry.date,
          weightKg:
            typeof entry.weightKg === "string" || typeof entry.weightKg === "number"
              ? String(entry.weightKg)
              : "",
          note: typeof entry.note === "string" ? entry.note : "",
        }))
        .sort((a, b) => b.date.localeCompare(a.date))
    : [];

  return {
    heightCm:
      typeof data.heightCm === "string" || typeof data.heightCm === "number"
        ? String(data.heightCm)
        : "",
    age:
      typeof data.age === "string" || typeof data.age === "number"
        ? String(data.age)
        : "",
    sex: data.sex === "female" || data.sex === "male" ? data.sex : "",
    targetWeightKg:
      typeof data.targetWeightKg === "string" || typeof data.targetWeightKg === "number"
        ? String(data.targetWeightKg)
        : "",
    entries,
    workouts: Array.isArray(data.workouts)
      ? data.workouts
          .filter((entry) => entry && typeof entry.id === "string")
          .map((entry) => ({
            id: entry.id,
            bodyPart:
              entry.bodyPart === "arms"
                ? "biceps"
                : BODY_PARTS.some((item) => item.value === entry.bodyPart)
                  ? entry.bodyPart
                  : "chest",
            title: typeof entry.title === "string" ? entry.title : "",
            youtubeUrl: typeof entry.youtubeUrl === "string" ? entry.youtubeUrl : "",
            note: typeof entry.note === "string" ? entry.note : "",
            imageDataUrl: typeof entry.imageDataUrl === "string" ? entry.imageDataUrl : "",
            addedAt: typeof entry.addedAt === "string" ? entry.addedAt : new Date().toISOString(),
          }))
          .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
      : [],
  };
}

function normalizeSkinLibraryData(data) {
  if (!data || typeof data !== "object") {
    return createEmptySkinLibraryData();
  }

  const videos = Array.isArray(data.videos)
    ? data.videos
        .filter((entry) => entry && typeof entry.videoId === "string")
        .map((entry) => ({
          id:
            typeof entry.id === "string" && entry.id.trim()
              ? entry.id
              : `${entry.videoId}-${entry.addedAt || Date.now()}`,
          url: typeof entry.url === "string" ? entry.url : "",
          videoId: entry.videoId,
          customTitle: typeof entry.customTitle === "string" ? entry.customTitle : "",
          note: typeof entry.note === "string" ? entry.note : "",
          youtubeTitle: typeof entry.youtubeTitle === "string" ? entry.youtubeTitle : "",
          thumbnailUrl: typeof entry.thumbnailUrl === "string" ? entry.thumbnailUrl : "",
          addedAt: typeof entry.addedAt === "string" ? entry.addedAt : new Date().toISOString(),
        }))
        .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
    : [];

  return {
    videos,
    products: Array.isArray(data.products)
      ? data.products
          .filter((entry) => entry && typeof entry.id === "string")
          .map((entry) => ({
            id: entry.id,
            name: typeof entry.name === "string" ? entry.name : "",
            brand: typeof entry.brand === "string" ? entry.brand : "",
            category: typeof entry.category === "string" ? entry.category : "",
            price: typeof entry.price === "string" || typeof entry.price === "number" ? String(entry.price) : "",
            link: typeof entry.link === "string" ? entry.link : "",
            season: SKIN_SEASONS.some((item) => item.value === entry.season) ? entry.season : "spring",
            skinType: SKIN_TYPES.some((item) => item.value === entry.skinType) ? entry.skinType : "combo",
            status:
              entry.status === "interested" ||
              entry.status === "buy-next" ||
              entry.status === "bought" ||
              entry.status === "testing"
                ? entry.status
                : "interested",
            note: typeof entry.note === "string" ? entry.note : "",
            imageDataUrl: typeof entry.imageDataUrl === "string" ? entry.imageDataUrl : "",
            addedAt: typeof entry.addedAt === "string" ? entry.addedAt : new Date().toISOString(),
          }))
          .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
      : [],
  };
}

function normalizeStyleData(data) {
  if (!data || typeof data !== "object") {
    return createEmptyStyleData();
  }

  return {
    items: Array.isArray(data.items)
      ? data.items
          .filter((entry) => entry && typeof entry.id === "string")
          .map((entry) => ({
            id: entry.id,
            category: STYLE_CATEGORIES.some((item) => item.value === entry.category)
              ? entry.category
              : "outfit",
            title: typeof entry.title === "string" ? entry.title : "",
            link: typeof entry.link === "string" ? entry.link : "",
            note: typeof entry.note === "string" ? entry.note : "",
            imageDataUrl: typeof entry.imageDataUrl === "string" ? entry.imageDataUrl : "",
            addedAt: typeof entry.addedAt === "string" ? entry.addedAt : new Date().toISOString(),
          }))
          .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
      : [],
  };
}

function normalizeAppData(data) {
  if (data && typeof data === "object" && !Array.isArray(data) && data.skinTimeline) {
    return {
      skinTimeline: normalizeRoutineData(data.skinTimeline),
      bodyProgress: normalizeBodyData(data.bodyProgress),
      skinLibrary: normalizeSkinLibraryData(data.skinLibrary),
      styleBoard: normalizeStyleData(data.styleBoard),
    };
  }

  return {
    skinTimeline: normalizeRoutineData(data),
    bodyProgress: createEmptyBodyData(),
    skinLibrary: createEmptySkinLibraryData(),
    styleBoard: createEmptyStyleData(),
  };
}

function isLegacyWeeklyData(data) {
  return (
    Array.isArray(data) &&
    data.length > 0 &&
    data.every((entry) => typeof entry?.day === "string" && !entry?.date)
  );
}

function isDatedTimeline(data) {
  return (
    Array.isArray(data) &&
    data.length > 0 &&
    data.every((entry) => typeof entry?.date === "string")
  );
}

function hasMeaningfulRoutine(data) {
  if (!Array.isArray(data) || !data.length) {
    return false;
  }

  return data.some((entry) =>
    [entry.morning, entry.eveningCleanse, entry.skincare, entry.extraCare, entry.notes]
      .some((value) => typeof value === "string" && value.trim())
  );
}

function hasMeaningfulSkinLibrary(data) {
  return (
    (Array.isArray(data?.videos) && data.videos.length > 0) ||
    (Array.isArray(data?.products) && data.products.length > 0)
  );
}

function hasMeaningfulStyleData(data) {
  return Array.isArray(data?.items) && data.items.length > 0;
}

function normalizeTimelineEntries(entries) {
  if (!Array.isArray(entries)) {
    return createEmptyTimeline();
  }

  const normalized = entries
    .filter((entry) => entry && typeof entry.date === "string")
    .map((entry) => ({
      date: entry.date,
      morning: normalizeMorningRoutine(entry.morning),
      eveningCleanse: typeof entry.eveningCleanse === "string" ? entry.eveningCleanse : "",
      skincare: typeof entry.skincare === "string" ? entry.skincare : "",
      extraCare: typeof entry.extraCare === "string" ? entry.extraCare : "",
      mood: typeof entry.mood === "string" ? entry.mood : "",
      done: Boolean(entry.done),
      notes: typeof entry.notes === "string" ? entry.notes : "",
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return ensureTimelineWindow(normalized);
}

function migrateLegacyRoutineToTimeline(data) {
  const baseDate = getWeekStartDateKey();
  const source = Array.isArray(data) && data.length ? data : legacySampleRoutine;
  const entries = source.map((entry, index) => ({
    date: addDays(baseDate, index),
    morning: normalizeMorningRoutine(entry.morning),
    eveningCleanse: typeof entry.eveningCleanse === "string" ? entry.eveningCleanse : "",
    skincare: typeof entry.skincare === "string" ? entry.skincare : "",
    extraCare: typeof entry.extraCare === "string" ? entry.extraCare : "",
    mood: typeof entry.mood === "string" ? entry.mood : "",
    done: Boolean(entry.done),
    notes: typeof entry.notes === "string" ? entry.notes : "",
  }));

  return ensureTimelineWindow(entries);
}

function ensureTimelineWindow(entries) {
  if (!Array.isArray(entries) || !entries.length) {
    return createEmptyTimeline();
  }

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const mondayStart = getWeekStartDateKey(sorted[0].date);
  const timeline = [];
  const firstDate = mondayStart < sorted[0].date ? mondayStart : sorted[0].date;
  const targetLength = Math.max(TIMELINE_WINDOW_DAYS, sorted.length);
  const entryMap = new Map(sorted.map((entry) => [entry.date, entry]));

  for (let index = 0; index < targetLength; index += 1) {
    const dateKey = addDays(firstDate, index);
    timeline.push(entryMap.get(dateKey) || createEmptyEntry(dateKey));
  }

  const todayKey = getTodayDateKey();
  const currentWeekStart = getWeekStartDateKey(todayKey);

  while (timeline[0].date > currentWeekStart) {
    timeline.unshift(createEmptyEntry(addDays(timeline[0].date, -1)));
  }

  while (timeline[timeline.length - 1].date < todayKey) {
    timeline.push(createEmptyEntry(addDays(timeline[timeline.length - 1].date, 1)));
  }

  while (timeline[timeline.length - 1].date < addDays(currentWeekStart, 6)) {
    timeline.push(createEmptyEntry(addDays(timeline[timeline.length - 1].date, 1)));
  }

  return timeline;
}

function normalizeRoutineData(data) {
  if (isDatedTimeline(data)) {
    return normalizeTimelineEntries(data);
  }

  if (isLegacyWeeklyData(data)) {
    return migrateLegacyRoutineToTimeline(data);
  }

  if (Array.isArray(data) && !data.length) {
    return createEmptyTimeline();
  }

  return createEmptyTimeline();
}

function loadRoutine() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return createEmptyTimeline();
    }

    const parsed = JSON.parse(saved);
    const normalized = normalizeAppData(parsed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized.skinTimeline;
  } catch (error) {
    console.warn("Failed to read saved routine:", error);
    return createEmptyTimeline();
  }
}

function loadBodyData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return createEmptyBodyData();
    }

    const parsed = JSON.parse(saved);
    return normalizeAppData(parsed).bodyProgress;
  } catch (error) {
    console.warn("Failed to read body progress:", error);
    return createEmptyBodyData();
  }
}

function loadSkinLibraryData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return createEmptySkinLibraryData();
    }

    const parsed = JSON.parse(saved);
    return normalizeAppData(parsed).skinLibrary;
  } catch (error) {
    console.warn("Failed to read skin library:", error);
    return createEmptySkinLibraryData();
  }
}

function loadStyleData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return createEmptyStyleData();
    }

    const parsed = JSON.parse(saved);
    return normalizeAppData(parsed).styleBoard;
  } catch (error) {
    console.warn("Failed to read style board:", error);
    return createEmptyStyleData();
  }
}

function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }
  return "dark";
}

function loadActiveView() {
  const saved = localStorage.getItem(ACTIVE_VIEW_KEY);
  if (saved === "body" || saved === "style") {
    return saved;
  }
  return "skin";
}

function loadActiveSkinSection() {
  const saved = localStorage.getItem(ACTIVE_SKIN_SECTION_KEY);
  return saved === "products" ? "products" : "routine";
}

function loadActiveBodySection() {
  const saved = localStorage.getItem(ACTIVE_BODY_SECTION_KEY);
  return saved === "workouts" ? "workouts" : "progress";
}

function loadSessionToken() {
  return localStorage.getItem(SESSION_STORAGE_KEY) || "";
}

function hasSupabaseConfig() {
  return (
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    SUPABASE_URL !== "YOUR_SUPABASE_URL" &&
    SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY"
  );
}

function initSupabase() {
  if (!hasSupabaseConfig() || !window.supabase?.createClient) {
    return null;
  }

  return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

function normalizeUsername(username) {
  return username.trim().toLowerCase();
}

function applyTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  themeToggle.innerHTML =
    theme === "dark"
      ? '<ion-icon name="sunny-outline" aria-hidden="true"></ion-icon><span>Light mode</span>'
      : '<ion-icon name="moon-outline" aria-hidden="true"></ion-icon><span>Dark mode</span>';
  themeToggle.setAttribute("aria-pressed", String(theme === "light"));
}

function toggleTheme() {
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  applyTheme(nextTheme);
}

function buildAppPayload() {
  return {
    version: 6,
    skinTimeline: routineData,
    bodyProgress: bodyData,
    skinLibrary: skinLibraryData,
    styleBoard: styleData,
  };
}

function setSettingsOpen(nextState) {
  isSettingsOpen = nextState;
  settingsPanel.hidden = !nextState;
  settingsButton.setAttribute("aria-expanded", String(nextState));
}

function toggleSettingsMenu() {
  setSettingsOpen(!isSettingsOpen);
}

function cloneForUndo(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

function hideUndoToast() {
  window.clearTimeout(undoToastTimer);
  pendingUndoAction = null;
  undoToast.hidden = true;
  undoToast.classList.remove("is-visible");
}

function showUndoToast(message, onUndo) {
  window.clearTimeout(undoToastTimer);
  pendingUndoAction = typeof onUndo === "function" ? onUndo : null;
  undoToastMessage.textContent = message;
  undoToast.hidden = false;
  requestAnimationFrame(() => {
    if (!undoToast.hidden) {
      undoToast.classList.add("is-visible");
    }
  });
  undoToastTimer = window.setTimeout(hideUndoToast, 6500);
}

function runPendingUndo() {
  if (!pendingUndoAction) {
    hideUndoToast();
    return;
  }

  const action = pendingUndoAction;
  hideUndoToast();
  action();
}

function setBodyCalendarDate(dateKey) {
  const resolvedDate = dateKey || getTodayDateKey();
  bodyDateInput.dataset.value = resolvedDate;
  bodyDateInput.value = formatCalendarDateLabel(resolvedDate);
  bodyCalendarMonth = resolvedDate.slice(0, 7);
}

function setBodyCalendarOpen(nextState) {
  isBodyCalendarOpen = nextState;
  bodyCalendarPanel.hidden = !nextState;
  bodyDateToggle.setAttribute("aria-expanded", String(nextState));
  if (nextState) {
    renderBodyCalendar();
  }
}

function handleBodyCalendarClick(event) {
  const navButton = event.target.closest("[data-calendar-nav]");
  if (navButton) {
    event.preventDefault();
    event.stopPropagation();
    bodyCalendarMonth = shiftMonth(bodyCalendarMonth, Number(navButton.dataset.calendarNav));
    renderBodyCalendar();
    return;
  }

  const dateButton = event.target.closest("[data-date-key]");
  if (dateButton) {
    event.preventDefault();
    event.stopPropagation();
    setBodyCalendarDate(dateButton.dataset.dateKey);
    setBodyCalendarOpen(false);
  }
}

function renderBodyCalendar() {
  const selectedDate = bodyDateInput.dataset.value || getTodayDateKey();
  const [year, month] = bodyCalendarMonth.split("-").map(Number);
  const firstOfMonth = new Date(year, month - 1, 1);
  const startDay = firstOfMonth.getDay();
  const mondayOffset = startDay === 0 ? 6 : startDay - 1;
  const gridStart = new Date(year, month - 1, 1 - mondayOffset);
  const todayKey = getTodayDateKey();

  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const dateKey = formatDateKey(date);
    const isCurrentMonth = date.getMonth() === month - 1;
    return { dateKey, day: date.getDate(), isCurrentMonth };
  });

  bodyCalendarPanel.innerHTML = `
    <div class="body-calendar-head">
      <button class="body-calendar-nav" type="button" data-calendar-nav="-1" aria-label="Previous month">
        <ion-icon name="chevron-back-outline" aria-hidden="true"></ion-icon>
      </button>
      <strong>${formatCalendarMonthLabel(bodyCalendarMonth)}</strong>
      <button class="body-calendar-nav" type="button" data-calendar-nav="1" aria-label="Next month">
        <ion-icon name="chevron-forward-outline" aria-hidden="true"></ion-icon>
      </button>
    </div>
    <div class="body-calendar-weekdays">
      <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
    </div>
    <div class="body-calendar-grid">
      ${days
        .map(
          ({ dateKey, day, isCurrentMonth }) => `
            <button
              class="body-calendar-day${isCurrentMonth ? "" : " is-outside"}${
                dateKey === selectedDate ? " is-selected" : ""
              }${dateKey === todayKey ? " is-today" : ""}"
              type="button"
              data-date-key="${dateKey}"
            >
              ${day}
            </button>
          `
        )
        .join("")}
    </div>
  `;

  bodyCalendarPanel.onclick = handleBodyCalendarClick;
  bodyCalendarPanel.onpointerdown = (event) => {
    event.stopPropagation();
  };
}

function createCellContextMenu() {
  const menu = document.createElement("div");
  menu.className = "cell-context-menu";
  menu.hidden = true;
  menu.innerHTML = `
    <button class="context-menu-item" type="button" data-action="copy">
      <ion-icon name="copy-outline" aria-hidden="true"></ion-icon>
      <span>Copy</span>
    </button>
    <button class="context-menu-item" type="button" data-action="paste">
      <ion-icon name="clipboard-outline" aria-hidden="true"></ion-icon>
      <span>Paste</span>
    </button>
    <button class="context-menu-item" type="button" data-action="clear">
      <ion-icon name="close-outline" aria-hidden="true"></ion-icon>
      <span>Clear</span>
    </button>
  `;

  menu.addEventListener("click", async (event) => {
    const button = event.target.closest(".context-menu-item");
    if (!button || !contextMenuState) {
      return;
    }

    const action = button.dataset.action;
    if (action === "copy") {
      await copyFieldValue(contextMenuState);
    } else if (action === "paste") {
      await pasteFieldValue(contextMenuState);
    } else if (action === "clear") {
      clearFieldValue(contextMenuState);
    }
    closeCellContextMenu();
  });

  document.body.appendChild(menu);
  return menu;
}

function getFieldTargetMeta(target) {
  const editableTarget = target.closest("[data-index][data-field]");
  if (!editableTarget) {
    return null;
  }

  return {
    element: editableTarget,
    index: Number(editableTarget.dataset.index),
    field: editableTarget.dataset.field,
    isTextarea: editableTarget.matches("textarea"),
  };
}

function openCellContextMenu(event, meta) {
  event.preventDefault();
  contextMenuState = meta;
  cellContextMenu.hidden = false;
  cellContextMenu.style.left = `${Math.min(event.clientX, window.innerWidth - 188)}px`;
  cellContextMenu.style.top = `${Math.min(event.clientY, window.innerHeight - 148)}px`;
}

function closeCellContextMenu() {
  contextMenuState = null;
  cellContextMenu.hidden = true;
}

async function writeClipboardText(text) {
  fallbackClipboard = text;
  if (!navigator.clipboard?.writeText) {
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.warn("Clipboard write failed, using fallback clipboard.", error);
  }
}

async function readClipboardText() {
  if (navigator.clipboard?.readText) {
    try {
      const text = await navigator.clipboard.readText();
      if (typeof text === "string") {
        fallbackClipboard = text;
        return text;
      }
    } catch (error) {
      console.warn("Clipboard read failed, using fallback clipboard.", error);
    }
  }

  return fallbackClipboard;
}

async function copyFieldValue(meta) {
  const text = meta.isTextarea
    ? meta.element.value
    : routineData[meta.index]?.[meta.field] || "";
  await writeClipboardText(text);
}

async function pasteFieldValue(meta) {
  const text = await readClipboardText();
  if (typeof text !== "string") {
    return;
  }

  if (meta.isTextarea) {
    meta.element.value = text;
    routineData[meta.index][meta.field] = text.trim();
    saveRoutine("붙여넣기 완료");
    meta.element.focus();
    return;
  }

  routineData[meta.index][meta.field] = text.trim();
  saveRoutine("붙여넣기 완료");
  render();
}

function clearFieldValue(meta) {
  if (meta.isTextarea) {
    meta.element.value = "";
    routineData[meta.index][meta.field] = "";
    saveRoutine("칸 내용을 비웠어요.");
    meta.element.focus();
    return;
  }

  routineData[meta.index][meta.field] = "";
  saveRoutine("칸 내용을 비웠어요.");
  render();
}

function attachContextMenu(element) {
  element.addEventListener("contextmenu", (event) => {
    const meta = getFieldTargetMeta(event.target);
    if (!meta) {
      return;
    }
    openCellContextMenu(event, meta);
  });

  element.addEventListener("touchstart", (event) => {
    const touch = event.touches[0];
    if (!touch) {
      return;
    }

    longPressTimer = window.setTimeout(() => {
      const meta = getFieldTargetMeta(event.target);
      if (!meta) {
        return;
      }
      openCellContextMenu(
        {
          preventDefault() {},
          clientX: touch.clientX,
          clientY: touch.clientY,
        },
        meta
      );
    }, 420);
  });

  const cancelLongPress = () => {
    window.clearTimeout(longPressTimer);
  };

  element.addEventListener("touchend", cancelLongPress);
  element.addEventListener("touchmove", cancelLongPress);
  element.addEventListener("touchcancel", cancelLongPress);
}

function flashStatus(message, stateClass = "") {
  if (saveStatus.hidden) {
    return;
  }

  saveStatus.textContent = message;
  saveStatus.classList.remove("saved", "reset");
  if (stateClass) {
    saveStatus.classList.add(stateClass);
  }

  window.clearTimeout(flashStatus.timer);
  flashStatus.timer = window.setTimeout(() => {
    saveStatus.textContent = "로컬에 자동 저장됨";
    saveStatus.classList.remove("saved", "reset");
  }, 1800);
}

function saveRoutine(message = "로컬에 자동 저장됨", stateClass = "saved") {
  routineData = ensureTimelineWindow(routineData);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(buildAppPayload()));
  queueRemoteSave();
  flashStatus(message, stateClass);
}

function saveBodyProgress(message = "바디 기록 저장됨", stateClass = "saved") {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(buildAppPayload()));
  queueRemoteSave();
  flashStatus(message, stateClass);
}

function setAuthMessage(message, tone = "") {
  authMessage.textContent = message;
  authMessage.classList.remove("error", "success");
  if (tone) {
    authMessage.classList.add(tone);
  }
}

function setAuthMode(mode) {
  authMode = mode;
  const isSignIn = mode === "sign-in";
  const isReset = mode === "reset-password";
  signInTab.classList.toggle("is-active", isSignIn);
  signUpTab.classList.toggle("is-active", mode === "sign-up");
  signInTab.setAttribute("aria-selected", String(isSignIn));
  signUpTab.setAttribute("aria-selected", String(mode === "sign-up"));
  resetPasswordButton.classList.toggle("is-active", isReset);

  if (isSignIn) {
    authSubmit.innerHTML =
      '<ion-icon name="log-in-outline" aria-hidden="true"></ion-icon><span>로그인</span>';
    authPassword.autocomplete = "current-password";
    authPassword.placeholder = "비밀번호 입력";
    setAuthMessage("같은 이름과 비밀번호로 언제든 다시 로그인할 수 있어요.");
    return;
  }

  authPassword.autocomplete = "new-password";
  authPassword.placeholder = isReset ? "새 비밀번호 입력" : "비밀번호 입력";
  authSubmit.innerHTML = isReset
    ? '<ion-icon name="key-outline" aria-hidden="true"></ion-icon><span>비밀번호 재설정</span>'
    : '<ion-icon name="person-add-outline" aria-hidden="true"></ion-icon><span>회원가입</span>';
  setAuthMessage(
    isReset
      ? "이름과 새 비밀번호를 입력하면 기존 비밀번호를 확인하거나 보여주지 않고 재설정합니다."
      : "새 계정에 사용할 이름과 비밀번호를 입력해 주세요."
  );
}

function updateAuthUI() {
  const isLoggedIn = Boolean(currentUser);
  authCard.hidden = isLoggedIn;
  appContent.hidden = !isLoggedIn;
  authStatus.hidden = !isLoggedIn;

  if (isLoggedIn) {
    authUserEmail.textContent = currentUser.username || "";
  } else {
    authUserEmail.textContent = "";
  }
}

async function loadRemoteRoutine() {
  if (!supabaseClient || !currentSessionToken) {
    return;
  }

  const { data, error } = await supabaseClient.rpc("skin_journal_get_routine", {
    p_token: currentSessionToken,
  });

  if (error) {
    setAuthMessage(`루틴 불러오기 실패: ${error.message}`, "error");
    return;
  }

  const remoteAppData = normalizeAppData(data);

  if (
    !hasMeaningfulRoutine(remoteAppData.skinTimeline) &&
    !remoteAppData.bodyProgress.entries.length &&
    !hasMeaningfulSkinLibrary(remoteAppData.skinLibrary) &&
    !hasMeaningfulStyleData(remoteAppData.styleBoard) &&
    (hasMeaningfulRoutine(routineData) ||
      bodyData.entries.length > 0 ||
      hasMeaningfulSkinLibrary(skinLibraryData) ||
      hasMeaningfulStyleData(styleData))
  ) {
    saveRoutine("현재 기기 루틴을 계정에 저장했어요.");
    return;
  }

  routineData = remoteAppData.skinTimeline;
  bodyData = remoteAppData.bodyProgress;
  skinLibraryData = remoteAppData.skinLibrary;
  styleData = remoteAppData.styleBoard;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(buildAppPayload()));
}

async function saveRoutineRemote() {
  if (!supabaseClient || !currentSessionToken) {
    return;
  }

  const { error } = await supabaseClient.rpc("skin_journal_save_routine", {
    p_token: currentSessionToken,
    p_routine: buildAppPayload(),
  });

  if (error) {
    setAuthMessage(`루틴 저장 실패: ${error.message}`, "error");
  }
}

function queueRemoteSave() {
  if (!supabaseClient || !currentSessionToken) {
    return;
  }

  window.clearTimeout(remoteSaveTimer);
  remoteSaveTimer = window.setTimeout(() => {
    saveRoutineRemote();
  }, 500);
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  hideUndoToast();

  if (!supabaseClient) {
    setAuthMessage("먼저 script.js에 Supabase URL과 anon key를 넣어야 합니다.", "error");
    return;
  }

  const username = authUsername.value.trim();
  const password = authPassword.value;

  if (!username || !password) {
    setAuthMessage("이름과 비밀번호를 입력해 주세요.", "error");
    return;
  }

  if (normalizeUsername(username).length < 3) {
    setAuthMessage("이름은 3자 이상으로 입력해 주세요.", "error");
    return;
  }

  if (password.length < 6) {
    setAuthMessage("비밀번호는 6자 이상이어야 합니다.", "error");
    return;
  }

  authSubmit.disabled = true;

  const rpcByMode = {
    "sign-in": "skin_journal_sign_in",
    "sign-up": "skin_journal_sign_up",
    "reset-password": "skin_journal_reset_password",
  };
  const rpcName = rpcByMode[authMode] || rpcByMode["sign-in"];

  const { data, error } = await supabaseClient.rpc(rpcName, {
    p_username: normalizeUsername(username),
    p_password: password,
  });

  authSubmit.disabled = false;

  if (error) {
    const messageMap = {
      INVALID_CREDENTIALS: "이름 또는 비밀번호가 맞지 않습니다.",
      USERNAME_TAKEN: "이미 사용 중인 이름입니다.",
      USERNAME_TOO_SHORT: "이름은 3자 이상으로 입력해 주세요.",
      PASSWORD_TOO_SHORT: "비밀번호는 6자 이상이어야 합니다.",
      USER_NOT_FOUND: "해당 이름의 계정을 찾을 수 없습니다.",
    };
    setAuthMessage(messageMap[error.message] || error.message, "error");
    return;
  }

  if (authMode === "reset-password") {
    authForm.reset();
    setAuthMode("sign-in");
    setAuthMessage("비밀번호가 재설정되었습니다. 새 비밀번호로 로그인해 주세요.", "success");
    return;
  }

  currentSessionToken = data.token;
  localStorage.setItem(SESSION_STORAGE_KEY, currentSessionToken);
  currentUser = {
    username: data.username,
  };

  if (authMode === "sign-up") {
    routineData = createEmptyTimeline();
    bodyData = createEmptyBodyData();
    skinLibraryData = createEmptySkinLibraryData();
    styleData = createEmptyStyleData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buildAppPayload()));
    await saveRoutineRemote();
  } else {
    await loadRemoteRoutine();
  }

  updateAuthUI();
  visibleWeekStart = getWeekStartIndex();
  mobileOpenDay = getTodayIndex();
  render();
  authForm.reset();

  setAuthMessage(
    authMode === "sign-in" ? "로그인되었습니다." : "회원가입이 완료되었습니다.",
    "success"
  );
}

async function handleLogout() {
  hideUndoToast();

  if (supabaseClient && currentSessionToken) {
    const { error } = await supabaseClient.rpc("skin_journal_sign_out", {
      p_token: currentSessionToken,
    });
    if (error) {
      setAuthMessage(error.message, "error");
      return;
    }
  }

  currentSessionToken = "";
  currentUser = null;
  localStorage.removeItem(SESSION_STORAGE_KEY);
  routineData = loadRoutine();
  bodyData = loadBodyData();
  visibleWeekStart = getWeekStartIndex();
  mobileOpenDay = getTodayIndex();
  mobileEditDay = null;
  updateAuthUI();
  render();
  setAuthMessage("로그아웃되었습니다.", "success");
}

async function syncSession() {
  if (!supabaseClient || !currentSessionToken) {
    currentUser = null;
    updateAuthUI();
    setAuthMessage(
      hasSupabaseConfig()
        ? "이름과 비밀번호로 로그인하거나 회원가입하세요."
        : "script.js에 Supabase URL과 anon key를 넣으면 로그인 기능이 활성화됩니다."
    );
    return;
  }

  const { data, error } = await supabaseClient.rpc("skin_journal_get_session", {
    p_token: currentSessionToken,
  });

  if (error || !data) {
    currentSessionToken = "";
    currentUser = null;
    localStorage.removeItem(SESSION_STORAGE_KEY);
    updateAuthUI();
    setAuthMessage("세션이 만료되었습니다. 다시 로그인해 주세요.");
    return;
  }

  currentUser = data;
  updateAuthUI();
  await loadRemoteRoutine();
  visibleWeekStart = getWeekStartIndex();
  mobileOpenDay = getTodayIndex();
  render();
  setAuthMessage("계정 루틴을 불러왔습니다.", "success");
}

function getTodayIndex() {
  const todayKey = getTodayDateKey();
  const foundIndex = routineData.findIndex((entry) => entry.date === todayKey);
  return foundIndex >= 0 ? foundIndex : 0;
}

function getWeekStartIndex(index = getTodayIndex()) {
  const targetDate = routineData[index]?.date || getTodayDateKey();
  const mondayKey = getWeekStartDateKey(targetDate);
  const foundIndex = routineData.findIndex((entry) => entry.date === mondayKey);
  return foundIndex >= 0 ? foundIndex : Math.max(0, index);
}

function getMoodMeta(value) {
  return moodOptions.find((option) => option.value === value) || null;
}
