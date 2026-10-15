"use client";

import { Fragment } from "react";
import { MOOD_OPTIONS, ROUTINE_FIELDS } from "@/lib/journal/constants";
import { addDays, formatDateLabel, getTodayDateKey, getWeekStartDateKey, getWeekdayLabel } from "@/lib/journal/dates";
import {
  createEmptyEntry,
  extendTimelineTo,
  getEntryFilledCount,
  getRoutineParts,
  getTodayIndex,
  stripRoutineAccentMarkers,
} from "@/lib/journal/timeline";
import { getRepeatedCellKeys } from "@/lib/journal/repeats";
import type { Mood, RoutineEntry } from "@/lib/journal/types";
import { Icon } from "../../Icon";
import { useJournal } from "../JournalContext";
import { GroomingChips } from "./GroomingChips";
import { MobileRoutineEditor, RoutineCell } from "./RoutineCell";
import { RepeatPanel } from "./RepeatPanel";
import { RoutineMenusProvider } from "./RoutineMenus";
import { SkinSidebar } from "./SkinSidebar";
import { StreakCard } from "./StreakCard";
import { VideoShelf } from "./VideoShelf";

export interface RoutineViewState {
  weekStart: number;
  openDay: number | null;
  editDay: number | null;
}

interface RoutineSectionProps {
  viewState: RoutineViewState;
  onViewStateChange: (next: RoutineViewState) => void;
}

function getMoodMeta(mood: string) {
  return MOOD_OPTIONS.find((option) => option.value === mood) ?? null;
}

export function RoutineSection({ viewState, onViewStateChange }: RoutineSectionProps) {
  const { data, update } = useJournal();
  const timeline = data.skinTimeline;
  const { weekStart } = viewState;
  const visible = timeline.slice(weekStart, weekStart + 7).map((entry, offset) => ({
    entry,
    index: weekStart + offset,
  }));

  const showPreviousWeek = () => {
    const currentStart = timeline[weekStart]?.date ?? getWeekStartDateKey();
    const previousMonday = addDays(currentStart, -7);
    const foundIndex = timeline.findIndex((entry) => entry.date === previousMonday);
    onViewStateChange({ ...viewState, weekStart: Math.max(foundIndex, 0), editDay: null });
  };

  const showNextWeek = () => {
    const currentStart = timeline[weekStart]?.date ?? getWeekStartDateKey();
    const nextMonday = addDays(currentStart, 7);
    const next = update((draft) => extendTimelineTo(draft.skinTimeline, addDays(nextMonday, 6)));
    const foundIndex = next.skinTimeline.findIndex((entry) => entry.date === nextMonday);
    onViewStateChange({ ...viewState, weekStart: foundIndex >= 0 ? foundIndex : weekStart, editDay: null });
  };

  const repeatedCells = getRepeatedCellKeys(data);
  const firstDate = visible[0]?.entry.date;
  const lastDate = visible[visible.length - 1]?.entry.date;

  return (
    <RoutineMenusProvider>
      <section className="journal-area">
        <div className="section-header">
          <div>
            <p className="section-label">
              <Icon name="calendar-clear-outline" />
              <span>Timeline</span>
            </p>
            <h2>Routine timeline</h2>
            <p className="section-note">실제 날짜 기준으로 이어지고, 더블클릭하면 해당 칸만 수정할 수 있어요.</p>
          </div>
          <div className="week-nav" aria-label="Week navigation">
            <button
              className="button button-secondary week-nav-button"
              type="button"
              aria-label="Previous week"
              disabled={weekStart === 0}
              onClick={showPreviousWeek}
            >
              <Icon name="chevron-back-outline" />
            </button>
            <p className="week-range-label">
              {firstDate && lastDate ? `${formatDateLabel(firstDate)} - ${formatDateLabel(lastDate)}` : ""}
            </p>
            <button className="button button-secondary week-nav-button" type="button" aria-label="Next week" onClick={showNextWeek}>
              <Icon name="chevron-forward-outline" />
            </button>
          </div>
        </div>

        <JournalSummary visibleEntries={visible.map((item) => item.entry)} />

        <div className="table-card card">
          <div className="table-wrap">
            <table className="routine-table">
              <colgroup>
                <col className="col-done" />
                <col className="col-day" />
                <col className="col-morning" />
                <col className="col-face" />
                <col className="col-evening" />
                <col className="col-skincare" />
                <col className="col-grooming" />
                <col className="col-notes" />
              </colgroup>
              <thead>
                <tr>
                  <th>Done</th>
                  <th>Date</th>
                  <th>Morning routine</th>
                  <th>Face routine</th>
                  <th>Evening cleanse</th>
                  <th>Afternoon/Evening skincare</th>
                  <th>Grooming</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(({ entry, index }) => (
                  <RoutineTableRow key={entry.date} entry={entry} index={index} repeatedCells={repeatedCells} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mobile-cards">
          {visible.map(({ entry, index }) => (
            <RoutineMobileCard
              key={entry.date}
              repeatedCells={repeatedCells}
              entry={entry}
              index={index}
              isOpen={viewState.openDay === index}
              isEditing={viewState.editDay === index}
              onToggleOpen={() => {
                const openDay = viewState.openDay === index ? null : index;
                onViewStateChange({
                  ...viewState,
                  openDay,
                  editDay: openDay !== index && viewState.editDay === index ? null : viewState.editDay,
                });
              }}
              onToggleEdit={() =>
                onViewStateChange({
                  ...viewState,
                  openDay: index,
                  editDay: viewState.editDay === index ? null : index,
                })
              }
            />
          ))}
        </div>

        <RepeatPanel />

        <VideoShelf />
      </section>

      <SkinSidebar />
    </RoutineMenusProvider>
  );
}

function JournalSummary({ visibleEntries }: { visibleEntries: RoutineEntry[] }) {
  const { data, update } = useJournal();
  const todayIndex = getTodayIndex(data.skinTimeline);
  const today = data.skinTimeline[todayIndex] ?? createEmptyEntry(getTodayDateKey());
  const doneCount = visibleEntries.filter((entry) => entry.done).length;
  const moodMeta = getMoodMeta(today.mood);

  const toggleMood = (mood: Mood) =>
    update((draft) => {
      const entry = draft.skinTimeline[todayIndex];
      entry.mood = entry.mood === mood ? "" : mood;
    });

  return (
    <section className="journal-summary card">
      <div className="summary-overview">
        <div className="summary-copy">
          <p className="summary-kicker">Today Journal</p>
          <h3>
            {formatDateLabel(today.date)} · {getWeekdayLabel(today.date)}요일
          </h3>
          <p className="summary-text">
            {moodMeta ? `${moodMeta.label} mood selected.` : "오늘 피부 컨디션을 골라두면 기록이 더 쉬워져요."}
          </p>
        </div>
        <StreakCard timeline={data.skinTimeline} weekEntries={visibleEntries} />
      </div>
      <div className="summary-meta">
        <span>
          <strong>
            {doneCount}/{visibleEntries.length}
          </strong>{" "}
          done this week
        </span>
        <span>
          <strong>{getEntryFilledCount(today)}/{ROUTINE_FIELDS.length}</strong> filled today
        </span>
      </div>
      <div className="mood-picker">
        {MOOD_OPTIONS.map((option) => (
          <button
            key={option.value}
            className={`mood-chip${today.mood === option.value ? " is-active" : ""}`}
            type="button"
            aria-pressed={today.mood === option.value}
            onClick={() => toggleMood(option.value)}
          >
            <Icon name={option.icon} />
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function DoneCheckbox({ entry, index }: { entry: RoutineEntry; index: number }) {
  const { update } = useJournal();
  return (
    <input
      type="checkbox"
      className="done-checkbox"
      checked={entry.done}
      aria-label={`${entry.date} 완료 체크`}
      onChange={(event) => {
        const done = event.target.checked;
        update((draft) => {
          draft.skinTimeline[index].done = done;
        });
      }}
    />
  );
}

function RoutineTableRow({
  entry,
  index,
  repeatedCells,
}: {
  entry: RoutineEntry;
  index: number;
  repeatedCells: Set<string>;
}) {
  const isToday = entry.date === getTodayDateKey();
  const moodMeta = getMoodMeta(entry.mood);

  return (
    <tr className={isToday ? "today-row" : undefined}>
      <td className="checkbox-wrap">
        <DoneCheckbox entry={entry} index={index} />
      </td>
      <td>
        <div className="day-chip">
          <span>{formatDateLabel(entry.date)}</span>
          {isToday && <span className="today-badge">Today</span>}
        </div>
        <div className="day-sub">{getWeekdayLabel(entry.date)}요일</div>
        {moodMeta && (
          <div className="table-mood">
            <Icon name={moodMeta.icon} />
            <span>{moodMeta.label}</span>
          </div>
        )}
      </td>
      {ROUTINE_FIELDS.map(({ field }) => (
        <Fragment key={field}>
          {/* Grooming sits between extra care and notes. */}
          {field === "notes" && (
            <td>
              <GroomingChips entry={entry} index={index} repeatedCells={repeatedCells} />
            </td>
          )}
          <td>
            <RoutineCell
              index={index}
              field={field}
              value={entry[field]}
              date={entry.date}
              isRepeated={repeatedCells.has(`${entry.date}|${field}`)}
            />
          </td>
        </Fragment>
      ))}
    </tr>
  );
}

interface RoutineMobileCardProps {
  entry: RoutineEntry;
  repeatedCells: Set<string>;
  index: number;
  isOpen: boolean;
  isEditing: boolean;
  onToggleOpen: () => void;
  onToggleEdit: () => void;
}

function RoutineMobileCard({
  entry,
  repeatedCells,
  index,
  isOpen,
  isEditing,
  onToggleOpen,
  onToggleEdit,
}: RoutineMobileCardProps) {
  const { groomingItems } = useJournal().data;
  const isToday = entry.date === getTodayDateKey();
  const moodMeta = getMoodMeta(entry.mood);
  const skincareSummary = entry.skincare.trim()
    ? stripRoutineAccentMarkers(getRoutineParts(entry.skincare)[0] ?? "") || "루틴 비어 있음"
    : "루틴 비어 있음";
  const groomingSummary =
    groomingItems
      .filter((item) => entry.grooming.includes(item.id))
      .map((item) => item.label)
      .join(" · ") || "그루밍 없음";

  return (
    <article className={`routine-mobile-card card${isOpen ? " is-open" : ""}${isEditing ? " is-editing" : ""}`}>
      <div className="mobile-card-head">
        <label className="mobile-done-toggle" aria-label={`${entry.date} 완료 체크`}>
          <span>Done</span>
          <DoneCheckbox entry={entry} index={index} />
        </label>
        <div className="mobile-card-main">
          <div className="mobile-day-wrap">
            <div className={`mobile-day${isToday ? " today-label" : ""}`}>{formatDateLabel(entry.date)}</div>
            <div className="mobile-weekday">{getWeekdayLabel(entry.date)}요일</div>
            {isToday && <span className="today-badge mobile-today-badge">Today</span>}
          </div>
          {moodMeta && (
            <div className="mobile-mood">
              <Icon name={moodMeta.icon} />
              <span>{moodMeta.label}</span>
            </div>
          )}
          <div className="mobile-card-summary">
            <span>{skincareSummary}</span>
            <span className="mobile-summary-dot" />
            <span>{groomingSummary}</span>
          </div>
        </div>
        <div className="mobile-card-actions">
          <button className="mobile-icon-button mobile-edit-button" type="button" aria-label={`Edit ${entry.date}`} onClick={onToggleEdit}>
            <Icon name={isEditing ? "checkmark-outline" : "create-outline"} />
          </button>
          <button
            className="mobile-icon-button mobile-expand-button"
            type="button"
            aria-expanded={isOpen}
            aria-label={`${entry.date} details`}
            onClick={onToggleOpen}
          >
            <Icon name={isOpen ? "chevron-up-outline" : "chevron-down-outline"} />
          </button>
        </div>
      </div>
      <div className="mobile-card-body" hidden={!isOpen}>
        {ROUTINE_FIELDS.map(({ field, label, icon }) => (
          <Fragment key={field}>
            {field === "notes" && (
              <section className="mobile-field">
                <div className="mobile-field-head">
                  <span className="mobile-field-label">
                    <Icon name="cut-outline" />
                    <span>Grooming</span>
                  </span>
                </div>
                <GroomingChips entry={entry} index={index} repeatedCells={repeatedCells} />
              </section>
            )}
            <section className="mobile-field">
              <div className="mobile-field-head">
                <span className="mobile-field-label">
                  <Icon name={icon} />
                  <span>{label}</span>
                </span>
              </div>
              {isEditing ? (
                <MobileRoutineEditor index={index} field={field} value={entry[field]} />
              ) : (
                <RoutineCell
                  index={index}
                  field={field}
                  value={entry[field]}
                  date={entry.date}
                  isRepeated={repeatedCells.has(`${entry.date}|${field}`)}
                />
              )}
            </section>
          </Fragment>
        ))}
      </div>
    </article>
  );
}
