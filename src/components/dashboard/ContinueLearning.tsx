"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ModuleIcon } from "@/components/training/ModuleIcon";
import { type Module, MODULE_CHAPTERS, getRemainingMinutes } from "@/lib/training-mock";

const CONTENT_CHAPTERS = MODULE_CHAPTERS.filter((c) => !c.isFinalQuiz);
// Fallback until the collapsed row is measured — prevents an SSR flash of the
// expanded card (which is always in flow) before the layout effect clamps it.
const COLLAPSED_FALLBACK = 64;

/** "Chapter X of Y" + the current chapter's title, derived from progress. */
function resumeInfo(m: Module) {
  const completed = Math.round((m.progress / 100) * m.chapters);
  const current = Math.min(m.chapters, completed + 1);
  const chapterTitle =
    CONTENT_CHAPTERS[Math.min(current - 1, CONTENT_CHAPTERS.length - 1)]?.title ?? "";
  return { current, total: m.chapters, chapterTitle };
}

/** Live offsetHeight of a referenced element (re-measures on resize/rewrap). */
function useHeight<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [height, setHeight] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setHeight(el.offsetHeight);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, height };
}

/**
 * One module in the accordion. Expanded → full resume card; collapsed → slim
 * row. Both layouts are always mounted and stacked; the container height tweens
 * between their measured heights while they cross-fade, so an item expands in
 * place and pushes its neighbours (via normal document flow) rather than
 * reordering the list.
 */
function AccordionItem({
  module: m,
  expanded,
  onExpand,
}: {
  module: Module;
  expanded: boolean;
  onExpand: () => void;
}) {
  const { current, total, chapterTitle } = resumeInfo(m);
  const mins = getRemainingMinutes(m);

  const card = useHeight<HTMLDivElement>();
  const row = useHeight<HTMLButtonElement>();

  const height = expanded
    ? card.height || undefined
    : row.height || COLLAPSED_FALLBACK;

  return (
    <li
      // In-card chip: surface on the raised widget card (light) / lifted 0.34 (dark).
      // Collapsed rows carry the shared item hover (lift + shadow in light; a
      // background step in dark) — matching the readiness/quick-practice lists.
      // The expanded card doesn't lift (it owns a Resume button). overflow-hidden
      // clips the cross-fading children, not the li's own outset shadow.
      className={`relative overflow-hidden rounded-[12px] bg-surface-lifted ease-out transition-[height,translate,box-shadow,background-color] duration-200 ${
        expanded
          ? ""
          : "cursor-pointer hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-none dark:hover:bg-surface-chip-hover"
      }`}
      style={{ height, border: "1px solid transparent" }}
    >
      {/* Expanded card — in flow, defines the expanded height */}
      <div
        ref={card.ref}
        aria-hidden={!expanded}
        // No bloom on the expanded card — the chip tone matches the bloomed rows.
        className="flex flex-col gap-3 p-5 bg-surface-chip transition-opacity duration-150 ease-out"
        style={{ opacity: expanded ? 1 : 0, pointerEvents: expanded ? "auto" : "none" }}
      >
        <p className="section-label">
          Resume · Chapter {current} of {total}
        </p>
        <div className="flex flex-col gap-0.5">
          <h3 className="text-[20px] leading-[28px] font-bold text-foreground text-balance">{m.title}</h3>
          {chapterTitle && (
            <p className="text-[13px] leading-[18px] text-muted-foreground">{chapterTitle}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <ProgressBar value={m.progress} />
          </div>
          <span className="text-[13px] leading-[18px] font-semibold tabular-nums shrink-0" style={{ color: "var(--primary)" }}>
            {m.progress}%
          </span>
        </div>
        <Link
          href={`/training/modules/${m.id}`}
          className="inline-flex items-center justify-center gap-1.5 h-[44px] px-5 rounded-[8px] text-[14px] font-semibold self-start transition-opacity duration-100 hover:opacity-90"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          Resume · {mins} min left
          <ArrowRight size={16} strokeWidth={2} />
        </Link>
      </div>

      {/* Collapsed row — absolute overlay; the toggle affordance */}
      <button
        ref={row.ref}
        type="button"
        aria-expanded={expanded}
        onClick={onExpand}
        className="absolute inset-x-0 top-0 flex items-center gap-3 p-3 text-left transition-[opacity,scale] duration-150 ease-out active:scale-[0.99]"
        style={{ opacity: expanded ? 0 : 1, pointerEvents: expanded ? "none" : "auto" }}
      >
        <ModuleIcon category={m.category} size={36} />
        <span className="relative z-10 flex flex-col min-w-0 flex-1">
          <span className="text-[14px] leading-[20px] font-semibold text-foreground truncate">{m.title}</span>
          <span className="text-[12px] leading-[16px] text-muted-foreground tabular-nums">
            Chapter {current} of {total} · {m.progress}%
          </span>
        </span>
        <span className="relative z-10 text-[12px] leading-[16px] text-muted-foreground shrink-0 tabular-nums">{mins} min</span>
      </button>
    </li>
  );
}

/**
 * Continue learning — a single-open accordion over the modules in progress.
 * The focused module expands in place into a full resume card; the others stay
 * as slim rows in their fixed positions. Default focus is the closest-to-done
 * module (highest progress). Selecting a row expands it and collapses the rest —
 * no reordering, no scroll-snap, no drag.
 */
export function ContinueLearning({ modules }: { modules: Module[] }) {
  // Closest-to-done first — sorted once; order never changes on interaction.
  const items = [...modules].sort((a, b) => b.progress - a.progress);
  const [expandedId, setExpandedId] = useState(items[0]?.id ?? "");

  // Empty state (new hire, nothing started yet) — kept as a full widget so the
  // dashboard grid stays whole instead of dropping a cell. Motivates the first
  // step rather than showing an apologetic blank.
  if (items.length === 0) {
    return (
      <section
        className="h-full rounded-[12px] p-6 flex flex-col gap-5 bg-surface-raised"
        style={{ border: "1px solid var(--border)" }}
      >
        <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">Continue learning</h2>
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-6">
          <p className="text-[14px] leading-[20px] text-muted-foreground max-w-[260px]">
            Start your first module!
          </p>
          <Link
            href="/training/modules"
            className="text-[13px] leading-[20px] font-medium transition-opacity duration-100 hover:opacity-70"
            style={{ color: "var(--primary)" }}
          >
            Browse modules
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      className="h-full rounded-[12px] p-6 flex flex-col gap-5 bg-surface-raised"
      style={{ border: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">Continue learning</h2>
        <Link
          href="/training/modules/in-progress"
          className="text-[13px] leading-[20px] font-medium transition-opacity duration-100 hover:opacity-70"
          style={{ color: "var(--primary)" }}
        >
          View all
        </Link>
      </div>

      <ul className="flex flex-col gap-2">
        {items.map((m) => (
          <AccordionItem
            key={m.id}
            module={m}
            expanded={m.id === expandedId}
            onExpand={() => setExpandedId(m.id)}
          />
        ))}
      </ul>
    </section>
  );
}
