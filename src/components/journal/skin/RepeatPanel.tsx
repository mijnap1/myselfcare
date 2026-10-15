"use client";

import { ROUTINE_FIELDS } from "@/lib/journal/constants";
import { formatDateLabel } from "@/lib/journal/dates";
import { describeInterval, getLiveRepeatDates } from "@/lib/journal/repeats";
import { getRoutineParts, stripRoutineAccentMarkers } from "@/lib/journal/timeline";
import { Icon } from "../../Icon";
import { useJournal } from "../JournalContext";
import { useRemoveRoutineRepeat } from "./useRemoveRoutineRepeat";

/** Lists active repeats so they can be removed long after the undo toast is gone. */
export function RepeatPanel() {
  const { data } = useJournal();
  const removeRoutineRepeat = useRemoveRoutineRepeat();

  const repeats = data.routineRepeats
    .map((repeat) => {
      // Only the copies count; the source cell is the user's own entry.
      const copies = getLiveRepeatDates(repeat, data.skinTimeline).filter((date) => date !== repeat.sourceDate);
      return { repeat, copies };
    })
    .filter(({ copies }) => copies.length > 0)
    .reverse();

  if (!repeats.length) {
    return null;
  }

  return (
    <section className="repeat-panel card">
      <div className="repeat-panel-head">
        <p className="section-kicker">
          <Icon name="repeat-outline" />
          <span>Repeats</span>
        </p>
        <h2>반복 루틴</h2>
        <p className="section-note">
          반복으로 채운 칸들이에요. 삭제하면 직접 수정하지 않은 칸만 비워져요.
        </p>
      </div>
      <ul className="repeat-panel-list">
        {repeats.map(({ repeat, copies }) => {
          const groomingLabel =
            repeat.field === "grooming"
              ? (data.groomingItems.find((item) => item.id === repeat.value)?.label ?? "삭제된 항목")
              : "";
          const fieldLabel =
            repeat.field === "grooming"
              ? "Grooming"
              : (ROUTINE_FIELDS.find((item) => item.field === repeat.field)?.label ?? repeat.field);
          return (
            <li key={repeat.id} className="repeat-panel-item">
              <div className="repeat-panel-copy">
                <p className="repeat-panel-meta">
                  <span className="repeat-panel-badge">{describeInterval(repeat.intervalDays)}</span>
                  <span>{fieldLabel}</span>
                </p>
                <p className="repeat-panel-value">
                  {groomingLabel || getRoutineParts(stripRoutineAccentMarkers(repeat.value)).join(" → ")}
                </p>
                <p className="repeat-panel-range">
                  {formatDateLabel(repeat.sourceDate)}부터 · {formatDateLabel(copies[copies.length - 1])}까지 ·{" "}
                  {copies.length}개 날짜
                </p>
              </div>
              <button
                className="button button-secondary repeat-panel-remove"
                type="button"
                onClick={() => removeRoutineRepeat(repeat.id)}
              >
                <Icon name="trash-outline" />
                <span>삭제</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
