"use client";

import { Typewriter } from "../Typewriter";

const PERIODS = [
  { until: 5, text: "늦은 밤이에요. 내일의 나를 위해 오늘은 푹 쉬어요." },
  { until: 11, text: "좋은 아침이에요. 오늘의 루틴을 천천히 적어봐요." },
  { until: 17, text: "좋은 오후예요. 잠깐 쉬어가며 오늘을 기록해요." },
  { until: 22, text: "편안한 저녁이에요. 오늘 하루도 수고했어요." },
  { until: 24, text: "늦은 밤이에요. 내일의 나를 위해 오늘은 푹 쉬어요." },
] as const;

const START_DELAY_MS = 450;

/** A short letter under the title once signed in: today's date and a typed note. */
export function HeroGreeting({ username }: { username: string }) {
  const now = new Date();
  const period = PERIODS.find((option) => now.getHours() < option.until) ?? PERIODS[0];
  const date = now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const note = `Dear ${username},\n${period.text}`;

  return (
    <div className="hero-letter">
      <p className="hero-letter-date">{date}</p>
      <p className="hero-letter-body">
        <Typewriter text={note} startDelay={START_DELAY_MS} />
      </p>
    </div>
  );
}
