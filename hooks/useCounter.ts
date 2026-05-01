"use client";
import { useState, useEffect, useRef } from "react";

export function useCounter(
  target: number,
  duration = 2000,
  start = 0,
  delay = 0
): number {
  const [value, setValue] = useState(start);
  const frameRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      startedRef.current = true;

      const animate = (timestamp: number) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp;
        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(start + (target - start) * eased));
        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate);
        }
      };

      frameRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration, start, delay]);

  return value;
}
