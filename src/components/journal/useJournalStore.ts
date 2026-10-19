"use client";

import { produce, type Draft } from "immer";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchJournalDocument,
  saveJournalDocument,
} from "@/lib/journal/documents";
import { normalizeJournalData, toPayload } from "@/lib/journal/normalize";
import { hasInlineImages, uploadInlineImages } from "@/lib/journal/storage";
import type { ImageRef, JournalData } from "@/lib/journal/types";
import { getBrowserSupabase } from "@/lib/supabase/client";

const SAVE_DELAY_MS = 600;
const RETRY_DELAY_MS = 5000;

export type SyncState = "idle" | "error" | "conflict";
export type JournalRecipe = (draft: Draft<JournalData>) => void;

interface StoreOptions {
  userId: string;
  initialData: unknown;
  initialVersion: number;
}

/**
 * Owns the journal document: applies edits immutably, debounces saves to
 * Supabase, and reloads the latest copy if another device saved first.
 */
export function useJournalStore({ userId, initialData, initialVersion }: StoreOptions) {
  const [data, setData] = useState(() => normalizeJournalData(initialData));
  const [syncState, setSyncState] = useState<SyncState>("idle");

  const dataRef = useRef(data);
  const versionRef = useRef(initialVersion);
  const dirtyRef = useRef(false);
  const savingRef = useRef(false);
  const timerRef = useRef<number | undefined>(undefined);
  const flushRef = useRef<() => Promise<void>>(async () => {});

  const schedule = useCallback((delay: number) => {
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => void flushRef.current(), delay);
  }, []);

  const flush = useCallback(async () => {
    window.clearTimeout(timerRef.current);
    if (savingRef.current || !dirtyRef.current) {
      return;
    }

    const supabase = getBrowserSupabase();
    savingRef.current = true;
    dirtyRef.current = false;
    let failed = false;

    try {
      const result = await saveJournalDocument(
        supabase,
        userId,
        versionRef.current,
        toPayload(dataRef.current)
      );

      if (result.status === "saved") {
        versionRef.current = result.version;
        setSyncState("idle");
      } else {
        // Another device saved first: take its copy instead of overwriting it.
        const latest = await fetchJournalDocument(supabase, userId);
        if (latest) {
          const next = normalizeJournalData(latest.data);
          versionRef.current = latest.version;
          dataRef.current = next;
          dirtyRef.current = false;
          setData(next);
        }
        setSyncState("conflict");
      }
    } catch (error) {
      console.warn("Failed to save journal:", error);
      dirtyRef.current = true;
      failed = true;
      setSyncState("error");
    } finally {
      savingRef.current = false;
      if (dirtyRef.current) {
        schedule(failed ? RETRY_DELAY_MS : SAVE_DELAY_MS);
      }
    }
  }, [schedule, userId]);

  useEffect(() => {
    flushRef.current = flush;
  }, [flush]);

  /** Applies an edit and returns the new document. */
  const update = useCallback(
    (recipe: JournalRecipe): JournalData => {
      const next = produce(dataRef.current, recipe);
      if (next !== dataRef.current) {
        dataRef.current = next;
        dirtyRef.current = true;
        setData(next);
        schedule(SAVE_DELAY_MS);
      }
      return next;
    },
    [schedule]
  );

  const replace = useCallback(
    (next: JournalData) => {
      dataRef.current = next;
      dirtyRef.current = true;
      setData(next);
      schedule(SAVE_DELAY_MS);
    },
    [schedule]
  );

  // Save right away when the tab is hidden, and warn before closing with unsaved edits.
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        void flushRef.current();
      }
    };
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (dirtyRef.current || savingRef.current) {
        event.preventDefault();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.clearTimeout(timerRef.current);
    };
  }, []);

  // Move base64 images from the old app (or an imported JSON) into Storage.
  const migratingRef = useRef(false);
  const migrationFailedRef = useRef(false);
  useEffect(() => {
    if (migratingRef.current || migrationFailedRef.current || !hasInlineImages(data)) {
      return;
    }
    migratingRef.current = true;

    uploadInlineImages(userId, data)
      .then((uploaded) => {
        if (!uploaded.size) {
          return;
        }
        update((draft) => {
          const holders: ImageRef[] = [
            ...draft.skinLibrary.products,
            ...draft.bodyProgress.workouts,
            ...draft.bodyProgress.meals,
            ...draft.styleBoard.items,
          ];
          holders.forEach((item) => {
            const path = uploaded.get(item.imageDataUrl);
            if (path) {
              item.imagePath = path;
              item.imageDataUrl = "";
            }
          });
        });
      })
      .catch((error) => {
        console.warn("Failed to move inline images to storage:", error);
        migrationFailedRef.current = true;
      })
      .finally(() => {
        migratingRef.current = false;
      });
  }, [data, update, userId]);

  const dismissSyncState = useCallback(() => setSyncState("idle"), []);

  return { data, update, replace, flush, syncState, dismissSyncState };
}
