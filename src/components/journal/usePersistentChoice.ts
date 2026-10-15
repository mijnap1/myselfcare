"use client";

import { useCallback, useState } from "react";

/**
 * A string choice remembered in localStorage (active tab etc.).
 * Only used inside the client-only journal, so reading storage on init is safe.
 */
export function usePersistentChoice<T extends string>(key: string, options: readonly T[], fallback: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      return options.includes(saved as T) ? (saved as T) : fallback;
    } catch {
      return fallback;
    }
  });

  const update = useCallback(
    (next: T) => {
      setValue(next);
      try {
        localStorage.setItem(key, next);
      } catch {
        // Not persisted in private mode; the choice still applies.
      }
    },
    [key]
  );

  return [value, update] as const;
}
