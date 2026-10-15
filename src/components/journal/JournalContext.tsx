"use client";

import { createContext, use } from "react";
import type { JournalData } from "@/lib/journal/types";
import type { JournalRecipe } from "./useJournalStore";

export interface JournalContextValue {
  userId: string;
  data: JournalData;
  update: (recipe: JournalRecipe) => JournalData;
  /** Shows the undo toast. `onExpire` runs once undo is no longer possible. */
  showUndo: (message: string, onUndo: () => void, onExpire?: () => void) => void;
  notify: (message: string) => void;
}

export const JournalContext = createContext<JournalContextValue | null>(null);

export function useJournal(): JournalContextValue {
  const value = use(JournalContext);
  if (!value) {
    throw new Error("useJournal must be used inside JournalApp");
  }
  return value;
}
