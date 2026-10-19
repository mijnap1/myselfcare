"use client";

import { useEffect } from "react";
import { getSkyPeriod } from "@/lib/sky";

const CHECK_EVERY_MS = 5 * 60 * 1000;

/** Keeps the sky (html[data-sky]) in step with the time of day while the page stays open. */
export function SkyClock() {
  useEffect(() => {
    const update = () => {
      document.documentElement.dataset.sky = getSkyPeriod(new Date().getHours());
    };
    update();
    const timer = window.setInterval(update, CHECK_EVERY_MS);
    return () => window.clearInterval(timer);
  }, []);
  return null;
}
