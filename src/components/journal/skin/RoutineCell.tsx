"use client";

import { useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { getRoutineParts } from "@/lib/journal/timeline";
import type { RoutineField } from "@/lib/journal/types";
import { Icon } from "../../Icon";
import { useJournal } from "../JournalContext";
import { useLongPress, useRoutineMenus, type CellTarget } from "./RoutineMenus";

const EMPHASIS_PATTERN = /레티놀|비타민C|클레이|마스크팩|에스트라|선크림|나이아신아마이드/;

/** Renders `==text==` segments as highlighted spans. */
export function AccentedText({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/(==[^=]+==)/g)
        .filter(Boolean)
        .map((chunk, index) =>
          chunk.startsWith("==") && chunk.endsWith("==") ? (
            <span key={index} className="routine-accent">
              {chunk.slice(2, -2)}
            </span>
          ) : (
            chunk
          )
        )}
    </>
  );
}

/** Cmd/Ctrl+B wraps the selection in `==…==` (or unwraps it). */
function toggleAccent(textarea: HTMLTextAreaElement) {
  const { selectionStart, selectionEnd, value } = textarea;
  const selected = value.slice(selectionStart, selectionEnd);
  const before = value.slice(0, selectionStart);
  const after = value.slice(selectionEnd);

  if (before.endsWith("==") && after.startsWith("==")) {
    return { value: `${before.slice(0, -2)}${selected}${after.slice(2)}`, start: selectionStart - 2, end: selectionEnd - 2 };
  }
  if (selected) {
    return { value: `${before}==${selected}==${after}`, start: selectionStart + 2, end: selectionEnd + 2 };
  }
  return { value: `${before}====${after}`, start: selectionStart + 2, end: selectionStart + 2 };
}

function useFieldUpdater(index: number, field: RoutineField) {
  const { update } = useJournal();
  return (value: string) =>
    update((draft) => {
      draft.skinTimeline[index][field] = value.trim();
    });
}

interface RoutineTextareaProps {
  initialValue: string;
  className: string;
  index: number;
  field: RoutineField;
  autoFocus?: boolean;
  /** Called with every change (mobile editor saves as you type). */
  onValueChange?: (value: string) => void;
  onBlur?: (value: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>, value: string) => void;
}

function RoutineTextarea({
  initialValue,
  className,
  index,
  field,
  autoFocus,
  onValueChange,
  onBlur,
  onKeyDown,
}: RoutineTextareaProps) {
  const { openContextMenu } = useRoutineMenus();
  const saveField = useFieldUpdater(index, field);
  const [value, setValue] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingSelection = useRef<[number, number] | null>(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (autoFocus && textarea) {
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }
  }, [autoFocus]);

  useLayoutEffect(() => {
    if (pendingSelection.current && textareaRef.current) {
      textareaRef.current.setSelectionRange(...pendingSelection.current);
      pendingSelection.current = null;
    }
  }, [value]);

  const changeValue = (next: string) => {
    setValue(next);
    onValueChange?.(next);
  };

  const target: CellTarget = {
    getText: () => value,
    setText: (text) => {
      setValue(text);
      saveField(text);
      textareaRef.current?.focus();
    },
  };
  const longPress = useLongPress((x, y) => openContextMenu(x, y, target));

  return (
    <textarea
      ref={textareaRef}
      className={className}
      value={value}
      onChange={(event) => changeValue(event.target.value)}
      onBlur={() => onBlur?.(value)}
      onContextMenu={(event) => {
        event.preventDefault();
        openContextMenu(event.clientX, event.clientY, target);
      }}
      {...longPress}
      onKeyDown={(event) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b") {
          event.preventDefault();
          const next = toggleAccent(event.currentTarget);
          pendingSelection.current = [next.start, next.end];
          changeValue(next.value);
          return;
        }
        onKeyDown?.(event, value);
      }}
    />
  );
}

interface RoutineCellProps {
  index: number;
  field: RoutineField;
  value: string;
  date: string;
  /** Part of a repeat; the repeat button is highlighted and opens removal options. */
  isRepeated?: boolean;
}

/** Read-only routine/notes display that turns into an editor on double-click. */
export function RoutineCell({ index, field, value, date, isRepeated = false }: RoutineCellProps) {
  const { openContextMenu, openRepeatMenu } = useRoutineMenus();
  const saveField = useFieldUpdater(index, field);
  const [isEditing, setIsEditing] = useState(false);
  const finishedRef = useRef(false);
  const isNotes = field === "notes";

  const target: CellTarget = { getText: () => value, setText: saveField };
  const longPress = useLongPress((x, y) => openContextMenu(x, y, target));

  const startEditing = () => {
    finishedRef.current = false;
    setIsEditing(true);
  };

  const finishEditing = (nextValue: string | null) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (nextValue !== null) {
      saveField(nextValue);
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <RoutineTextarea
        initialValue={value}
        className={isNotes ? "note-input" : "editable-cell"}
        index={index}
        field={field}
        autoFocus
        onBlur={(current) => finishEditing(current)}
        onKeyDown={(event, current) => {
          if (event.key === "Escape") {
            event.preventDefault();
            finishEditing(null);
          } else if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            finishEditing(current);
          }
        }}
      />
    );
  }

  const isEmpty = !value.trim();

  return (
    <div
      className={`cell-display is-editable${isNotes ? " note-display" : ""}${!isNotes && !isEmpty ? " has-repeat" : ""}${isRepeated ? " is-repeated" : ""}`}
      tabIndex={0}
      role="button"
      aria-label={`${date} ${field} ${isNotes ? "노트" : "루틴"} 더블클릭 편집`}
      onDoubleClick={startEditing}
      onKeyDown={(event) => {
        if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          startEditing();
        }
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        openContextMenu(event.clientX, event.clientY, target);
      }}
      {...longPress}
    >
      {isNotes ? (
        <div className={`note-text${isEmpty ? " cell-placeholder" : ""}`}>
          {isEmpty ? "메모를 남겨보세요." : <AccentedText text={value} />}
        </div>
      ) : isEmpty ? (
        <span className="cell-placeholder">더블클릭해서 루틴을 입력하세요.</span>
      ) : (
        <>
          <div className="routine-steps">
            {getRoutineParts(value).map((part, partIndex) => (
              <span key={partIndex} className={`routine-step${EMPHASIS_PATTERN.test(part) ? " is-emphasis" : ""}`}>
                <AccentedText text={part} />
              </span>
            ))}
          </div>
          <button
            type="button"
            className="cell-repeat-button"
            aria-label={`${date} ${field} ${isRepeated ? "repeat options" : "repeat"}`}
            title={isRepeated ? "반복된 루틴 · 클릭해서 관리" : "반복하기"}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              openRepeatMenu(event.currentTarget, index, field);
            }}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <Icon name="repeat-outline" />
          </button>
        </>
      )}
    </div>
  );
}

/** Always-on editor used by the mobile card's edit mode; saves as you type. */
export function MobileRoutineEditor({ index, field, value }: Omit<RoutineCellProps, "date" | "isRepeated">) {
  const saveField = useFieldUpdater(index, field);
  return (
    <RoutineTextarea
      initialValue={value}
      className={field === "notes" ? "mobile-textarea note" : "mobile-textarea"}
      index={index}
      field={field}
      onValueChange={saveField}
    />
  );
}
