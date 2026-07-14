"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";
import { HonorCard, HONOR_CARD_W } from "@/components/training/HonorCard";
import { getCertifiedModules } from "@/lib/training-mock";

const CARD_W = HONOR_CARD_W;
const GAP = 12; // gap-3

function ArrowBtn({ dir, disabled, onClick }: { dir: "prev" | "next"; disabled: boolean; onClick: () => void }) {
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={dir === "prev" ? "Previous certifications" : "Next certifications"}
      disabled={disabled}
      onClick={onClick}
      className="flex items-center justify-center w-8 h-8 rounded-[8px] border transition-[opacity,background-color] duration-100 disabled:opacity-30 disabled:cursor-not-allowed enabled:hover:bg-[var(--surface-raised)]"
      style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
    >
      <Icon size={16} strokeWidth={1.5} />
    </button>
  );
}

/**
 * Certifications shelf — the trophy shelf of every earned certification
 * (required *and* optional; independent of shift readiness). With 2 or fewer
 * it's a simple grid; with more it becomes a horizontal carousel (arrows · drag ·
 * dots). Scores count up when the shelf scrolls into view.
 */
export function CertificationsShelf() {
  const items = getCertifiedModules();
  const { ref: viewRef, inView } = useInView<HTMLDivElement>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const isCarousel = items.length > 2;

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setActiveIndex(Math.round(el.scrollLeft / (CARD_W + GAP)));
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    if (isCarousel) updateScrollState();
  }, [isCarousel, updateScrollState]);

  const scrollToIndex = (i: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(i, items.length - 1));
    el.scrollTo({ left: clamped * (CARD_W + GAP), behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <section
      ref={viewRef}
      className="h-full rounded-[12px] p-6 flex flex-col gap-5 bg-surface-raised"
      style={{ border: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">Certifications ({items.length})</h2>
        <div className="flex items-center gap-2">
          {/* Arrows are a pointer affordance — hidden on narrow screens where the
              carousel swipes natively and the dots carry position. Keeps the
              card header on one line at 375px. */}
          {isCarousel && (
            <div className="hidden sm:flex items-center gap-1">
              <ArrowBtn dir="prev" disabled={!canPrev} onClick={() => scrollToIndex(activeIndex - 1)} />
              <ArrowBtn dir="next" disabled={!canNext} onClick={() => scrollToIndex(activeIndex + 1)} />
            </div>
          )}
          <Link
            href="/training/modules"
            className="text-[13px] leading-[20px] font-medium whitespace-nowrap transition-opacity duration-100 hover:opacity-70"
            style={{ color: "var(--primary)" }}
          >
            View all
          </Link>
        </div>
      </div>

      {isCarousel ? (
        <>
          <div className="relative">
            <div
              ref={scrollRef}
              onScroll={updateScrollState}
              className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory"
            >
              {items.map((m, i) => (
                <HonorCard key={m.id} module={m} carousel start={inView} index={i} />
              ))}
            </div>
            {/* Scroll-edge fades — same recipe as the composer's scroll fades:
                a partially-scrolled card melts into the surface instead of
                clipping hard at the container edge. Each side shows only while
                there's more content in that direction. */}
            <div
              className="absolute inset-y-0 left-0 w-12 pointer-events-none z-10 transition-opacity duration-200"
              style={{
                background: "linear-gradient(to right, var(--surface-raised), transparent)",
                opacity: canPrev ? 1 : 0,
              }}
            />
            <div
              className="absolute inset-y-0 right-0 w-12 pointer-events-none z-10 transition-opacity duration-200"
              style={{
                background: "linear-gradient(to left, var(--surface-raised), transparent)",
                opacity: canNext ? 1 : 0,
              }}
            />
          </div>
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {items.map((m, i) => {
              const active = i === activeIndex;
              return (
                <button
                  key={m.id}
                  type="button"
                  aria-label={`Show ${m.title}`}
                  aria-current={active}
                  onClick={() => scrollToIndex(i)}
                  className="flex items-center justify-center p-1.5"
                >
                  {/* Active dot carries the lime signature accent in light mode;
                      dark keeps primary (dark lime sits below the track in tone). */}
                  <span
                    className={`block rounded-full transition-all duration-150 ${
                      active ? "bg-accent-subtle dark:bg-primary" : "bg-border"
                    }`}
                    style={{ width: active ? 18 : 6, height: 6 }}
                  />
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map((m, i) => (
            <HonorCard key={m.id} module={m} carousel={false} start={inView} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
