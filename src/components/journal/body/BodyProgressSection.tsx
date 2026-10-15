"use client";

import { useRef, useState, type FormEvent } from "react";
import { SegmentIndicator } from "@/components/SegmentIndicator";
import { getTodayDateKey, getWeekdayLabel } from "@/lib/journal/dates";
import { normalizeDecimalInput } from "@/lib/journal/format";
import type { BodyProgress, Sex } from "@/lib/journal/types";
import { Icon } from "../../Icon";
import { useJournal } from "../JournalContext";
import { BodyCalendar } from "./BodyCalendar";
import { WeightChart } from "./WeightChart";

type ProfileField = "heightCm" | "age" | "targetWeightKg";

function getWeightChange(body: BodyProgress): string {
  const [latest, previous] = body.entries;
  if (!latest || !previous) return "";
  const diff = Number(latest.weightKg) - Number(previous.weightKg);
  if (Number.isNaN(diff)) return "";
  return `${diff > 0 ? "+" : ""}${diff.toFixed(1)} kg`;
}

function getBmi(body: BodyProgress): string {
  const latest = body.entries[0];
  const heightCm = Number(body.heightCm);
  const weightKg = Number(latest?.weightKg);
  if (!latest || Number.isNaN(heightCm) || Number.isNaN(weightKg) || heightCm <= 0) return "";
  const heightM = heightCm / 100;
  return (weightKg / (heightM * heightM)).toFixed(1);
}

export function BodyProgressSection() {
  const { data, update, showUndo } = useJournal();
  const body = data.bodyProgress;
  const [entryForm, setEntryForm] = useState({ weight: "", note: "", date: getTodayDateKey() });
  const formRef = useRef<HTMLFormElement>(null);
  const weightInputRef = useRef<HTMLInputElement>(null);

  const saveProfileField = (field: ProfileField, raw: string) => {
    const value = field === "age" ? raw.trim().replace(/\D/g, "") : normalizeDecimalInput(raw);
    update((draft) => {
      draft.bodyProgress[field] = value;
    });
  };

  const setSex = (sex: Sex) =>
    update((draft) => {
      draft.bodyProgress.sex = sex;
    });

  const handleEntrySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const weightKg = normalizeDecimalInput(entryForm.weight);
    if (!weightKg) return;

    const nextEntry = { date: entryForm.date, weightKg, note: entryForm.note.trim() };
    update((draft) => {
      const entries = draft.bodyProgress.entries;
      const index = entries.findIndex((entry) => entry.date === nextEntry.date);
      if (index >= 0) {
        entries[index] = nextEntry;
      } else {
        entries.push(nextEntry);
      }
      entries.sort((a, b) => b.date.localeCompare(a.date));
    });
    setEntryForm({ weight: "", note: "", date: getTodayDateKey() });
  };

  const removeEntry = (date: string) => {
    const index = body.entries.findIndex((entry) => entry.date === date);
    const removed = body.entries[index];
    if (!removed) return;
    update((draft) => {
      draft.bodyProgress.entries.splice(index, 1);
    });
    showUndo("체크인 기록이 삭제됐어요.", () =>
      update((draft) => {
        const entries = draft.bodyProgress.entries;
        if (!entries.some((entry) => entry.date === removed.date)) {
          entries.push(removed);
          entries.sort((a, b) => b.date.localeCompare(a.date));
        }
      })
    );
  };

  const latest = body.entries[0];
  const stats = [
    { label: "Current", value: latest?.weightKg ? `${latest.weightKg} kg` : "—", primary: true },
    { label: "Height", value: body.heightCm ? `${body.heightCm} cm` : "—" },
    { label: "Goal", value: body.targetWeightKg ? `${body.targetWeightKg} kg` : "—" },
    { label: "BMI", value: getBmi(body) || "—" },
    { label: "Change", value: getWeightChange(body) || "—" },
  ];

  const profileInput = (field: ProfileField, label: string, placeholder: string, inputMode: "decimal" | "numeric") => (
    <label className="body-field">
      <span>{label}</span>
      <input
        // Re-mount when the stored value changes so the field reflects it.
        key={body[field]}
        type="text"
        inputMode={inputMode}
        placeholder={placeholder}
        defaultValue={body[field]}
        onBlur={(event) => {
          if (event.target.value !== body[field]) saveProfileField(field, event.target.value);
        }}
      />
    </label>
  );

  return (
    <>
      <section className="card body-hero">
        <div className="body-card-head">
          <p className="section-kicker">
            <Icon name="barbell-outline" />
            <span>Body Progress</span>
          </p>
          <h2>Weight journal</h2>
        </div>
        <p className="body-hero-note">키는 프로필 값으로 두고, 몸무게는 날짜별 로그로 쌓아두는 방식이에요.</p>
        <div className="body-hero-grid">
          {stats.map((stat) => (
            <div key={stat.label} className={`body-hero-stat${stat.primary ? " is-primary" : ""}`}>
              <span className="summary-stat-label">{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <div className="body-grid">
        <section className="card body-card">
          <div className="body-card-head">
            <p className="section-kicker">
              <Icon name="person-outline" />
              <span>Profile</span>
            </p>
            <h2>Body profile</h2>
          </div>
          <div className="body-fields">
            {profileInput("heightCm", "Height (cm)", "170.0", "decimal")}
            {profileInput("age", "Age", "25", "numeric")}
            <div className="body-field">
              <span>Sex</span>
              <div className="has-segment-indicator body-segmented-control" role="group" aria-label="Sex">
                <SegmentIndicator activeKey={body.sex} />
                {(["female", "male"] as const).map((sex) => (
                  <button
                    key={sex}
                    className={`body-segment-button${body.sex === sex ? " is-active" : ""}`}
                    type="button"
                    aria-pressed={body.sex === sex}
                    onClick={() => setSex(sex)}
                  >
                    {sex === "female" ? "Female" : "Male"}
                  </button>
                ))}
              </div>
            </div>
            {profileInput("targetWeightKg", "Goal weight (kg)", "60.0", "decimal")}
          </div>
        </section>

        <section className="card body-card">
          <div className="body-card-head">
            <p className="section-kicker">
              <Icon name="add-circle-outline" />
              <span>Quick Add</span>
            </p>
            <h2>Today&apos;s check-in</h2>
          </div>
          <form ref={formRef} className="body-entry-form" onSubmit={handleEntrySubmit}>
            <div className="body-fields">
              <label className="body-field">
                <span>Weight (kg)</span>
                <input
                  ref={weightInputRef}
                  type="text"
                  inputMode="decimal"
                  placeholder="65.4"
                  required
                  value={entryForm.weight}
                  onChange={(event) => setEntryForm({ ...entryForm, weight: event.target.value })}
                />
              </label>
              <div className="body-field">
                <span>Date</span>
                <BodyCalendar value={entryForm.date} onChange={(date) => setEntryForm({ ...entryForm, date })} />
              </div>
            </div>
            <label className="body-field body-field-note">
              <span>Memo</span>
              <textarea
                rows={3}
                placeholder="수면, 식단, 컨디션 같은 메모"
                value={entryForm.note}
                onChange={(event) => setEntryForm({ ...entryForm, note: event.target.value })}
              />
            </label>
            <button className="button" type="submit">
              <Icon name="save-outline" />
              <span>Save check-in</span>
            </button>
          </form>
        </section>
      </div>

      <section className="card body-card">
        <div className="body-card-head">
          <p className="section-kicker">
            <Icon name="analytics-outline" />
            <span>Trend</span>
          </p>
          <h2>Weight trend</h2>
        </div>
        <div className="body-chart">
          <WeightChart entries={body.entries} targetWeightKg={body.targetWeightKg} />
        </div>
      </section>

      <section className="card body-card">
        <div className="body-card-head">
          <p className="section-kicker">
            <Icon name="receipt-outline" />
            <span>History</span>
          </p>
          <h2>Check-in log</h2>
        </div>
        <div className="body-history">
          {body.entries.length === 0 ? (
            <p className="body-history-empty">아직 체크인 로그가 없어요.</p>
          ) : (
            body.entries.map((entry) => (
              <article key={entry.date} className="body-history-item">
                <div>
                  <div className="body-history-date">{entry.date}</div>
                  <div className="body-history-weight">{entry.weightKg} kg</div>
                  {entry.note && <p className="body-history-note">{entry.note}</p>}
                </div>
                <span className="summary-stat-label">{getWeekdayLabel(entry.date)}요일</span>
                <button
                  className="body-history-delete"
                  type="button"
                  onClick={() => {
                    setEntryForm({ weight: entry.weightKg, note: entry.note, date: entry.date });
                    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                    weightInputRef.current?.focus();
                  }}
                >
                  Edit
                </button>
                <button className="body-history-delete" type="button" onClick={() => removeEntry(entry.date)}>
                  Delete
                </button>
              </article>
            ))
          )}
        </div>
      </section>
    </>
  );
}
