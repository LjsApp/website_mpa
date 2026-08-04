import { useEffect, useRef, useState } from "react";

/** Animates a number from 0 to `end` when `trigger` becomes true. */
export function useCounter(end: number, duration = 1500, trigger = true) {
  const [count, setCount] = useState(0);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!trigger || hasRun.current) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) { setCount(end); return; }
    hasRun.current = true;

    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [trigger, end, duration]);

  return count;
}

/** Parse a stat string like "150+" → { value: 150, suffix: "+" } */
export function parseStat(raw: string): { value: number; suffix: string } {
  const match = raw.match(/^(\d+)(.*)/);
  if (!match) return { value: 0, suffix: raw };
  return { value: parseInt(match[1], 10), suffix: match[2] ?? "" };
}
