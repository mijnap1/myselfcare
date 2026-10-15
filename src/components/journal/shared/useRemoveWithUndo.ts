"use client";

import { current, type Draft } from "immer";
import { useCallback } from "react";
import { removeJournalImages } from "@/lib/journal/storage";
import type { ImageRef, JournalData } from "@/lib/journal/types";
import { useJournal } from "../JournalContext";

type RemovableItem = { id: string } & Partial<ImageRef>;

/**
 * Removes an item from one of the journal lists and offers undo. The item's
 * stored image is deleted only once undo is no longer possible.
 */
export function useRemoveWithUndo<T extends RemovableItem>(select: (draft: Draft<JournalData>) => Draft<T>[]) {
  const { update, showUndo } = useJournal();

  return useCallback(
    (id: string, message: string) => {
      let removed: T | undefined;
      let removedIndex = -1;

      update((draft) => {
        const list = select(draft);
        removedIndex = list.findIndex((item) => item.id === id);
        if (removedIndex >= 0) {
          removed = current(list[removedIndex]) as T;
          list.splice(removedIndex, 1);
        }
      });

      if (!removed) {
        return;
      }
      const item = removed;

      showUndo(
        message,
        () =>
          update((draft) => {
            const list = select(draft);
            if (!list.some((entry) => entry.id === item.id)) {
              list.splice(Math.min(removedIndex, list.length), 0, item as Draft<T>);
            }
          }),
        () => {
          if (item.imagePath) {
            void removeJournalImages([item.imagePath]);
          }
        }
      );
    },
    [select, showUndo, update]
  );
}
