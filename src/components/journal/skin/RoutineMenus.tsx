"use client";

import { createContext, use, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { formatDateLabel } from "@/lib/journal/dates";
import { applyRepeat, describeInterval, findRepeatForCell, getLiveRepeatDates, removeRepeat } from "@/lib/journal/repeats";
import type { RepeatField, RoutineRepeat } from "@/lib/journal/types";
import { Icon } from "../../Icon";
import { useJournal } from "../JournalContext";
import { useRemoveRoutineRepeat } from "./useRemoveRoutineRepeat";

/** What the copy / paste / clear menu acts on. */
export interface CellTarget {
  getText: () => string;
  setText: (text: string) => void;
}

interface RoutineMenusValue {
  openContextMenu: (x: number, y: number, target: CellTarget) => void;
  /** For grooming, `groomingId` is the chip being repeated. */
  openRepeatMenu: (anchor: HTMLElement, index: number, field: RepeatField, groomingId?: string) => void;
}

const RoutineMenusContext = createContext<RoutineMenusValue | null>(null);

export function useRoutineMenus(): RoutineMenusValue {
  const value = use(RoutineMenusContext);
  if (!value) {
    throw new Error("useRoutineMenus must be used inside RoutineMenusProvider");
  }
  return value;
}

let fallbackClipboard = "";
const MENU_GAP = 8;

/** Bottom of the usable viewport: above the floating nav when it's showing. */
function getUsableBottom(): number {
  const navOffset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--view-nav-offset")) || 0;
  return window.innerHeight - navOffset - MENU_GAP;
}

async function writeClipboardText(text: string) {
  fallbackClipboard = text;
  try {
    await navigator.clipboard?.writeText(text);
  } catch {
    // Keep the in-page fallback clipboard.
  }
}

async function readClipboardText(): Promise<string> {
  try {
    const text = await navigator.clipboard?.readText();
    if (typeof text === "string") {
      fallbackClipboard = text;
      return text;
    }
  } catch {
    // Clipboard permission denied; use the in-page fallback.
  }
  return fallbackClipboard;
}

export function RoutineMenusProvider({ children }: { children: ReactNode }) {
  const { data, update, showUndo, notify } = useJournal();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; target: CellTarget } | null>(null);
  const [repeatMenu, setRepeatMenu] = useState<{
    /** The repeat button it opened from; the menu follows it while scrolling. */
    anchor: HTMLElement;
    index: number;
    field: RepeatField;
    groomingId?: string;
  } | null>(null);
  const [customDays, setCustomDays] = useState("10");
  const removeRoutineRepeat = useRemoveRoutineRepeat();
  const repeatMenuRef = useRef<HTMLDivElement>(null);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  useEffect(() => {
    if (!contextMenu) {
      return;
    }
    const handleClick = (event: MouseEvent) => {
      if (!(event.target as Element).closest(".cell-context-menu")) {
        closeContextMenu();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeContextMenu();
    };
    document.addEventListener("click", handleClick);
    document.addEventListener("scroll", closeContextMenu, true);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("scroll", closeContextMenu, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeContextMenu, contextMenu]);

  useEffect(() => {
    if (!repeatMenu) {
      return;
    }
    const handlePointerDown = (event: PointerEvent) => {
      if (!repeatMenuRef.current?.contains(event.target as Node)) {
        setRepeatMenu(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setRepeatMenu(null);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [repeatMenu]);

  // Keep the repeat menu attached to its button: below it when there's room,
  // above it when the nav would cover it, closed once the button scrolls away.
  useLayoutEffect(() => {
    const menu = repeatMenuRef.current;
    const anchor = repeatMenu?.anchor;
    if (!menu || !anchor) {
      return;
    }

    const place = () => {
      const rect = anchor.getBoundingClientRect();
      const usableBottom = getUsableBottom();
      if (!anchor.isConnected || rect.bottom < 0 || rect.top > usableBottom) {
        setRepeatMenu(null);
        return;
      }

      const { offsetWidth: width, offsetHeight: height } = menu;
      const below = rect.bottom + MENU_GAP;
      const above = rect.top - MENU_GAP - height;
      const fitsBelow = below + height <= usableBottom;
      const top = fitsBelow ? below : above >= MENU_GAP ? above : Math.max(MENU_GAP, usableBottom - height);
      const left = Math.max(MENU_GAP, Math.min(rect.left, window.innerWidth - width - MENU_GAP));

      menu.style.top = `${Math.round(top)}px`;
      menu.style.left = `${Math.round(left)}px`;
      menu.dataset.placement = fitsBelow ? "below" : "above";
    };
    // Scroll events already fire at most once per frame, so no extra throttling.
    place();
    document.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      document.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [repeatMenu]);

  const startRepeat = (days: number) => {
    if (!repeatMenu) {
      return;
    }
    const { index, field, groomingId } = repeatMenu;
    setRepeatMenu(null);

    if (!Number.isInteger(days) || days < 1 || days > 60) {
      notify("반복 간격은 1-60일 사이로 입력해 주세요.");
      return;
    }

    const result: { repeat: RoutineRepeat | null } = { repeat: null };
    update((draft) => {
      result.repeat = applyRepeat(draft, index, field, days, groomingId);
    });

    const { repeat } = result;
    if (!repeat) {
      notify("비어 있는 반복 날짜가 없어요.");
      return;
    }
    showUndo(`${describeInterval(days)} 반복을 ${repeat.dates.length}개 날짜에 적용했어요.`, () =>
      update((draft) => {
        removeRepeat(draft, repeat.id);
      })
    );
  };

  const repeatTarget = repeatMenu ? data.skinTimeline[repeatMenu.index] : undefined;
  const activeRepeat =
    repeatMenu && repeatTarget
      ? findRepeatForCell(data, repeatTarget.date, repeatMenu.field, repeatMenu.groomingId)
      : null;

  const removeFromMenu = (fromDate?: string) => {
    if (!activeRepeat) return;
    setRepeatMenu(null);
    removeRoutineRepeat(activeRepeat.id, fromDate);
  };

  const runContextAction = async (action: "copy" | "paste" | "clear") => {
    if (!contextMenu) return;
    const { target } = contextMenu;
    closeContextMenu();
    if (action === "copy") {
      await writeClipboardText(target.getText());
    } else if (action === "paste") {
      target.setText((await readClipboardText()).trim());
    } else {
      target.setText("");
    }
  };

  const value = useMemo<RoutineMenusValue>(
    () => ({
      openContextMenu: (x, y, target) =>
        setContextMenu({
          x: Math.min(x, window.innerWidth - 188),
          y: Math.max(MENU_GAP, Math.min(y, getUsableBottom() - 148)),
          target,
        }),
      openRepeatMenu: (anchor, index, field, groomingId) =>
        setRepeatMenu({
          anchor,
          index,
          field,
          groomingId,
        }),
    }),
    []
  );

  return (
    <RoutineMenusContext value={value}>
      {children}

      {/* Popovers live on <body> so animated page sections can't offset them. */}
      {createPortal(
        <>
          <div
            className="cell-context-menu"
            hidden={!contextMenu}
            style={contextMenu ? { left: contextMenu.x, top: contextMenu.y } : undefined}
          >
            {(
              [
                ["copy", "copy-outline", "Copy"],
                ["paste", "clipboard-outline", "Paste"],
                ["clear", "close-outline", "Clear"],
              ] as const
            ).map(([action, icon, label]) => (
              <button key={action} className="context-menu-item" type="button" onClick={() => runContextAction(action)}>
                <Icon name={icon} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div
            ref={repeatMenuRef}
            className="routine-repeat-menu"
            hidden={!repeatMenu}
          >
            {activeRepeat && repeatTarget && (
              <div className="routine-repeat-current">
                <p className="routine-repeat-current-label">
                  <Icon name="repeat-outline" />
                  <span>
                    {describeInterval(activeRepeat.intervalDays)} 반복 중 ·{" "}
                    {getLiveRepeatDates(activeRepeat, data.skinTimeline).length}일
                  </span>
                </p>
                {repeatTarget.date > activeRepeat.sourceDate && (
                  <button type="button" onClick={() => removeFromMenu(repeatTarget.date)}>
                    {formatDateLabel(repeatTarget.date)}부터 반복 중단
                  </button>
                )}
                <button type="button" className="is-danger" onClick={() => removeFromMenu()}>
                  반복 전체 삭제
                </button>
              </div>
            )}
            <p className="routine-repeat-section-label">{activeRepeat ? "새로 반복하기" : "반복하기"}</p>
            <button type="button" onClick={() => startRepeat(1)}>
              Daily
            </button>
            <button type="button" onClick={() => startRepeat(3)}>
              Every 3 days
            </button>
            <button type="button" onClick={() => startRepeat(7)}>
              Weekly
            </button>
            <button type="button" onClick={() => startRepeat(14)}>
              Every 2 weeks
            </button>
            <div className="routine-repeat-custom">
              <span>Custom</span>
              <input
                type="number"
                min={1}
                max={60}
                inputMode="numeric"
                aria-label="Custom repeat days"
                value={customDays}
                onChange={(event) => setCustomDays(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    startRepeat(Number(customDays));
                  }
                }}
              />
              <button type="button" onClick={() => startRepeat(Number(customDays))}>
                Apply
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </RoutineMenusContext>
  );
}

/** Long-press (420ms) opens the context menu on touch devices. */
export function useLongPress(onLongPress: (x: number, y: number) => void) {
  const timerRef = useRef<number | undefined>(undefined);
  const cancel = () => window.clearTimeout(timerRef.current);

  return {
    onTouchStart: (event: React.TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      const { clientX, clientY } = touch;
      timerRef.current = window.setTimeout(() => onLongPress(clientX, clientY), 420);
    },
    onTouchEnd: cancel,
    onTouchMove: cancel,
    onTouchCancel: cancel,
  };
}
