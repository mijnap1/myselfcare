"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ACTIVE_BODY_SECTION_KEY,
  ACTIVE_SKIN_SECTION_KEY,
  ACTIVE_VIEW_KEY,
} from "@/lib/journal/constants";
import { addDays, getTodayDateKey } from "@/lib/journal/dates";
import { normalizeJournalData, toPayload } from "@/lib/journal/normalize";
import { extendTimelineTo, getTodayIndex, getWeekStartIndex } from "@/lib/journal/timeline";
import type { JournalData } from "@/lib/journal/types";
import { Header } from "../Header";
import { BodyProgressSection } from "./body/BodyProgressSection";
import { WorkoutSection } from "./body/WorkoutSection";
import { AccountBadge } from "./AccountBadge";
import { JournalContext, type JournalContextValue } from "./JournalContext";
import { SettingsMenu } from "./SettingsMenu";
import { ProductShelf } from "./skin/ProductShelf";
import { RoutineSection, type RoutineViewState } from "./skin/RoutineSection";
import { StyleBoardSection } from "./style/StyleBoardSection";
import { useJournalStore } from "./useJournalStore";
import { usePersistentChoice } from "./usePersistentChoice";
import { useUndoToast } from "./useUndoToast";
import { ViewNav } from "./ViewNav";

export interface JournalAppProps {
  userId: string;
  username: string;
  initialData: unknown;
  initialVersion: number;
}

const VIEWS = ["skin", "body", "style"] as const;
const SKIN_SECTIONS = ["routine", "products"] as const;
const BODY_SECTIONS = ["progress", "workouts"] as const;

function createRoutineView(data: JournalData): RoutineViewState {
  return {
    weekStart: getWeekStartIndex(data.skinTimeline),
    openDay: getTodayIndex(data.skinTimeline),
    editDay: null,
  };
}

export function JournalApp({ userId, username, initialData, initialVersion }: JournalAppProps) {
  const { data, update, replace, flush, syncState, dismissSyncState } = useJournalStore({
    userId,
    initialData,
    initialVersion,
  });
  const { showUndo, notify, element: toast } = useUndoToast();
  const [view, setView] = usePersistentChoice(ACTIVE_VIEW_KEY, VIEWS, "skin");
  const [skinSection, setSkinSection] = usePersistentChoice(ACTIVE_SKIN_SECTION_KEY, SKIN_SECTIONS, "routine");
  const [bodySection, setBodySection] = usePersistentChoice(ACTIVE_BODY_SECTION_KEY, BODY_SECTIONS, "progress");
  const [routineView, setRoutineView] = useState(() => createRoutineView(data));

  const context = useMemo<JournalContextValue>(
    () => ({ userId, data, update, showUndo, notify }),
    [userId, data, update, showUndo, notify]
  );

  const duplicateWeek = useCallback(() => {
    const start = routineView.weekStart;
    const nextWeekStart = addDays(data.skinTimeline[start].date, 7);

    const next = update((draft) => {
      const timeline = draft.skinTimeline;
      const currentWeek = timeline.slice(start, start + 7).map((entry) => ({ ...entry }));
      extendTimelineTo(timeline, addDays(nextWeekStart, 6));

      currentWeek.forEach((entry, offset) => {
        const target = timeline.find((item) => item.date === addDays(nextWeekStart, offset));
        if (target) {
          Object.assign(target, {
            morning: entry.morning,
            faceRoutine: entry.faceRoutine,
            eveningCleanse: entry.eveningCleanse,
            skincare: entry.skincare,
            grooming: [...entry.grooming],
            done: false,
            mood: "",
            notes: "",
          });
        }
      });
    });

    const nextIndex = next.skinTimeline.findIndex((entry) => entry.date === nextWeekStart);
    setRoutineView({ weekStart: nextIndex, openDay: nextIndex, editDay: null });
    setView("skin");
    setSkinSection("routine");
    notify("이번 주 루틴을 다음 주로 복사했어요.");
  }, [data.skinTimeline, notify, routineView.weekStart, setSkinSection, setView, update]);

  const exportJson = useCallback(() => {
    const payload = { exportedAt: new Date().toISOString(), ...toPayload(data) };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `my-self-care-${getTodayDateKey()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const importJson = useCallback(
    async (file: File) => {
      try {
        const imported = normalizeJournalData(JSON.parse(await file.text()));
        replace(imported);
        setRoutineView(createRoutineView(imported));
        notify("JSON을 가져왔어요.");
      } catch {
        notify("JSON 형식을 읽지 못했어요.");
      }
    },
    [notify, replace]
  );

  const syncStatus =
    syncState === "idle" ? null : (
      <p className="save-status reset" role="status">
        {syncState === "conflict"
          ? "다른 기기에서 저장된 최신 기록을 불러왔어요. 방금 수정한 내용은 다시 확인해 주세요."
          : "저장에 실패했어요. 연결되면 자동으로 다시 저장합니다."}{" "}
        <button className="auth-reset-option" type="button" onClick={dismissSyncState}>
          닫기
        </button>
      </p>
    );

  return (
    <JournalContext value={context}>
      <div className="page-shell">
        <Header
          account={<AccountBadge username={username} onBeforeSignOut={flush} />}
          actions={<SettingsMenu onDuplicateWeek={duplicateWeek} onExport={exportJson} onImportFile={importJson} />}
          status={syncStatus}
        />

        <main id="appContent" className="app-content">
          <ViewNav
            view={view}
            skinSection={skinSection}
            bodySection={bodySection}
            onViewChange={setView}
            onSkinSectionChange={setSkinSection}
            onBodySectionChange={setBodySection}
          />

          <section className="content-view layout-section" hidden={view !== "skin"}>
            <div className="layout" hidden={skinSection !== "routine"}>
              <RoutineSection viewState={routineView} onViewStateChange={setRoutineView} />
            </div>
            <section className="skin-products-shell" hidden={skinSection !== "products"}>
              <ProductShelf />
            </section>
          </section>

          <section className="content-view layout-section body-view" hidden={view !== "body"}>
            <div className="body-shell" hidden={bodySection !== "progress"}>
              <BodyProgressSection />
            </div>
            <section className="body-workout-shell" hidden={bodySection !== "workouts"}>
              <WorkoutSection />
            </section>
          </section>

          <section className="content-view layout-section style-view" hidden={view !== "style"}>
            <div className="style-shell">
              <StyleBoardSection />
            </div>
          </section>
        </main>
      </div>
      {toast}
    </JournalContext>
  );
}
