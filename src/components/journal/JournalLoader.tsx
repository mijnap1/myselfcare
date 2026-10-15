"use client";

import { useSyncExternalStore } from "react";
import { JournalApp, type JournalAppProps } from "./JournalApp";
import { LoadingShell } from "./LoadingShell";

const subscribeNoop = () => () => {};

/**
 * The journal depends on the browser's local date ("today", the current
 * week), so it renders only on the client to avoid hydration mismatches.
 */
export function JournalLoader(props: JournalAppProps) {
  const isClient = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );

  return isClient ? <JournalApp {...props} /> : <LoadingShell />;
}
