"use client";

import { useEffect, useState } from "react";

/** Delay before character `index`: a little uneven, like keys struck by hand, with a pause at line breaks. */
function strikeDelay(text: string, index: number): number {
  const char = text[index - 1];
  if (char === "\n") return 320;
  if (char === "." || char === ",") return 160;
  return 34 + ((index * 37) % 29);
}

/**
 * Types `text` in one character at a time. The untyped rest is laid out but
 * invisible, so the block keeps its final size and nothing below it shifts.
 */
export function Typewriter({ text, startDelay = 0 }: { text: string; startDelay?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const timer = window.setTimeout(() => setCount(text.length), 0);
      return () => window.clearTimeout(timer);
    }
    let index = 0;
    let timer = 0;
    const strike = () => {
      index += 1;
      setCount(index);
      if (index < text.length) timer = window.setTimeout(strike, strikeDelay(text, index + 1));
    };
    timer = window.setTimeout(strike, startDelay);
    return () => window.clearTimeout(timer);
  }, [text, startDelay]);

  const done = count >= text.length;
  return (
    <span className="typewriter" aria-label={text}>
      <span aria-hidden="true">{text.slice(0, count)}</span>
      {!done && <span className="typewriter-caret" aria-hidden="true" />}
      <span className="typewriter-rest" aria-hidden="true">
        {text.slice(count)}
      </span>
    </span>
  );
}
