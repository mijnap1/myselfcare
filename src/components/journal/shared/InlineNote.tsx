"use client";

import { useState } from "react";

interface InlineNoteProps {
  value: string;
  onSave: (note: string) => void;
  className: string;
}

/**
 * A card's memo, editable in place: tap it to write, and it saves when you
 * leave the field (Esc cancels). No form or save button needed.
 */
export function InlineNote({ value, onSave, className }: InlineNoteProps) {
  const [draft, setDraft] = useState<string | null>(null);

  if (draft === null) {
    return (
      <button
        type="button"
        className={`${className} inline-note${value ? "" : " is-muted"}`}
        onClick={() => setDraft(value)}
        title="눌러서 메모 쓰기"
      >
        {value || "메모 추가"}
      </button>
    );
  }

  const commit = () => {
    const next = draft.trim();
    if (next !== value) {
      onSave(next);
    }
    setDraft(null);
  };

  return (
    <textarea
      className={`${className} inline-note-editor`}
      value={draft}
      autoFocus
      rows={Math.min(Math.max(draft.split("\n").length, 2), 6)}
      placeholder="메모를 적어주세요"
      aria-label="메모"
      onFocus={(event) => {
        // Continue writing after what's there.
        const end = event.currentTarget.value.length;
        event.currentTarget.setSelectionRange(end, end);
      }}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setDraft(null);
        } else if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
          event.currentTarget.blur();
        }
      }}
    />
  );
}
