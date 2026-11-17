"use client";

import { getTodayDateKey } from "@/lib/journal/dates";
import { extendTimelineTo } from "@/lib/journal/timeline";
import { Icon } from "../Icon";
import { Typewriter } from "../Typewriter";
import { useJournal } from "./JournalContext";

const PERIODS = [
  { until: 5, icon: "moon", text: "늦은 밤이에요. 내일의 나를 위해 오늘은 푹 쉬어요." },
  { until: 11, icon: "partly-sunny", text: "좋은 아침이에요. 오늘의 루틴을 천천히 적어봐요." },
  { until: 17, icon: "sunny", text: "좋은 오후예요. 잠깐 쉬어가며 오늘을 기록해요." },
  { until: 22, icon: "cloudy-night", text: "편안한 저녁이에요. 오늘 하루도 수고했어요." },
  { until: 24, icon: "moon", text: "늦은 밤이에요. 내일의 나를 위해 오늘은 푹 쉬어요." },
] as const;

const START_DELAY_MS = 450;

function getPeriod(now: Date) {
  return PERIODS.find((option) => now.getHours() < option.until) ?? PERIODS[0];
}

/** The date at the top of the left page, with the sun (or moon) for the hour. */
export function HeroDate() {
  const now = new Date();
  return (
    <div className="hero-date">
      <span className="hero-date-icon" aria-hidden="true">
        <Icon name={getPeriod(now).icon} />
      </span>
      <div>
        <p className="hero-date-weekday">{now.toLocaleDateString("en-US", { weekday: "long" })}</p>
        <p className="hero-date-day">{now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
      </div>
    </div>
  );
}

/**
 * The right page: a soft card with a typed note for the time of day, then a
 * ruled page that writes straight into today's notes in the routine timeline.
 */
export function HeroGreeting({ username }: { username: string }) {
  const { data, update } = useJournal();
  const now = new Date();
  const period = getPeriod(now);
  const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const todayKey = getTodayDateKey();
  const notes = data.skinTimeline.find((entry) => entry.date === todayKey)?.notes ?? "";

  const writeNotes = (value: string) => {
    update((draft) => {
      extendTimelineTo(draft.skinTimeline, todayKey);
      const entry = draft.skinTimeline.find((item) => item.date === todayKey);
      if (entry) {
        entry.notes = value;
      }
    });
  };

  return (
    <>
      <section className="moment-card" aria-label="Today's note">
        <div className="moment-card-head">
          <span>
            <Icon name="leaf-outline" />
            Dear {username}
          </span>
          <span>{time}</span>
        </div>
        <p className="moment-card-text">
          <Typewriter text={period.text} startDelay={START_DELAY_MS} />
        </p>
      </section>

      <label className="lined-note">
        <span className="lined-note-label">
          <Icon name="pencil-outline" />
          오늘의 메모
        </span>
        <textarea
          value={notes}
          onChange={(event) => writeNotes(event.target.value)}
          placeholder={"오늘 피부는 어땠나요? 새로 써본 제품, 기분, 작은 변화들을 편하게 적어봐요.\n여기 쓴 메모는 루틴 타임라인의 오늘 칸에도 저장돼요."}
          rows={5}
        />
      </label>
    </>
  );
}
