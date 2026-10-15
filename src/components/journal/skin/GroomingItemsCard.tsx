"use client";

import { current } from "immer";
import { useState, type FormEvent } from "react";
import { createId } from "@/lib/journal/format";
import type { GroomingItem, RoutineRepeat } from "@/lib/journal/types";
import { Icon } from "../../Icon";
import { useJournal } from "../JournalContext";

const MAX_LABEL_LENGTH = 12;

/** Sidebar card for editing the grooming checklist shown on every day. */
export function GroomingItemsCard() {
  const { data, update, showUndo } = useJournal();
  const [label, setLabel] = useState("");

  const addItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = label.trim().slice(0, MAX_LABEL_LENGTH);
    if (!trimmed || data.groomingItems.some((item) => item.label === trimmed)) {
      setLabel("");
      return;
    }
    update((draft) => {
      draft.groomingItems.push({ id: createId(), label: trimmed });
    });
    setLabel("");
  };

  // Past check marks stay in the data (just hidden), so undo brings them back.
  const removeItem = (itemId: string) => {
    const removed: { item: GroomingItem | null; index: number; repeats: RoutineRepeat[] } = {
      item: null,
      index: -1,
      repeats: [],
    };
    update((draft) => {
      removed.index = draft.groomingItems.findIndex((item) => item.id === itemId);
      if (removed.index < 0) return;
      removed.item = current(draft.groomingItems[removed.index]);
      draft.groomingItems.splice(removed.index, 1);
      removed.repeats = current(draft.routineRepeats).filter(
        (repeat) => repeat.field === "grooming" && repeat.value === itemId
      );
      draft.routineRepeats = draft.routineRepeats.filter(
        (repeat) => !(repeat.field === "grooming" && repeat.value === itemId)
      );
    });

    const { item, index, repeats } = removed;
    if (!item) return;
    showUndo(`'${item.label}' 항목을 삭제했어요.`, () =>
      update((draft) => {
        if (!draft.groomingItems.some((entry) => entry.id === item.id)) {
          draft.groomingItems.splice(Math.min(index, draft.groomingItems.length), 0, item);
          draft.routineRepeats.push(...repeats);
        }
      })
    );
  };

  return (
    <section className="card info-card grooming-items-card">
      <p className="section-kicker">
        <Icon name="cut-outline" />
        <span>Grooming</span>
      </p>
      <h2>그루밍 항목</h2>
      <p className="mini-copy">타임라인의 그루밍 칸에 보이는 체크 항목이에요.</p>
      <ul className="grooming-items-list">
        {data.groomingItems.map((item) => (
          <li key={item.id}>
            <span>{item.label}</span>
            <button type="button" aria-label={`${item.label} 삭제`} onClick={() => removeItem(item.id)}>
              <Icon name="close-outline" />
            </button>
          </li>
        ))}
      </ul>
      <form className="grooming-items-form" onSubmit={addItem}>
        <input
          type="text"
          value={label}
          maxLength={MAX_LABEL_LENGTH}
          placeholder="예: 눈썹 정리"
          aria-label="새 그루밍 항목"
          onChange={(event) => setLabel(event.target.value)}
        />
        <button className="button button-secondary" type="submit">
          <Icon name="add-outline" />
          <span>추가</span>
        </button>
      </form>
    </section>
  );
}
