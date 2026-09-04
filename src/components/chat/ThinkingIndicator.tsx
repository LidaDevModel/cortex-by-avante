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
    // The status line cycles every couple of seconds. Left announceable, a
    // screen reader re-reads the whole region on each change — three or four
    // interruptions per answer. So the region carries ONE stable sentence and
    // the cycling text is hidden from it.
    <div className="flex items-center gap-2.5 h-9">
      <span className="sr-only" role="status" aria-live="polite">
        Cortex is thinking
      </span>
      {/* Breathing dot — flat brand colour, no gloss or glow (a glossy sphere
          with a specular highlight and a blurred halo read as dated). */}
      <span className="flex items-center justify-center size-4 shrink-0">
        <span
          className="size-2 rounded-full"
          style={{
            background: "var(--primary)",
            animation: "think-pulse 1.2s ease-in-out infinite",
          }}
        />
      </span>

      {/* Cycling status line with shimmer sweep — decorative to assistive tech;
          the stable sr-only line above is what gets announced. */}
      <span
        aria-hidden
        key={statusIdx}
        className="type-meta font-medium"
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
