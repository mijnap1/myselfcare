"use client";

import { useEffect, useRef, useState } from "react";
import {
  formatCalendarDateLabel,
  formatCalendarMonthLabel,
  formatDateKey,
  getTodayDateKey,
  shiftMonth,
} from "@/lib/journal/dates";
import { Icon } from "../../Icon";

interface BodyCalendarProps {
  value: string;
  onChange: (dateKey: string) => void;
}

function getCalendarDays(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const startDay = new Date(year, month - 1, 1).getDay();
  const mondayOffset = startDay === 0 ? 6 : startDay - 1;
  const gridStart = new Date(year, month - 1, 1 - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return { dateKey: formatDateKey(date), day: date.getDate(), isCurrentMonth: date.getMonth() === month - 1 };
  });
}

export function BodyCalendar({ value, onChange }: BodyCalendarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [month, setMonth] = useState(value.slice(0, 7));
  const pickerRef = useRef<HTMLDivElement>(null);
  const todayKey = getTodayDateKey();

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleClick = (event: MouseEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [isOpen]);

  return (
    <div className="body-date-picker" ref={pickerRef}>
      <input type="text" readOnly value={formatCalendarDateLabel(value)} aria-label="Check-in date" />
      <button
        className="body-date-toggle"
        type="button"
        aria-expanded={isOpen}
        aria-label="Choose date"
        onClick={() => {
          setMonth(value.slice(0, 7));
          setIsOpen((open) => !open);
        }}
      >
        <Icon name="calendar-outline" />
      </button>
      <div className="body-calendar-panel" hidden={!isOpen}>
        <div className="body-calendar-head">
          <button className="body-calendar-nav" type="button" aria-label="Previous month" onClick={() => setMonth(shiftMonth(month, -1))}>
            <Icon name="chevron-back-outline" />
          </button>
          <strong>{formatCalendarMonthLabel(month)}</strong>
          <button className="body-calendar-nav" type="button" aria-label="Next month" onClick={() => setMonth(shiftMonth(month, 1))}>
            <Icon name="chevron-forward-outline" />
          </button>
        </div>
        <div className="body-calendar-weekdays">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="body-calendar-grid">
          {getCalendarDays(month).map(({ dateKey, day, isCurrentMonth }) => (
            <button
              key={dateKey}
              className={`body-calendar-day${isCurrentMonth ? "" : " is-outside"}${dateKey === value ? " is-selected" : ""}${
                dateKey === todayKey ? " is-today" : ""
              }`}
              type="button"
              onClick={() => {
                onChange(dateKey);
                setIsOpen(false);
              }}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
