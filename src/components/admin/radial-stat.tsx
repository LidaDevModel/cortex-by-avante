"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useCountUp } from "@/hooks/use-count-up";

type Series = { label: string; value: number; color: string };

/**
 * Interactive two-ring radial stat for the admin Home team pulse — one arc per
 * series, each measured against `total`. The chart stands alone (centred, no
 * legend); the centre shows the total by default and swaps to a key's value +
 * label while that ring is hovered (or tapped, for touch). Hovering a ring dims
 * the others. SVG + tokens only — the shadcn radial-bar look without a charting
 * dependency. Arcs sweep and numbers count up on first visit.
 *
 * Navigation splits by input (touch has no hover to spare):
 *  - Desktop (mouse): hover a ring reveals its value; clicking anywhere on the
 *    card follows `href`.
 *  - Mobile (touch): tapping a ring reveals its value and stays put; only the
 *    top-right arrow — a 44px target — follows `href`.
 */
export function RadialStat({
  title,
  href,
  total,
  centerLabel,
  series,
  animate,
}: {
  title: string;
  href?: string;
  total: number;
  centerLabel: string;
  series: [Series, Series];
  animate: boolean;
}) {
  const size = 164;
  const stroke = 14;
  const gap = 5;
  const pad = 6; // headroom so the hovered ring can scale up without clipping the edge
  const c = size / 2;
  const rOuter = (size - stroke) / 2 - pad;
  const rInner = rOuter - stroke - gap;
  const radii = [rOuter, rInner];

  const [swept, setSwept] = useState(!animate);
  useEffect(() => {
    if (!animate) return;
    const raf = requestAnimationFrame(() => setSwept(true));
    return () => cancelAnimationFrame(raf);
  }, [animate]);

  const [hovered, setHovered] = useState<number | null>(null);
  // Tracks how the last interaction arrived so click can tell a mouse click
  // (follow the card link) from a tap (reveal this ring's value). Touch fires a
  // compatibility mouse-hover before click, so hover must be pointer-driven and
  // guarded to mouse — otherwise the tap enters then immediately toggles back.
  const pointerTypeRef = useRef<string>("mouse");
  const tc = useCountUp(total, animate);

  const cls = "group flex-1 min-w-[200px] rounded-[12px] p-4 sm:p-5 flex flex-col gap-4 bg-surface-raised";
  const inner = (
    <>
      <div className="flex items-center justify-between gap-2">
        <h2 className="type-h2 font-semibold text-foreground">{title}</h2>
        {href && (
          <span
            data-nav-arrow
            aria-hidden="true"
            className="shrink-0 -my-2 -mr-1.5 h-11 w-11 flex items-center justify-center rounded-lg text-muted-foreground transition-colors duration-100 group-hover:text-foreground"
          >
            <ArrowUpRight size={16} strokeWidth={1.5} />
          </span>
        )}
      </div>
      <div className="flex justify-center py-1">
        <div
          className="relative shrink-0"
          style={{ width: size, height: size }}
          role="img"
          aria-label={`${total} ${centerLabel}: ${series.map((s) => `${s.value} ${s.label}`).join(", ")}`}
        >
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
            {radii.map((r, i) => (
              <circle
                key={`track-${i}`}
                cx={c}
                cy={c}
                r={r}
                fill="none"
                stroke="var(--border)"
                strokeWidth={stroke}
                style={{
                  transition: "transform 280ms cubic-bezier(0.22, 1, 0.36, 1)",
                  transform: hovered === i ? "scale(1.045)" : "scale(1)",
                  transformOrigin: "center",
                  transformBox: "fill-box",
                }}
              />
            ))}
            {radii.map((r, i) => {
              const circ = 2 * Math.PI * r;
              const pct = total > 0 ? (series[i].value / total) * 100 : 0;
              return (
                <circle
                  key={`arc-${i}`}
                  cx={c}
                  cy={c}
                  r={r}
                  fill="none"
                  stroke={series[i].color}
                  strokeWidth={stroke}
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  strokeDashoffset={circ * (1 - (swept ? pct : 0) / 100)}
                  style={{
                    transition:
                      "stroke-dashoffset 500ms ease-out, opacity 240ms ease-out, transform 280ms cubic-bezier(0.22, 1, 0.36, 1)",
                    opacity: hovered === null || hovered === i ? 1 : 0.45,
                    transform: hovered === i ? "scale(1.045)" : "scale(1)",
                    transformOrigin: "center",
                    transformBox: "fill-box",
                  }}
                />
              );
            })}
            {/* Transparent hit bands — the whole ring is hoverable/tappable. */}
            {radii.map((r, i) => (
              <circle
                key={`hit-${i}`}
                cx={c}
                cy={c}
                r={r}
                fill="none"
                stroke="transparent"
                strokeWidth={stroke + gap}
                style={{ pointerEvents: "stroke", cursor: "pointer" }}
                onPointerDown={(e) => { pointerTypeRef.current = e.pointerType; }}
                onPointerEnter={(e) => { if (e.pointerType === "mouse") setHovered(i); }}
                onPointerLeave={(e) => { if (e.pointerType === "mouse") setHovered(null); }}
                onClick={(e) => {
                  // Mouse already reveals on hover, so let its click fall through
                  // to the card link. A tap (touch/pen) has no hover — reveal (or
                  // hide) this key's value instead of navigating.
                  if (pointerTypeRef.current === "mouse") return;
                  e.preventDefault();
                  e.stopPropagation();
                  setHovered((h) => (h === i ? null : i));
                }}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center px-2 text-center pointer-events-none">
            {/* Keyed so each swap fades in gently instead of hard-cutting. */}
            <div
              key={hovered ?? "total"}
              className="flex flex-col items-center animate-in fade-in-0 duration-200 ease-out"
            >
              {hovered !== null ? (
                <>
                  <span className="type-h1 font-bold tabular-nums text-foreground">
                    {series[hovered].value}
                  </span>
                  <span className="type-caption font-medium" style={{ color: series[hovered].color }}>
                    {series[hovered].label}
                  </span>
                </>
              ) : (
                <>
                  <span className="type-h1 font-bold tabular-nums text-foreground">{tc}</span>
                  <span className="type-caption text-muted-foreground">{centerLabel}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`${cls} transition-[transform,box-shadow,background-color] duration-150 hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-none dark:hover:bg-surface-chip-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50`}
        style={{ border: "1px solid var(--border)" }}
        onPointerDown={(e) => { pointerTypeRef.current = e.pointerType; }}
        onClick={(e) => {
          // Keyboard (detail 0) and mouse clicks navigate anywhere on the card.
          // A touch tap only navigates from the arrow — elsewhere it explores
          // the chart (a ring tap has already stopped propagation before here).
          if (e.detail === 0 || pointerTypeRef.current === "mouse") return;
          if (!(e.target as Element).closest?.("[data-nav-arrow]")) e.preventDefault();
        }}
      >
        {inner}
      </Link>
    );
  }
  return (
    <div
      className={cls}
      style={{ border: "1px solid var(--border)" }}
      onPointerDown={(e) => { pointerTypeRef.current = e.pointerType; }}
    >
      {inner}
    </div>
  );
}
