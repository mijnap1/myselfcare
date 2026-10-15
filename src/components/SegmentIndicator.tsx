"use client";

import { useLayoutEffect, useRef } from "react";

/**
 * A highlight that slides onto its parent's `.is-active` button, so a
 * selection glides between options (also across rows of a wrapped grid).
 * Render it as the first child of a container with `has-segment-indicator`.
 */
export function SegmentIndicator({ activeKey }: { activeKey: string }) {
  const indicatorRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const indicator = indicatorRef.current;
    const container = indicator?.parentElement;
    if (!indicator || !container) {
      return;
    }

    const place = () => {
      const active = container.querySelector<HTMLElement>(":scope > .is-active");
      if (!active) {
        indicator.style.opacity = "0";
        return;
      }
      indicator.style.opacity = "1";
      indicator.style.width = `${active.offsetWidth}px`;
      indicator.style.height = `${active.offsetHeight}px`;
      indicator.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
    };

    place();
    // Turn on transitions after the first placement so it doesn't slide in from the corner.
    const frame = requestAnimationFrame(() => indicator.setAttribute("data-ready", ""));
    const observer = new ResizeObserver(place);
    observer.observe(container);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [activeKey]);

  return <span ref={indicatorRef} className="segment-indicator" aria-hidden="true" />;
}
