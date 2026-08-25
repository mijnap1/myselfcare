let routineRepeatMenu = null;
let routineRepeatState = null;

function ensureVisibleWeekRange() {
  if (visibleWeekStart < 0) {
    visibleWeekStart = 0;
  }

  while (visibleWeekStart + 7 > routineData.length) {
    appendMoreDays(TIMELINE_APPEND_DAYS, false);
  }
}

function getVisibleEntries() {
  ensureVisibleWeekRange();
  return routineData
    .slice(visibleWeekStart, visibleWeekStart + 7)
    .map((entry, offset) => ({
      entry,
      actualIndex: visibleWeekStart + offset,
    }));
}

function updateWeekRangeLabel() {
  const visibleEntries = getVisibleEntries();
  if (!visibleEntries.length) {
    weekRangeLabel.textContent = "";
    return;
  }

  const firstDate = visibleEntries[0].entry.date;
  const lastDate = visibleEntries[visibleEntries.length - 1].entry.date;
  weekRangeLabel.textContent = `${formatDateLabel(firstDate)} - ${formatDateLabel(lastDate)}`;
  prevWeekButton.disabled = visibleWeekStart === 0;
}

function getWeekProgress() {
  const entries = getVisibleEntries().map((item) => item.entry);
  const doneCount = entries.filter((entry) => entry.done).length;
  return {
    doneCount,
    total: entries.length,
    percentage: entries.length ? Math.round((doneCount / entries.length) * 100) : 0,
  };
}

function getCurrentStreak() {
  let streak = 0;
  const todayIndex = getTodayIndex();
  for (let index = todayIndex; index >= 0; index -= 1) {
    if (!routineData[index]?.done) {
      break;
    }
    streak += 1;
  }
  return streak;
}

function getEntryFilledCount(entry) {
  return [entry.morning, entry.eveningCleanse, entry.skincare, entry.extraCare, entry.notes]
    .filter((value) => typeof value === "string" && value.trim()).length;
}

function updateMood(index, mood) {
  routineData[index].mood = routineData[index].mood === mood ? "" : mood;
  saveRoutine("오늘 피부 무드를 저장했어요.");
  render();
}

function renderJournalSummary() {
  const todayIndex = getTodayIndex();
  const todayEntry = routineData[todayIndex] || createEmptyEntry(getTodayDateKey());
  const weekProgress = getWeekProgress();
  const streak = getCurrentStreak();
  const moodMeta = getMoodMeta(todayEntry.mood);
  const todayFilledCount = getEntryFilledCount(todayEntry);

  journalSummary.innerHTML = `
    <div class="summary-overview">
      <div class="summary-copy">
        <p class="summary-kicker">Today Journal</p>
        <h3>${formatDateLabel(todayEntry.date)} · ${getWeekdayLabel(todayEntry.date)}요일</h3>
        <p class="summary-text">
          ${moodMeta ? `${moodMeta.label} mood selected.` : "오늘 피부 컨디션을 골라두면 기록이 더 쉬워져요."}
        </p>
      </div>
      <div class="summary-progress-card">
        <strong>${weekProgress.percentage}%</strong>
        <span>this week</span>
      </div>
    </div>
    <div class="summary-meta">
      <span><strong>${weekProgress.doneCount}/${weekProgress.total}</strong> done</span>
      <span><strong>${streak}</strong> day streak</span>
      <span><strong>${todayFilledCount}/5</strong> filled today</span>
    </div>
    <div class="summary-bar">
      <span class="summary-bar-fill" style="width: ${weekProgress.percentage}%"></span>
    </div>
    <div class="mood-picker">
      ${moodOptions
        .map(
          (option) => `
            <button
              class="mood-chip${todayEntry.mood === option.value ? " is-active" : ""}"
              type="button"
              data-mood="${option.value}"
              aria-pressed="${String(todayEntry.mood === option.value)}"
            >
              <ion-icon name="${option.icon}" aria-hidden="true"></ion-icon>
              <span>${option.label}</span>
            </button>
          `
        )
        .join("")}
    </div>
  `;

  journalSummary.querySelectorAll(".mood-chip").forEach((button) => {
    button.addEventListener("click", () => updateMood(todayIndex, button.dataset.mood));
  });
}

function renderSkinVideoList() {
  if (!skinLibraryData.videos.length) {
    skinVideoList.innerHTML = `
      <article class="skin-video-empty">
        <ion-icon name="logo-youtube" aria-hidden="true"></ion-icon>
        <div>
          <strong>아직 저장한 스킨케어 영상이 없어요.</strong>
          <p>링크를 넣고 개인 제목이나 메모를 붙여두면, 나중에 루틴 참고용으로 다시 보기 쉬워집니다.</p>
        </div>
      </article>
    `;
    return;
  }

  skinVideoList.innerHTML = skinLibraryData.videos
    .map(
      (video) => `
        <article class="skin-video-card card">
          <div class="skin-video-card-frame">
            <iframe
              src="${buildYouTubeEmbedUrl(video.videoId)}"
              title="${escapeHtml(
                video.customTitle || video.youtubeTitle || "Saved skincare video"
              )}"
              loading="lazy"
              referrerpolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
            ></iframe>
          </div>
          <div class="skin-video-card-copy">
            <div class="skin-video-card-head">
              <div>
                <p class="summary-kicker">Saved video</p>
                <h3>${escapeHtml(
                  video.customTitle || video.youtubeTitle || "Untitled reference"
                )}</h3>
                ${
                  video.youtubeTitle && video.customTitle
                    ? `<p class="skin-video-source-title">${escapeHtml(
                        video.youtubeTitle
                      )}</p>`
                    : ""
                }
              </div>
              <div class="skin-video-card-actions">
                <a
                  class="button button-secondary skin-video-link-button"
                  href="${video.url || buildYouTubeWatchUrl(video.videoId)}"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <ion-icon name="open-outline" aria-hidden="true"></ion-icon>
                  <span>Open</span>
                </a>
                <button
                  class="button button-secondary skin-video-edit-button"
                  type="button"
                  data-video-edit-id="${video.id}"
                >
                  <ion-icon name="create-outline" aria-hidden="true"></ion-icon>
                  <span>Edit</span>
                </button>
                <button
                  class="button button-secondary skin-video-delete-button"
                  type="button"
                  data-video-delete-id="${video.id}"
                >
                  <ion-icon name="trash-outline" aria-hidden="true"></ion-icon>
                  <span>Delete</span>
                </button>
              </div>
            </div>
            ${
              video.note
                ? `<p class="skin-video-note">${escapeHtml(video.note)}</p>`
                : '<p class="skin-video-note is-muted">메모 없음</p>'
            }
          </div>
        </article>
      `
    )
    .join("");

  skinVideoList.querySelectorAll("[data-video-edit-id]").forEach((button) => {
    button.addEventListener("click", () => {
      startEditingSkinVideo(button.dataset.videoEditId);
    });
  });

  skinVideoList.querySelectorAll("[data-video-delete-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const videoIndex = skinLibraryData.videos.findIndex(
        (video) => video.id === button.dataset.videoDeleteId
      );
      if (videoIndex < 0) {
        return;
      }
      const removedVideo = cloneForUndo(skinLibraryData.videos[videoIndex]);
      skinLibraryData.videos = skinLibraryData.videos.filter(
        (video) => video.id !== button.dataset.videoDeleteId
      );
      saveRoutine("저장한 영상을 삭제했어요.");
      renderSkinVideoList();
      showUndoToast("영상이 삭제됐어요.", () => {
        if (skinLibraryData.videos.some((video) => video.id === removedVideo.id)) {
          return;
        }
        skinLibraryData.videos.splice(videoIndex, 0, removedVideo);
        saveRoutine("삭제를 되돌렸어요.");
        renderSkinVideoList();
      });
    });
  });
}

function getProductStatusLabel(status) {
  const labels = {
    interested: "Interested",
    "buy-next": "Buy next",
    bought: "Bought",
    testing: "Testing",
  };
  return labels[status] || "Interested";
}

function getSeasonLabel(season) {
  return SKIN_SEASONS.find((item) => item.value === season)?.label || "봄";
}

function getSkinTypeLabel(skinType) {
  return SKIN_TYPES.find((item) => item.value === skinType)?.label || "수부지 / 복합성";
}

function setSkinProductStatus(status) {
  skinProductStatus =
    status === "buy-next" || status === "bought" || status === "testing" ? status : "interested";

  if (!skinProductStatusInput) {
    return;
  }

  skinProductStatusInput.querySelectorAll("[data-product-status]").forEach((button) => {
    const isActive = button.dataset.productStatus === skinProductStatus;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function renderSkinProductImagePreview() {
  if (!skinProductImageData) {
    skinProductImagePreview.hidden = true;
    skinProductImagePreview.innerHTML = "";
    return;
  }

  skinProductImagePreview.hidden = false;
  skinProductImagePreview.innerHTML = `
    <img src="${skinProductImageData}" alt="Selected product preview" />
    <button id="skinProductImageClearButton" class="skin-product-image-clear" type="button">
      <ion-icon name="close-outline" aria-hidden="true"></ion-icon>
      <span>Remove</span>
    </button>
  `;

  document.getElementById("skinProductImageClearButton").addEventListener("click", () => {
    skinProductImageData = "";
    renderSkinProductImagePreview();
  });
}

function setSkinProductTargetCell(season, skinType) {
  skinProductTargetCell = {
    season: SKIN_SEASONS.some((item) => item.value === season) ? season : "spring",
    skinType: SKIN_TYPES.some((item) => item.value === skinType) ? skinType : "combo",
  };

  skinProductTarget.textContent = `${getSkinTypeLabel(skinProductTargetCell.skinType)} · ${getSeasonLabel(
    skinProductTargetCell.season
  )}`;
}

function renderSkinProductCard(product) {
  return `
    <article class="skin-season-product-card">
      ${
        product.imageDataUrl
          ? `<img class="skin-season-product-image" src="${product.imageDataUrl}" alt="${escapeHtml(
              product.name
            )}" />`
          : ""
      }
      <div class="skin-season-product-copy">
        <p class="summary-kicker">${escapeHtml(getProductStatusLabel(product.status))}</p>
        <h3>${escapeHtml(product.name || "Untitled product")}</h3>
        <p class="skin-product-meta">
          ${[product.brand, product.category, product.price ? `${product.price}` : ""]
            .filter(Boolean)
            .map((value) => escapeHtml(value))
            .join(" · ") || "No extra details"}
        </p>
        ${product.note ? `<p class="skin-product-note">${escapeHtml(product.note)}</p>` : ""}
      </div>
      <div class="skin-product-card-actions">
        ${
          product.link
            ? `
              <a
                class="button button-secondary skin-product-link-button"
                href="${escapeHtml(product.link)}"
                target="_blank"
                rel="noreferrer noopener"
              >
                <ion-icon name="open-outline" aria-hidden="true"></ion-icon>
                <span>Open</span>
              </a>
            `
            : ""
        }
        <button
          class="button button-secondary skin-product-edit-button"
          type="button"
          data-product-edit-id="${product.id}"
        >
          <ion-icon name="create-outline" aria-hidden="true"></ion-icon>
          <span>Edit</span>
        </button>
        <button
          class="button button-secondary skin-product-delete-button"
          type="button"
          data-product-delete-id="${product.id}"
        >
          <ion-icon name="trash-outline" aria-hidden="true"></ion-icon>
          <span>Delete</span>
        </button>
      </div>
    </article>
  `;
}

function renderSkinProductList() {
  const selectedSkinType = SKIN_TYPES.find(
    (skinType) => skinType.value === skinProductTargetCell.skinType
  ) || SKIN_TYPES[2];

  skinTypeSelector.querySelectorAll("[data-skin-type-option]").forEach((button) => {
    const isActive = button.dataset.skinTypeOption === selectedSkinType.value;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  const seasonHeaders = SKIN_SEASONS.map(
    (season) => `
      <div class="skin-season-header">
        <span>${season.label}</span>
        <ion-icon name="${season.icon}" aria-hidden="true"></ion-icon>
      </div>
    `
  ).join("");

  const rows = [selectedSkinType].map((skinType) => {
    const cells = SKIN_SEASONS.map((season) => {
      const products = skinLibraryData.products.filter(
        (product) => product.season === season.value && product.skinType === skinType.value
      );

      return `
        <div class="skin-season-cell${
          skinProductTargetCell.season === season.value &&
          skinProductTargetCell.skinType === skinType.value
            ? " is-active"
            : ""
        }" data-season="${season.value}" data-skin-type="${skinType.value}">
          <button class="skin-season-cell-add" type="button" data-season="${season.value}" data-skin-type="${skinType.value}">
            <ion-icon name="add-outline" aria-hidden="true"></ion-icon>
            <span>Add</span>
          </button>
          <div class="skin-season-cell-list">
            ${
              products.length
                ? products.map((product) => renderSkinProductCard(product)).join("")
                : '<p class="skin-season-empty">No products yet</p>'
            }
          </div>
        </div>
      `;
    }).join("");

    return `
      <div class="skin-season-row-label">${skinType.label}</div>
      ${cells}
    `;
  }).join("");

  skinProductMatrix.innerHTML = `
    <div class="skin-season-corner">선택한 피부타입</div>
    ${seasonHeaders}
    ${rows}
  `;

  skinProductMobileList.innerHTML = SKIN_SEASONS.map((season) => {
    const products = skinLibraryData.products.filter(
      (product) =>
        product.season === season.value && product.skinType === skinProductTargetCell.skinType
    );

    return `
      <section class="skin-season-mobile-card">
        <div class="skin-season-mobile-head">
          <div class="skin-season-mobile-title">
            <span>${season.label}</span>
            <ion-icon name="${season.icon}" aria-hidden="true"></ion-icon>
          </div>
          <button
            class="skin-season-mobile-add"
            type="button"
            data-season="${season.value}"
            data-skin-type="${skinProductTargetCell.skinType}"
          >
            <ion-icon name="add-outline" aria-hidden="true"></ion-icon>
            <span>Add</span>
          </button>
        </div>
        <div class="skin-season-mobile-body">
          ${
            products.length
              ? products.map((product) => renderSkinProductCard(product)).join("")
              : '<p class="skin-season-empty">No products yet</p>'
          }
        </div>
      </section>
    `;
  }).join("");

  skinProductMatrix.querySelectorAll(".skin-season-cell").forEach((element) => {
    element.addEventListener("click", (event) => {
      const season = event.currentTarget.dataset.season;
      const skinType = event.currentTarget.dataset.skinType;
      setSkinProductTargetCell(season, skinType);
      renderSkinProductList();
    });
  });

  skinProductMatrix.querySelectorAll(".skin-season-cell-add").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      setSkinProductTargetCell(button.dataset.season, button.dataset.skinType);
      renderSkinProductList();
    });
  });

  skinProductMobileList.querySelectorAll(".skin-season-mobile-add").forEach((button) => {
    button.addEventListener("click", () => {
      setSkinProductTargetCell(button.dataset.season, button.dataset.skinType);
      renderSkinProductList();
    });
  });

  document.querySelectorAll("[data-product-edit-id]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      startEditingSkinProduct(button.dataset.productEditId);
    });
  });

  document.querySelectorAll("[data-product-delete-id]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const productIndex = skinLibraryData.products.findIndex(
        (product) => product.id === button.dataset.productDeleteId
      );
      if (productIndex < 0) {
        return;
      }
      const removedProduct = cloneForUndo(skinLibraryData.products[productIndex]);
      skinLibraryData.products = skinLibraryData.products.filter(
        (product) => product.id !== button.dataset.productDeleteId
      );
      saveRoutine("저장한 제품을 삭제했어요.");
      renderSkinProductList();
      showUndoToast("제품이 삭제됐어요.", () => {
        if (skinLibraryData.products.some((product) => product.id === removedProduct.id)) {
          return;
        }
        skinLibraryData.products.splice(productIndex, 0, removedProduct);
        saveRoutine("삭제를 되돌렸어요.");
        renderSkinProductList();
      });
    });
  });

  renderSkinProductImagePreview();
}

function startEditingSkinProduct(productId) {
  const product = skinLibraryData.products.find((item) => item.id === productId);
  if (!product) {
    return;
  }

  editingSkinProductId = product.id;
  setSkinProductTargetCell(product.season, product.skinType);
  setSkinProductStatus(product.status);
  skinProductNameInput.value = product.name || "";
  skinProductBrandInput.value = product.brand || "";
  skinProductCategoryInput.value = product.category || "";
  skinProductPriceInput.value = product.price || "";
  skinProductLinkInput.value = product.link || "";
  skinProductNoteInput.value = product.note || "";
  skinProductImageData = product.imageDataUrl || "";
  renderSkinProductImagePreview();
  skinProductForm.scrollIntoView({ behavior: "smooth", block: "center" });
  skinProductNameInput.focus();
}

function handleSkinProductSubmit(event) {
  event.preventDefault();

  const name = skinProductNameInput.value.trim();
  if (!name) {
    skinProductNameInput.reportValidity();
    return;
  }

  const existingProduct = skinLibraryData.products.find(
    (product) => product.id === editingSkinProductId
  );
  const nextProduct = {
    id: existingProduct?.id || createSkinVideoId(),
    name,
    brand: skinProductBrandInput.value.trim(),
    category: skinProductCategoryInput.value.trim(),
    price: normalizeDecimalInput(skinProductPriceInput.value),
    link: skinProductLinkInput.value.trim(),
    season: skinProductTargetCell.season,
    skinType: skinProductTargetCell.skinType,
    status: skinProductStatus,
    note: skinProductNoteInput.value.trim(),
    imageDataUrl: skinProductImageData,
    addedAt: existingProduct?.addedAt || new Date().toISOString(),
  };

  if (existingProduct) {
    skinLibraryData.products = skinLibraryData.products.map((product) =>
      product.id === existingProduct.id ? nextProduct : product
    );
  } else {
    skinLibraryData.products.unshift(nextProduct);
  }

  saveRoutine(existingProduct ? "스킨케어 제품을 수정했어요." : "스킨케어 제품을 저장했어요.");
  skinProductForm.reset();
  editingSkinProductId = "";
  setSkinProductStatus("interested");
  skinProductImageData = "";
  renderSkinProductList();
}

async function loadSkinProductImageFromFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    return;
  }

  try {
    skinProductImageData = await getOptimizedImageDataUrl(file);
    renderSkinProductImagePreview();
  } catch (error) {
    flashStatus("이미지를 읽지 못했어요.", "reset");
  }
}

function handleSkinProductImagePaste(event) {
  const items = Array.from(event.clipboardData?.items || []);
  const imageItem = items.find((item) => item.type.startsWith("image/"));
  if (!imageItem) {
    return;
  }

  event.preventDefault();
  loadSkinProductImageFromFile(imageItem.getAsFile());
}

function startEditingSkinVideo(videoId) {
  const video = skinLibraryData.videos.find((item) => item.id === videoId);
  if (!video) {
    return;
  }

  editingSkinVideoId = video.id;
  skinVideoUrlInput.value = video.url || buildYouTubeWatchUrl(video.videoId);
  skinVideoTitleInput.value = video.customTitle || "";
  skinVideoNoteInput.value = video.note || "";
  skinVideoPreviewState = {
    videoId: video.videoId,
    youtubeTitle: video.youtubeTitle || "",
    isLoading: false,
  };
  renderSkinVideoPreview();
  skinVideoForm.scrollIntoView({ behavior: "smooth", block: "center" });
  skinVideoTitleInput.focus();
}

async function handleSkinVideoSubmit(event) {
  event.preventDefault();

  const rawUrl = skinVideoUrlInput.value.trim();
  const videoId = extractYouTubeVideoId(rawUrl);
  const customTitle = skinVideoTitleInput.value.trim();
  const note = skinVideoNoteInput.value.trim();

  if (!videoId) {
    skinVideoUrlInput.setCustomValidity("유효한 YouTube 링크를 넣어주세요.");
    skinVideoUrlInput.reportValidity();
    skinVideoUrlInput.setCustomValidity("");
    return;
  }

  const youtubeTitle =
    skinVideoPreviewState?.videoId === videoId ? skinVideoPreviewState.youtubeTitle : "";

  const existingVideo = skinLibraryData.videos.find((video) => video.id === editingSkinVideoId);
  const nextVideo = {
    id: existingVideo?.id || createSkinVideoId(),
    url: buildYouTubeWatchUrl(videoId),
    videoId,
    customTitle,
    note,
    youtubeTitle: youtubeTitle || (await fetchYouTubeTitle(videoId)),
    thumbnailUrl: buildYouTubeThumbnailUrl(videoId),
    addedAt: existingVideo?.addedAt || new Date().toISOString(),
  };

  if (existingVideo) {
    skinLibraryData.videos = skinLibraryData.videos.map((video) =>
      video.id === existingVideo.id ? nextVideo : video
    );
  } else {
    skinLibraryData.videos.unshift(nextVideo);
  }

  saveRoutine(existingVideo ? "스킨케어 영상을 수정했어요." : "스킨케어 참고 영상을 저장했어요.");
  skinVideoForm.reset();
  editingSkinVideoId = "";
  skinVideoPreviewState = null;
  renderSkinVideoPreview();
  renderSkinVideoList();
}

function createTextarea(value, index, field, extraClass = "") {
  const textarea = document.createElement("textarea");
  textarea.className = extraClass;
  textarea.value = value;
  textarea.setAttribute("data-index", index);
  textarea.setAttribute("data-field", field);
  textarea.addEventListener("keydown", handleRoutineEditorShortcut);
  attachContextMenu(textarea);
  return textarea;
}

function stripRoutineAccentMarkers(value) {
  return String(value || "").replace(/==([^=]+)==/g, "$1");
}

function appendAccentedText(parent, text) {
  String(text || "")
    .split(/(==[^=]+==)/g)
    .filter(Boolean)
    .forEach((chunk) => {
      if (chunk.startsWith("==") && chunk.endsWith("==")) {
        const accent = document.createElement("span");
        accent.className = "routine-accent";
        accent.textContent = chunk.slice(2, -2);
        parent.appendChild(accent);
        return;
      }

      parent.appendChild(document.createTextNode(chunk));
    });
}

function handleRoutineEditorShortcut(event) {
  if (event.key.toLowerCase() !== "b" || (!event.metaKey && !event.ctrlKey)) {
    return;
  }

  event.preventDefault();
  const textarea = event.currentTarget;
  const { selectionStart, selectionEnd, value } = textarea;
  const selectedText = value.slice(selectionStart, selectionEnd);
  const before = value.slice(0, selectionStart);
  const after = value.slice(selectionEnd);

  if (before.endsWith("==") && after.startsWith("==")) {
    textarea.value = `${before.slice(0, -2)}${selectedText}${after.slice(2)}`;
    textarea.setSelectionRange(selectionStart - 2, selectionEnd - 2);
  } else if (selectedText) {
    textarea.value = `${before}==${selectedText}==${after}`;
    textarea.setSelectionRange(selectionStart + 2, selectionEnd + 2);
  } else {
    textarea.value = `${before}====${after}`;
    textarea.setSelectionRange(selectionStart + 2, selectionStart + 2);
  }

  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

function createCheckbox(checked, index) {
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "done-checkbox";
  checkbox.checked = checked;
  checkbox.setAttribute("data-index", index);
  checkbox.addEventListener("change", handleDoneToggle);
  checkbox.setAttribute("aria-label", `${routineData[index].date} 완료 체크`);
  return checkbox;
}

function closeRoutineRepeatMenu() {
  if (routineRepeatMenu) {
    routineRepeatMenu.hidden = true;
  }
  routineRepeatState = null;
}

function getRoutineRepeatMenu() {
  if (routineRepeatMenu) {
    return routineRepeatMenu;
  }

  routineRepeatMenu = document.createElement("div");
  routineRepeatMenu.className = "routine-repeat-menu";
  routineRepeatMenu.hidden = true;
  routineRepeatMenu.innerHTML = `
    <button type="button" data-repeat-days="3">Every 3 days</button>
    <button type="button" data-repeat-days="7">Weekly</button>
    <button type="button" data-repeat-days="14">Every 2 weeks</button>
    <div class="routine-repeat-custom">
      <span>Custom</span>
      <input
        type="number"
        min="1"
        max="60"
        value="10"
        inputmode="numeric"
        data-repeat-custom-input
        aria-label="Custom repeat days"
      />
      <button type="button" data-repeat-custom>Apply</button>
    </div>
  `;
  routineRepeatMenu.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button || !routineRepeatState) {
      return;
    }

    if (button.hasAttribute("data-repeat-custom")) {
      const input = routineRepeatMenu.querySelector("[data-repeat-custom-input]");
      applyRoutineRepeat(Number(input?.value));
      return;
    }

    applyRoutineRepeat(Number(button.dataset.repeatDays));
  });
  routineRepeatMenu.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || !event.target.matches("[data-repeat-custom-input]")) {
      return;
    }

    event.preventDefault();
    applyRoutineRepeat(Number(event.target.value));
  });

  document.addEventListener("pointerdown", (event) => {
    if (!routineRepeatMenu.hidden && !routineRepeatMenu.contains(event.target)) {
      closeRoutineRepeatMenu();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeRoutineRepeatMenu();
    }
  });
  document.body.appendChild(routineRepeatMenu);
  return routineRepeatMenu;
}

function openRoutineRepeatMenu(event, index, field) {
  event.preventDefault();
  event.stopPropagation();
  const value = routineData[index]?.[field]?.trim();
  if (!value) {
    return;
  }

  routineRepeatState = { index, field, value };
  const menu = getRoutineRepeatMenu();
  const rect = event.currentTarget.getBoundingClientRect();
  menu.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - 232))}px`;
  menu.style.top = `${rect.bottom + 8}px`;
  menu.hidden = false;
}

function applyRoutineRepeat(days) {
  if (!routineRepeatState || !Number.isInteger(days) || days < 1 || days > 60) {
    if (routineRepeatState) {
      flashStatus("반복 간격은 1-60일 사이로 입력해 주세요.", "reset");
    }
    closeRoutineRepeatMenu();
    return;
  }

  const { index, field, value } = routineRepeatState;
  const endDate = addDays(routineData[index].date, 84);
  while (routineData[routineData.length - 1].date < endDate) {
    routineData.push(createEmptyEntry(addDays(routineData[routineData.length - 1].date, 1)));
  }

  let filledCount = 0;
  const previousValues = [];
  for (let targetIndex = index + days; targetIndex < routineData.length; targetIndex += days) {
    if (routineData[targetIndex].date > endDate) {
      break;
    }

    if (!routineData[targetIndex][field].trim()) {
      previousValues.push({
        index: targetIndex,
        value: routineData[targetIndex][field],
      });
      routineData[targetIndex][field] = value;
      filledCount += 1;
    }
  }

  closeRoutineRepeatMenu();
  saveRoutine(filledCount ? `${filledCount}개 날짜에 반복 적용했어요.` : "비어 있는 반복 날짜가 없어요.");
  render();
  if (filledCount) {
    showUndoToast("반복 적용했어요.", () => {
      previousValues.forEach((item) => {
        if (routineData[item.index]) {
          routineData[item.index][field] = item.value;
        }
      });
      saveRoutine("반복 적용을 되돌렸어요.");
      render();
    });
  }
}

function createRepeatButton(index, field) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "cell-repeat-button";
  button.innerHTML = '<ion-icon name="repeat-outline" aria-hidden="true"></ion-icon>';
  button.setAttribute("aria-label", `${routineData[index].date} ${field} repeat`);
  button.addEventListener("click", (event) => openRoutineRepeatMenu(event, index, field));
  button.addEventListener("keydown", (event) => event.stopPropagation());
  return button;
}

function createRoutineDisplay(value, index, field, isNotes = false) {
  const display = document.createElement("div");
  display.className = `cell-display is-editable${isNotes ? " note-display" : ""}`;
  display.tabIndex = 0;
  display.setAttribute("role", "button");
  display.setAttribute(
    "aria-label",
    `${routineData[index].date} ${field} ${isNotes ? "노트" : "루틴"} 더블클릭 편집`
  );
  display.dataset.index = index;
  display.dataset.field = field;
  attachContextMenu(display);
  display.addEventListener("dblclick", () =>
    activateInlineEditor(display, index, field, isNotes)
  );
  display.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activateInlineEditor(display, index, field, isNotes);
    }
  });

  if (isNotes) {
    const note = document.createElement("div");
    note.className = "note-text";
    if (value.trim()) {
      appendAccentedText(note, value);
    } else {
      note.textContent = "메모를 남겨보세요.";
      note.classList.add("cell-placeholder");
    }
    display.appendChild(note);
    return display;
  }

  if (!value.trim()) {
    const empty = document.createElement("span");
    empty.className = "cell-placeholder";
    empty.textContent = "더블클릭해서 루틴을 입력하세요.";
    display.appendChild(empty);
    return display;
  }

  display.classList.add("has-repeat");
  const wrapper = document.createElement("div");
  wrapper.className = "routine-steps";
  getRoutineParts(value).forEach((part) => {
      const step = document.createElement("span");
      step.className = "routine-step";
      if (/레티놀|비타민C|클레이|마스크팩|에스트라|선크림|나이아신아마이드/.test(part)) {
        step.classList.add("is-emphasis");
      }
      appendAccentedText(step, part);
      wrapper.appendChild(step);
    });

  display.appendChild(wrapper);
  display.appendChild(createRepeatButton(index, field));
  return display;
}

function activateInlineEditor(display, index, field, isNotes = false) {
  const textarea = createTextarea(
    routineData[index][field],
    index,
    field,
    isNotes ? "note-input" : "editable-cell"
  );

  let isFinished = false;

  const finishEdit = (shouldSave) => {
    if (isFinished) {
      return;
    }
    isFinished = true;

    if (shouldSave) {
      routineData[index][field] = textarea.value.trim();
      saveRoutine("수정 내용 저장됨");
    }
    render();
  };

  textarea.addEventListener("blur", () => finishEdit(true), { once: true });
  textarea.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      finishEdit(false);
    }

    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      textarea.blur();
    }
  });

  display.replaceWith(textarea);
  textarea.focus();
  textarea.setSelectionRange(textarea.value.length, textarea.value.length);
}

function handleDoneToggle(event) {
  const index = Number(event.target.dataset.index);
  routineData[index].done = event.target.checked;
  saveRoutine(event.target.checked ? "오늘 루틴 체크 완료" : "체크 해제됨");
  render();
}

function updateField(index, field, value, message = "수정 내용 저장됨") {
  routineData[index][field] = value.trim();
  saveRoutine(message);
}

function toggleMobileOpen(index) {
  mobileOpenDay = mobileOpenDay === index ? null : index;
  if (mobileOpenDay !== index && mobileEditDay === index) {
    mobileEditDay = null;
  }
  renderMobileCards();
}

function toggleMobileEdit(index) {
  mobileOpenDay = index;
  mobileEditDay = mobileEditDay === index ? null : index;
  renderMobileCards();
}

function createMobileEditor(index, field, value, isNotes = false) {
  const textarea = createTextarea(
    value,
    index,
    field,
    isNotes ? "mobile-textarea note" : "mobile-textarea"
  );
  textarea.addEventListener("input", (event) => {
    updateField(index, field, event.target.value, "모바일에서 저장됨");
  });
  return textarea;
}

function createMobileField(label, icon, index, field, value, isEditing, isNotes = false) {
  const section = document.createElement("section");
  section.className = "mobile-field";
  section.innerHTML = `
    <div class="mobile-field-head">
      <span class="mobile-field-label">
        <ion-icon name="${icon}" aria-hidden="true"></ion-icon>
        <span>${label}</span>
      </span>
    </div>
  `;

  if (isEditing) {
    section.appendChild(createMobileEditor(index, field, value, isNotes));
  } else {
    section.appendChild(createRoutineDisplay(value, index, field, isNotes));
  }

  return section;
}

function renderTable() {
  tableBody.innerHTML = "";
  const todayKey = getTodayDateKey();

  getVisibleEntries().forEach(({ entry, actualIndex }) => {
    const row = document.createElement("tr");
    if (entry.date === todayKey) {
      row.classList.add("today-row");
    }

    const dateCell = document.createElement("td");
    const moodMeta = getMoodMeta(entry.mood);
    dateCell.innerHTML = `
      <div class="day-chip">
        <span>${formatDateLabel(entry.date)}</span>
        ${entry.date === todayKey ? '<span class="today-badge">Today</span>' : ""}
      </div>
      <div class="day-sub">${getWeekdayLabel(entry.date)}요일</div>
      ${moodMeta ? `<div class="table-mood"><ion-icon name="${moodMeta.icon}" aria-hidden="true"></ion-icon><span>${moodMeta.label}</span></div>` : ""}
    `;

    const morningCell = document.createElement("td");
    morningCell.appendChild(createRoutineDisplay(entry.morning, actualIndex, "morning"));

    const eveningCell = document.createElement("td");
    eveningCell.appendChild(
      createRoutineDisplay(entry.eveningCleanse, actualIndex, "eveningCleanse")
    );

    const skincareCell = document.createElement("td");
    skincareCell.appendChild(createRoutineDisplay(entry.skincare, actualIndex, "skincare"));

    const extraCell = document.createElement("td");
    extraCell.appendChild(createRoutineDisplay(entry.extraCare, actualIndex, "extraCare"));

    const doneCell = document.createElement("td");
    doneCell.className = "checkbox-wrap";
    doneCell.appendChild(createCheckbox(entry.done, actualIndex));

    const noteCell = document.createElement("td");
    noteCell.appendChild(createRoutineDisplay(entry.notes, actualIndex, "notes", true));

    row.append(
      doneCell,
      dateCell,
      morningCell,
      eveningCell,
      skincareCell,
      extraCell,
      noteCell
    );
    tableBody.appendChild(row);
  });
}

function renderMobileCards() {
  mobileCards.innerHTML = "";
  const todayKey = getTodayDateKey();

  getVisibleEntries().forEach(({ entry, actualIndex }) => {
    const card = document.createElement("article");
    const isOpen = mobileOpenDay === actualIndex;
    const isEditing = mobileEditDay === actualIndex;
    card.className = `routine-mobile-card card${isOpen ? " is-open" : ""}${
      isEditing ? " is-editing" : ""
    }`;

    const skincareSummary = entry.skincare.trim()
      ? stripRoutineAccentMarkers(getRoutineParts(entry.skincare)[0]) || "루틴 비어 있음"
      : "루틴 비어 있음";
    const extraSummary = entry.extraCare.trim() || "추가 케어 없음";
    const moodMeta = getMoodMeta(entry.mood);

    card.innerHTML = `
      <div class="mobile-card-head">
        <label class="mobile-done-toggle" aria-label="${entry.date} 완료 체크">
          <span>Done</span>
        </label>
        <div class="mobile-card-main">
          <div class="mobile-day-wrap">
            <div class="mobile-day ${entry.date === todayKey ? "today-label" : ""}">
              ${formatDateLabel(entry.date)}
            </div>
            <div class="mobile-weekday">${getWeekdayLabel(entry.date)}요일</div>
            ${
              entry.date === todayKey
                ? '<span class="today-badge mobile-today-badge">Today</span>'
                : ""
            }
          </div>
          ${moodMeta ? `<div class="mobile-mood"><ion-icon name="${moodMeta.icon}" aria-hidden="true"></ion-icon><span>${moodMeta.label}</span></div>` : ""}
          <div class="mobile-card-summary">
            <span>${skincareSummary}</span>
            <span class="mobile-summary-dot"></span>
            <span>${extraSummary}</span>
          </div>
        </div>
        <div class="mobile-card-actions">
          <button class="mobile-icon-button mobile-edit-button" type="button" aria-label="Edit ${entry.date}">
            <ion-icon name="${isEditing ? "checkmark-outline" : "create-outline"}" aria-hidden="true"></ion-icon>
          </button>
          <button class="mobile-icon-button mobile-expand-button" type="button" aria-expanded="${String(
            isOpen
          )}" aria-label="${entry.date} details">
            <ion-icon name="${isOpen ? "chevron-up-outline" : "chevron-down-outline"}" aria-hidden="true"></ion-icon>
          </button>
        </div>
      </div>
      <div class="mobile-card-body" ${isOpen ? "" : "hidden"}></div>
    `;

    const doneWrap = card.querySelector(".mobile-done-toggle");
    doneWrap.appendChild(createCheckbox(entry.done, actualIndex));

    card.querySelector(".mobile-edit-button").addEventListener("click", () => {
      toggleMobileEdit(actualIndex);
    });
    card.querySelector(".mobile-expand-button").addEventListener("click", () => {
      toggleMobileOpen(actualIndex);
    });

    const body = card.querySelector(".mobile-card-body");
    body.appendChild(
      createMobileField(
        "Morning routine",
        "sunny-outline",
        actualIndex,
        "morning",
        entry.morning,
        isEditing
      )
    );
    body.appendChild(
      createMobileField(
        "Evening cleanse",
        "moon-outline",
        actualIndex,
        "eveningCleanse",
        entry.eveningCleanse,
        isEditing
      )
    );
    body.appendChild(
      createMobileField(
        "Afternoon/Evening skincare",
        "flask-outline",
        actualIndex,
        "skincare",
        entry.skincare,
        isEditing
      )
    );
    body.appendChild(
      createMobileField(
        "Extra care",
        "sparkles-outline",
        actualIndex,
        "extraCare",
        entry.extraCare,
        isEditing
      )
    );
    body.appendChild(
      createMobileField(
        "Notes",
        "document-text-outline",
        actualIndex,
        "notes",
        entry.notes,
        isEditing,
        true
      )
    );

    mobileCards.appendChild(card);
  });
}

function render() {
  renderActiveView();
  if (activeView === "skin" && activeSkinSection === "routine") {
    updateWeekRangeLabel();
    renderJournalSummary();
    renderSkinVideoPreview();
    renderSkinVideoList();
    renderTable();
    renderMobileCards();
  }
  if (activeView === "skin" && activeSkinSection === "products") {
    renderSkinProductList();
  }
  if (activeView === "body" && activeBodySection === "progress") {
    renderBodyProgress();
  }
  if (activeView === "body" && activeBodySection === "workouts") {
    renderBodyWorkoutList();
  }
  if (activeView === "style") {
    renderStyleBoard();
  }
}

function exportRoutineJson() {
  setSettingsOpen(false);
  const payload = {
    version: 6,
    exportedAt: new Date().toISOString(),
    ...buildAppPayload(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `my-self-care-${getTodayDateKey()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  flashStatus("JSON으로 내보냈어요.", "saved");
}

function importRoutineJson(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result || "{}"));
      const imported = normalizeAppData(parsed.routine || parsed);
      routineData = imported.skinTimeline;
      bodyData = imported.bodyProgress;
      skinLibraryData = imported.skinLibrary;
      styleData = imported.styleBoard;
      visibleWeekStart = getWeekStartIndex();
      mobileOpenDay = getTodayIndex();
      mobileEditDay = null;
      saveRoutine("JSON을 가져왔어요.");
      render();
    } catch (error) {
      flashStatus("JSON 형식을 읽지 못했어요.", "reset");
    } finally {
      importFileInput.value = "";
    }
  };
  reader.readAsText(file);
}

function appendMoreDays(count = TIMELINE_APPEND_DAYS, shouldRender = true) {
  const lastDate = routineData.length
    ? routineData[routineData.length - 1].date
    : getTodayDateKey();

  for (let index = 1; index <= count; index += 1) {
    routineData.push(createEmptyEntry(addDays(lastDate, index)));
  }

  saveRoutine(`${count}일 더 추가했어요.`);
  if (shouldRender) {
    render();
  }
}

function showPreviousWeek() {
  const currentStartDate = routineData[visibleWeekStart]?.date || getWeekStartDateKey();
  const previousMonday = addDays(currentStartDate, -7);
  const foundIndex = routineData.findIndex((entry) => entry.date === previousMonday);
  visibleWeekStart = foundIndex >= 0 ? foundIndex : 0;
  mobileEditDay = null;
  render();
}

function showNextWeek() {
  const currentStartDate = routineData[visibleWeekStart]?.date || getWeekStartDateKey();
  const nextMonday = addDays(currentStartDate, 7);

  while (routineData[routineData.length - 1].date < addDays(nextMonday, 6)) {
    appendMoreDays(TIMELINE_APPEND_DAYS, false);
  }

  const foundIndex = routineData.findIndex((entry) => entry.date === nextMonday);
  visibleWeekStart = foundIndex >= 0 ? foundIndex : visibleWeekStart;
  mobileEditDay = null;
  render();
}

function duplicateCurrentWeekToNextWeek() {
  const currentEntries = getVisibleEntries();
  if (!currentEntries.length) {
    return;
  }

  const nextWeekStartDate = addDays(currentEntries[0].entry.date, 7);

  while (routineData[routineData.length - 1].date < addDays(nextWeekStartDate, 6)) {
    appendMoreDays(TIMELINE_APPEND_DAYS, false);
  }

  currentEntries.forEach(({ entry }, offset) => {
    const targetDate = addDays(nextWeekStartDate, offset);
    const targetIndex = routineData.findIndex((item) => item.date === targetDate);
    if (targetIndex < 0) {
      return;
    }

    routineData[targetIndex] = {
      ...routineData[targetIndex],
      morning: entry.morning,
      eveningCleanse: entry.eveningCleanse,
      skincare: entry.skincare,
      extraCare: entry.extraCare,
      done: false,
      mood: "",
      notes: "",
    };
  });

  setSettingsOpen(false);
  saveRoutine("이번 주 루틴을 다음 주로 복사했어요.");
  visibleWeekStart = routineData.findIndex((entry) => entry.date === nextWeekStartDate);
  mobileOpenDay = visibleWeekStart;
  mobileEditDay = null;
  render();
}
