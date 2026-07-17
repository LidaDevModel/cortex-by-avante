"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Horizontal scroller with scroll-edge fades — the same recipe as the dashboard
 * CertificationsShelf carousel: a partially-scrolled child melts into the
 * surface instead of clipping hard at the container edge, and each side's fade
 * shows only while there's more content that way. The scrollbar stays hidden;
 * the fade (plus the peek of the next child) is the affordance.
 *
 * `wrapperClassName` carries any edge-bleed (negative margins) so the fades sit
 * on the true scroll edges; `className` styles the scroller track (flex, gap,
 * snap, padding). `fadeColor` should match the surface the row sits on.
 */
export function EdgeFadeScroller({
  children,
  className,
  wrapperClassName,
  fadeColor = "var(--surface)",
}: {
  children: React.ReactNode;
  className?: string;
  wrapperClassName?: string;
  fadeColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  // Recompute on mount and whenever the track resizes (so canNext is correct
  // before the first scroll, and stays correct across viewport changes).
  useEffect(() => {
    update();
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update]);

  return (
    <div className={cn("relative", wrapperClassName)}>
      <div ref={ref} onScroll={update} className={cn("overflow-x-auto no-scrollbar", className)}>
        {children}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 transition-opacity duration-200"
        style={{ background: `linear-gradient(to right, ${fadeColor}, transparent)`, opacity: canPrev ? 1 : 0 }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 transition-opacity duration-200"
        style={{ background: `linear-gradient(to left, ${fadeColor}, transparent)`, opacity: canNext ? 1 : 0 }}
      />
    </div>
  );
}
