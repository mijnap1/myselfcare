"use client";

import { SegmentIndicator } from "@/components/SegmentIndicator";
import { ACTIVE_BODY_NOTES_KEY } from "@/lib/journal/constants";
import { Icon } from "../../Icon";
import { usePersistentChoice } from "../usePersistentChoice";
import { MealSection } from "./MealSection";
import { WorkoutSection } from "./WorkoutSection";

const NOTE_KINDS = ["workouts", "meals"] as const;

const HERO = {
  workouts: {
    title: "부위별 운동 리스트",
    note: "몸 부위별로 하는 운동, 자세 메모, 참고 이미지를 가볍게 모아두는 공간이에요.",
  },
  meals: {
    title: "식단 리스트",
    note: "아침, 점심, 저녁, 간식으로 자주 먹는 메뉴와 레시피, 음식 사진을 모아두는 공간이에요.",
  },
} as const;

/** Workout and meal notes share one tab; both stay mounted so unsaved forms survive switching. */
export function BodyNotesSection() {
  const [kind, setKind] = usePersistentChoice(ACTIVE_BODY_NOTES_KEY, NOTE_KINDS, "workouts");

  return (
    <>
      <section className="card body-workout-hero">
        <div>
          <p className="section-kicker">
            <Icon name="fitness-outline" />
            <span>운동 · 식단 메모</span>
          </p>
          <h2>{HERO[kind].title}</h2>
          <p className="section-note">{HERO[kind].note}</p>
        </div>
        <div className="has-segment-indicator body-workout-parts body-notes-toggle" role="group" aria-label="Note type">
          <SegmentIndicator activeKey={kind} />
          <button
            className={`body-part-button${kind === "workouts" ? " is-active" : ""}`}
            type="button"
            aria-pressed={kind === "workouts"}
            onClick={() => setKind("workouts")}
          >
            <Icon name="barbell-outline" />
            <span>운동</span>
          </button>
          <button
            className={`body-part-button${kind === "meals" ? " is-active" : ""}`}
            type="button"
            aria-pressed={kind === "meals"}
            onClick={() => setKind("meals")}
          >
            <Icon name="restaurant-outline" />
            <span>식단</span>
          </button>
        </div>
      </section>

      <div className="body-notes-panel" hidden={kind !== "workouts"}>
        <WorkoutSection />
      </div>
      <div className="body-notes-panel" hidden={kind !== "meals"}>
        <MealSection />
      </div>
    </>
  );
}
