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

export type SyncState = "idle" | "error";
export type JournalRecipe = (draft: Draft<JournalData>) => void;
type Edit = (base: JournalData) => JournalData;

interface StoreOptions {
  userId: string;
  initialData: unknown;
  initialVersion: number;
}

/**
 * Owns the journal document: applies edits immutably and debounces saves to
 * Supabase. If another device or tab saved first, the edits made here are
 * replayed on top of that newer copy, so neither side's changes are lost.
 */
export function useJournalStore({ userId, initialData, initialVersion }: StoreOptions) {
  const [data, setData] = useState(() => normalizeJournalData(initialData));
  const [syncState, setSyncState] = useState<SyncState>("idle");

  const dataRef = useRef(data);
  const versionRef = useRef(initialVersion);
  const dirtyRef = useRef(false);
  // Edits applied since the last confirmed save, in order.
  const pendingRef = useRef<Edit[]>([]);
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
    const sentCount = pendingRef.current.length;
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
        pendingRef.current = pendingRef.current.slice(sentCount);
        setSyncState("idle");
      } else {
        // Another device saved first: replay this tab's edits on its copy and save that.
        const latest = await fetchJournalDocument(supabase, userId);
        if (!latest) {
          throw new Error("Journal document disappeared");
        }
        const merged = pendingRef.current.reduce(
          (base, edit) => edit(base),
          normalizeJournalData(latest.data)
        );
        versionRef.current = latest.version;
        dataRef.current = merged;
        dirtyRef.current = pendingRef.current.length > 0;
        setData(merged);
        setSyncState("idle");
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
        pendingRef.current.push((base) => produce(base, recipe));
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
      pendingRef.current.push(() => next);
      dataRef.current = next;
      dirtyRef.current = true;
      setData(next);
      schedule(SAVE_DELAY_MS);
    },
    [schedule]
  );

  // Pick up changes saved elsewhere when nothing here is waiting to be saved.
  const refresh = useCallback(async () => {
    if (dirtyRef.current || savingRef.current) {
      return;
    }
    try {
      const latest = await fetchJournalDocument(getBrowserSupabase(), userId);
      if (!latest || latest.version <= versionRef.current || dirtyRef.current || savingRef.current) {
        return;
      }
      const next = normalizeJournalData(latest.data);
      versionRef.current = latest.version;
      dataRef.current = next;
      setData(next);
    } catch {
      // Offline or signed out: the next save sorts it out.
    }
  }, [userId]);
  const refreshRef = useRef(refresh);
  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  // Save right away when the tab is hidden, catch up when it comes back, and
  // warn before closing with unsaved edits.
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        void flushRef.current();
      } else {
        void refreshRef.current();
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
