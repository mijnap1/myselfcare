"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Icon } from "../Icon";

const TOAST_DURATION_MS = 6500;
/** Matches the exit transition in CSS (.undo-toast.is-leaving). */
const TOAST_EXIT_MS = 320;

interface PendingUndo {
  onUndo?: () => void;
  onExpire?: () => void;
}

interface ToastState {
  id: number;
  message: string;
  canUndo: boolean;
  leaving: boolean;
}

/**
 * One toast at a time at the top of the screen. It eases in, counts down
 * (paused while hovered), and eases out before unmounting.
 */
export function useUndoToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const pendingRef = useRef<PendingUndo | null>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const exitTimerRef = useRef<number | undefined>(undefined);
  const remainingRef = useRef(TOAST_DURATION_MS);
  const startedAtRef = useRef(0);

  /** Undo is no longer possible: let the caller finalize (e.g. delete files). */
  const expirePending = useCallback(() => {
    const pending = pendingRef.current;
    pendingRef.current = null;
    pending?.onExpire?.();
  }, []);

  const leave = useCallback(() => {
    window.clearTimeout(timerRef.current);
    setToast((current) => (current ? { ...current, leaving: true } : current));
    window.clearTimeout(exitTimerRef.current);
    exitTimerRef.current = window.setTimeout(
      () => setToast((current) => (current?.leaving ? null : current)),
      TOAST_EXIT_MS
    );
  }, []);

  const dismiss = useCallback(() => {
    expirePending();
    leave();
  }, [expirePending, leave]);

  const startTimer = useCallback(
    (duration: number) => {
      window.clearTimeout(timerRef.current);
      startedAtRef.current = Date.now();
      remainingRef.current = duration;
      timerRef.current = window.setTimeout(dismiss, duration);
    },
    [dismiss]
  );

  const pause = useCallback(() => {
    window.clearTimeout(timerRef.current);
    remainingRef.current = Math.max(remainingRef.current - (Date.now() - startedAtRef.current), 0);
  }, []);

  const resume = useCallback(() => startTimer(remainingRef.current), [startTimer]);

  const open = useCallback(
    (message: string, pending: PendingUndo | null) => {
      window.clearTimeout(exitTimerRef.current);
      expirePending();
      pendingRef.current = pending;
      setToast({ id: Date.now(), message, canUndo: Boolean(pending?.onUndo), leaving: false });
      startTimer(TOAST_DURATION_MS);
    },
    [expirePending, startTimer]
  );

  const showUndo = useCallback(
    (message: string, onUndo: () => void, onExpire?: () => void) => open(message, { onUndo, onExpire }),
    [open]
  );

  const notify = useCallback((message: string) => open(message, null), [open]);

  const undo = useCallback(() => {
    const pending = pendingRef.current;
    pendingRef.current = null;
    leave();
    pending?.onUndo?.();
  }, [leave]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dismiss();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(timerRef.current);
      window.clearTimeout(exitTimerRef.current);
    };
  }, [dismiss]);

  const element = toast
    ? createPortal(
        <UndoToast
          key={toast.id}
          message={toast.message}
          canUndo={toast.canUndo}
          leaving={toast.leaving}
          onUndo={undo}
          onClose={dismiss}
          onPause={pause}
          onResume={resume}
        />,
        document.body
      )
    : null;

  return { showUndo, notify, element };
}

interface UndoToastProps {
  message: string;
  canUndo: boolean;
  leaving: boolean;
  onUndo: () => void;
  onClose: () => void;
  onPause: () => void;
  onResume: () => void;
}

function UndoToast({ message, canUndo, leaving, onUndo, onClose, onPause, onResume }: UndoToastProps) {
  const [hasEntered, setHasEntered] = useState(false);

  // Start from the hidden state for one frame so the entrance transition runs.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setHasEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const stateClass = leaving ? " is-leaving" : hasEntered ? " is-visible" : "";

  return (
    <div
      className={`undo-toast${stateClass}`}
      role="status"
      aria-live="polite"
      style={{ "--toast-duration": `${TOAST_DURATION_MS}ms` } as CSSProperties}
      onMouseEnter={onPause}
      onMouseLeave={onResume}
    >
      <div className="undo-toast-copy">
        <span className="undo-toast-icon" aria-hidden="true">
          <Icon name={canUndo ? "refresh-outline" : "checkmark-outline"} />
        </span>
        <span>{message}</span>
      </div>
      {canUndo && (
        <button className="undo-toast-action" type="button" onClick={onUndo}>
          Undo
        </button>
      )}
      <button className="undo-toast-close" type="button" aria-label="Dismiss message" onClick={onClose}>
        <Icon name="close-outline" />
      </button>
      <span className="undo-toast-timer" aria-hidden="true" />
    </div>
  );
}
