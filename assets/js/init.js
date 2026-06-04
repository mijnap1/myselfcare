document.addEventListener("click", (event) => {
  if (isSettingsOpen && !event.target.closest(".settings-menu")) {
    setSettingsOpen(false);
  }

  if (!event.target.closest(".cell-context-menu")) {
    closeCellContextMenu();
  }

  if (isBodyCalendarOpen && !event.target.closest(".body-date-picker")) {
    setBodyCalendarOpen(false);
  }
});

document.addEventListener("scroll", closeCellContextMenu, true);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCellContextMenu();
    hideUndoToast();
  }
});

themeToggle.addEventListener("click", toggleTheme);
settingsButton.addEventListener("click", toggleSettingsMenu);
undoToastButton.addEventListener("click", runPendingUndo);
undoToastClose.addEventListener("click", hideUndoToast);
skinViewTab.addEventListener("click", () => setActiveView("skin"));
bodyViewTab.addEventListener("click", () => setActiveView("body"));
styleViewTab.addEventListener("click", () => setActiveView("style"));
skinRoutineTab.addEventListener("click", () => setActiveSkinSection("routine"));
skinProductsTab.addEventListener("click", () => setActiveSkinSection("products"));
bodyProgressTab.addEventListener("click", () => setActiveBodySection("progress"));
bodyWorkoutTab.addEventListener("click", () => setActiveBodySection("workouts"));
signInTab.addEventListener("click", () => setAuthMode("sign-in"));
signUpTab.addEventListener("click", () => setAuthMode("sign-up"));
resetPasswordButton.addEventListener("click", () => setAuthMode("reset-password"));
authForm.addEventListener("submit", handleAuthSubmit);
logoutButton.addEventListener("click", handleLogout);
duplicateWeekButton.addEventListener("click", duplicateCurrentWeekToNextWeek);
exportButton.addEventListener("click", exportRoutineJson);
importButton.addEventListener("click", () => {
  setSettingsOpen(false);
  importFileInput.click();
});
prevWeekButton.addEventListener("click", showPreviousWeek);
nextWeekButton.addEventListener("click", showNextWeek);
importFileInput.addEventListener("change", importRoutineJson);
heightInput.addEventListener("change", handleBodyProfileInput);
ageInput.addEventListener("change", handleBodyProfileInput);
targetWeightInput.addEventListener("change", handleBodyProfileInput);
sexButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setSexValue(button.dataset.sexValue);
    saveBodyProgress("바디 프로필을 저장했어요.");
    renderBodyHero();
  });
});
bodyEntryForm.addEventListener("submit", handleBodyEntrySubmit);
bodyWorkoutForm.addEventListener("submit", handleBodyWorkoutSubmit);
styleItemForm.addEventListener("submit", handleStyleItemSubmit);
skinProductForm.addEventListener("submit", handleSkinProductSubmit);
skinVideoForm.addEventListener("submit", handleSkinVideoSubmit);
skinVideoUrlInput.addEventListener("input", queueSkinVideoPreviewSync);
skinVideoUrlInput.addEventListener("change", queueSkinVideoPreviewSync);
skinVideoTitleInput.addEventListener("input", renderSkinVideoPreview);
skinVideoNoteInput.addEventListener("input", renderSkinVideoPreview);
bodyDateToggle.addEventListener("click", () => {
  bodyCalendarMonth = (bodyDateInput.dataset.value || getTodayDateKey()).slice(0, 7);
  setBodyCalendarOpen(!isBodyCalendarOpen);
});
skinProductImageZone.addEventListener("click", () => {
  skinProductImageInput.click();
});
skinProductImageZone.addEventListener("paste", handleSkinProductImagePaste);
skinProductImageZone.addEventListener("dragover", (event) => {
  event.preventDefault();
});
skinProductImageZone.addEventListener("drop", (event) => {
  event.preventDefault();
  loadSkinProductImageFromFile(event.dataTransfer?.files?.[0]);
});
skinProductImageInput.addEventListener("change", (event) => {
  loadSkinProductImageFromFile(event.target.files?.[0]);
  skinProductImageInput.value = "";
});
bodyPartButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setBodyWorkoutPart(button.dataset.bodyPart);
  });
});
bodyWorkoutImageZone.addEventListener("click", () => {
  bodyWorkoutImageInput.click();
});
bodyWorkoutImageZone.addEventListener("paste", handleBodyWorkoutImagePaste);
bodyWorkoutImageZone.addEventListener("dragover", (event) => {
  event.preventDefault();
});
bodyWorkoutImageZone.addEventListener("drop", (event) => {
  event.preventDefault();
  loadBodyWorkoutImageFromFile(event.dataTransfer?.files?.[0]);
});
bodyWorkoutImageInput.addEventListener("change", (event) => {
  loadBodyWorkoutImageFromFile(event.target.files?.[0]);
  bodyWorkoutImageInput.value = "";
});
styleCategoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setStyleCategory(button.dataset.styleCategory);
  });
});
styleItemImageZone.addEventListener("click", () => {
  styleItemImageInput.click();
});
styleItemImageZone.addEventListener("paste", handleStyleImagePaste);
styleItemImageZone.addEventListener("dragover", (event) => {
  event.preventDefault();
});
styleItemImageZone.addEventListener("drop", (event) => {
  event.preventDefault();
  loadStyleImageFromFile(event.dataTransfer?.files?.[0]);
});
styleItemImageInput.addEventListener("change", (event) => {
  loadStyleImageFromFile(event.target.files?.[0]);
  styleItemImageInput.value = "";
});
skinProductStatusInput.querySelectorAll("[data-product-status]").forEach((button) => {
  button.addEventListener("click", () => {
    setSkinProductStatus(button.dataset.productStatus);
  });
});
skinTypeSelector.querySelectorAll("[data-skin-type-option]").forEach((button) => {
  button.addEventListener("click", () => {
    setSkinProductTargetCell(skinProductTargetCell.season, button.dataset.skinTypeOption);
    renderSkinProductList();
  });
});

applyTheme(currentTheme);
setAuthMode("sign-in");
supabaseClient = initSupabase();
routineData = ensureTimelineWindow(routineData);
visibleWeekStart = getWeekStartIndex();
mobileOpenDay = getTodayIndex();
setBodyCalendarDate(getTodayDateKey());
setBodyWorkoutPart(bodyWorkoutPart);
setStyleCategory(styleCategory);
setSkinProductStatus(skinProductStatus);
setSkinProductTargetCell(skinProductTargetCell.season, skinProductTargetCell.skinType);

if (supabaseClient) {
  syncSession();
} else {
  updateAuthUI();
  setAuthMessage("script.js에 Supabase URL과 anon key를 넣으면 로그인 기능이 활성화됩니다.");
}

render();
