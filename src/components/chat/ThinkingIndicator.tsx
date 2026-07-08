"use client";

import { useEffect, useState } from "react";

/**
 * The chat thinking state — a token-native breathing orb plus a cycling status
 * line that names the sources Cortex is about to cite ("Searching Post Orders…"),
 * so the wait reads as work happening rather than dead air. Replaces the old
 * looping video loader: this one follows the theme, needs no asset, and can't
 * stall on autoplay policies.
 */
export function ThinkingIndicator({ sources = [] }: { sources?: string[] }) {
  const statuses = [
    "Thinking…",
    ...sources.map(s => `Searching ${s}…`),
    "Putting it together…",
  ];
  const [statusIdx, setStatusIdx] = useState(0);

  useEffect(() => {
    if (statuses.length <= 1) return;
    const id = setInterval(() => {
      setStatusIdx(i => (i + 1) % statuses.length);
    }, 1600);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statuses.length]);

  return (
    <div className="flex items-center gap-2.5 h-9" role="status" aria-label="Cortex is thinking">
      {/* Breathing orb */}
      <span className="relative flex items-center justify-center size-4 shrink-0">
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle at 35% 30%, var(--accent-subtle), var(--primary))",
            animation: "think-pulse 1.2s ease-in-out infinite",
          }}
        />
        <span
          className="absolute -inset-1 rounded-full"
          style={{
            background: "color-mix(in srgb, var(--primary) 18%, transparent)",
            filter: "blur(3px)",
            animation: "think-pulse 1.2s ease-in-out infinite",
          }}
        />
      </span>

      {/* Cycling status line with shimmer sweep */}
      <span
        key={statusIdx}
        className="text-[13px] leading-[20px] font-medium"
        style={{
          backgroundImage:
            "linear-gradient(90deg, var(--muted-foreground) 40%, var(--foreground) 50%, var(--muted-foreground) 60%)",
          backgroundSize: "200% 100%",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          animation: "think-shimmer 2.2s linear infinite, msg-in 200ms ease-out",
        }}
      >
        {statuses[statusIdx]}
      </span>
    </div>
  );
}

/** Inline caret shown at the end of streaming text — VISION's 600ms pulse. */
export function StreamingCaret() {
  return (
    <span
      aria-hidden
      className="inline-block align-middle ml-0.5 w-[3px] h-[18px] rounded-full"
      style={{
        background: "var(--primary)",
        animation: "stream-caret 600ms ease-in-out infinite",
      }}
    />
  );
}
