"use client";

import { useEffect, useState } from "react";

type Props = {
  value: number;
  height?: number;
};

export function ProgressBar({ value, height = 6 }: Props) {
  // Start at 0 and settle to the real value one frame after mount, so the fill
  // sweeps in instead of appearing pre-filled (reduced-motion collapses this).
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setDisplayValue(value));
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <div
      className="rounded-full bg-progress-track overflow-hidden"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{ height }}
    >
      <div
        className="h-full rounded-full bg-success transition-[width] duration-300 ease-out"
        style={{ width: `${displayValue}%` }}
      />
    </div>
  );
}
