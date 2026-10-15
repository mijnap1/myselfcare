"use client";

import { useCallback } from "react";
import { removeRepeat, restoreRepeat, type RepeatRemoval } from "@/lib/journal/repeats";
import { useJournal } from "../JournalContext";

/** Removes a repeat (or its tail from `fromDate`) and offers undo. */
export function useRemoveRoutineRepeat() {
  const { update, showUndo } = useJournal();

  return useCallback(
    (repeatId: string, fromDate?: string) => {
      const result: { removal: RepeatRemoval | null } = { removal: null };
      update((draft) => {
        result.removal = removeRepeat(draft, repeatId, fromDate);
      });

      const { removal } = result;
      if (!removal) return;

      const count = removal.clearedDates.length;
      showUndo(
        fromDate
          ? `이 날짜부터 반복을 중단했어요 (${count}개 날짜).`
          : `반복을 삭제했어요 (${count}개 날짜).`,
        () => update((draft) => restoreRepeat(draft, removal))
      );
    },
    [showUndo, update]
  );
}
