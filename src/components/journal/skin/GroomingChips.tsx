"use client";

import { repeatCellKey } from "@/lib/journal/repeats";
import type { RoutineEntry } from "@/lib/journal/types";
import { Icon } from "../../Icon";
import { useJournal } from "../JournalContext";
import { useRoutineMenus } from "./RoutineMenus";

interface GroomingChipsProps {
  entry: RoutineEntry;
  index: number;
  repeatedCells: Set<string>;
}

/** One day's grooming checklist: tap a chip to switch it on or off. */
export function GroomingChips({ entry, index, repeatedCells }: GroomingChipsProps) {
  const { data, update } = useJournal();
  const { openRepeatMenu } = useRoutineMenus();
  const items = data.groomingItems;

  if (!items.length) {
    return <span className="cell-placeholder">사이드바에서 그루밍 항목을 추가하세요.</span>;
  }

  const toggle = (itemId: string) =>
    update((draft) => {
      const target = draft.skinTimeline[index];
      target.grooming = target.grooming.includes(itemId)
        ? target.grooming.filter((id) => id !== itemId)
        : [...target.grooming, itemId];
    });

  return (
    <div className="grooming-chips" role="group" aria-label={`${entry.date} grooming`}>
      {items.map((item) => {
        const isOn = entry.grooming.includes(item.id);
        const isRepeated = repeatedCells.has(repeatCellKey(entry.date, "grooming", item.id));
        return (
          <span
            key={item.id}
            className={`grooming-chip${isOn ? " is-on" : ""}${isRepeated ? " is-repeated" : ""}`}
          >
            <button
              className="grooming-chip-toggle"
              type="button"
              aria-pressed={isOn}
              onClick={() => toggle(item.id)}
            >
              {isOn && <Icon name="checkmark-outline" />}
              <span>{item.label}</span>
            </button>
            {isOn && (
              <button
                className="grooming-chip-repeat"
                type="button"
                aria-label={`${entry.date} ${item.label} ${isRepeated ? "repeat options" : "repeat"}`}
                title={isRepeated ? "반복 중 · 클릭해서 관리" : "반복하기"}
                onClick={(event) =>
                  openRepeatMenu(event.currentTarget, index, "grooming", item.id)
                }
                onPointerDown={(event) => event.stopPropagation()}
              >
                <Icon name="repeat-outline" />
              </button>
            )}
          </span>
        );
      })}
    </div>
  );
}
