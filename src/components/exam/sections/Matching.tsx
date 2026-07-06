"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { MatchingExercise, MatchingPair } from "@/lib/exam-mock";

// Distinct pair colors — bg/border only; text always uses var(--foreground) for contrast in both modes
const PAIR_COLORS = [
  { bg: "color-mix(in srgb, var(--primary) 10%, transparent)", border: "var(--primary)" },
  { bg: "var(--match-pair-2-bg)", border: "var(--match-pair-2-border)" },
  { bg: "var(--match-pair-3-bg)", border: "var(--match-pair-3-border)" },
  { bg: "var(--match-pair-4-bg)", border: "var(--match-pair-4-border)" },
];

type Connector = { id: string; x1: number; y1: number; x2: number; y2: number; colorIdx: number };

type Props = {
  exercise: MatchingExercise;
  matches: Record<string, string>; // termId → definitionId
  onMatch: (termId: string, defId: string) => void;
  onClear: () => void;
  onNext: () => void;
};

export function Matching({ exercise, matches, onMatch, onClear, onNext }: Props) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const dragNode = useRef<EventTarget | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);
  const termEls = useRef<Map<string, HTMLDivElement>>(new Map());
  const defEls = useRef<Map<string, HTMLDivElement>>(new Map());
  const [connectors, setConnectors] = useState<Connector[]>([]);

  const setTermRef = useCallback((id: string) => (el: HTMLDivElement | null) => {
    if (el) termEls.current.set(id, el); else termEls.current.delete(id);
  }, []);

  const setDefRef = useCallback((id: string) => (el: HTMLDivElement | null) => {
    if (el) defEls.current.set(id, el); else defEls.current.delete(id);
  }, []);

  // Recompute connector lines after each render
  useEffect(() => {
    if (!gridRef.current) return;
    const containerRect = gridRef.current.getBoundingClientRect();
    const lines: Connector[] = [];

    Object.entries(matches).forEach(([termId, defId]) => {
      const termEl = termEls.current.get(termId);
      const defEl = defEls.current.get(defId);
      if (!termEl || !defEl) return;

      const tRect = termEl.getBoundingClientRect();
      const dRect = defEl.getBoundingClientRect();

      const x1 = tRect.right - containerRect.left;
      const y1 = tRect.top + tRect.height / 2 - containerRect.top;
      const x2 = dRect.left - containerRect.left;
      const y2 = dRect.top + dRect.height / 2 - containerRect.top;
      const colorIdx = exercise.pairs.findIndex((p) => p.id === termId);

      lines.push({ id: termId, x1, y1, x2, y2, colorIdx });
    });

    setConnectors(lines);
  }, [matches, exercise.pairs]);

  // Build reverse map: defId → termId
  const reverseMatches: Record<string, string> = {};
  Object.entries(matches).forEach(([tid, did]) => { reverseMatches[did] = tid; });

  const getPairIndex = (termId: string): number => {
    if (!matches[termId]) return -1;
    return exercise.pairs.findIndex((p) => p.id === termId);
  };

  const shuffledDefs: MatchingPair[] = [...exercise.pairs].sort((a, b) =>
    a.definition.localeCompare(b.definition)
  );

  return (
    <div
      className="flex-1 overflow-y-auto scroll-thin"
      style={{
        maskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 48px), transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 48px), transparent 100%)",
      }}
    >
      <div
        className="max-w-[720px] mx-auto px-8 py-12 flex flex-col gap-8 animate-in fade-in duration-200"
        style={{ animationTimingFunction: "ease-out" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
              Matching exercise
            </span>
            <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">
              {exercise.instruction}
            </h2>
            <p className="text-[13px] text-muted-foreground mt-1">
              Drag a term to its matching definition.
            </p>
          </div>
          <button
            onClick={onClear}
            className="shrink-0 text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-100 cursor-pointer whitespace-nowrap"
          >
            Clear all
          </button>
        </div>

        {/* Two-column grid with SVG connector overlay */}
        <div ref={gridRef} className="relative grid grid-cols-[2fr_3fr] gap-8">
          {/* Connector lines */}
          {connectors.length > 0 && (
            <svg
              className="absolute inset-0 pointer-events-none"
              width="100%"
              height="100%"
              style={{ overflow: "visible" }}
            >
              {connectors.map(({ id, x1, y1, x2, y2, colorIdx }) => {
                const color = PAIR_COLORS[colorIdx % PAIR_COLORS.length];
                const gap = x2 - x1;
                const cx1 = x1 + gap * 0.45;
                const cx2 = x2 - gap * 0.45;
                return (
                  <path
                    key={id}
                    d={`M ${x1} ${y1} C ${cx1} ${y1} ${cx2} ${y2} ${x2} ${y2}`}
                    stroke={color.border}
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    fill="none"
                    opacity={0.7}
                  />
                );
              })}
            </svg>
          )}

          {/* Terms column */}
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
              Terms
            </p>
            {exercise.pairs.map((pair) => {
              const pairIdx = getPairIndex(pair.id);
              const isMatched = pairIdx >= 0;
              const color = isMatched ? PAIR_COLORS[pairIdx % PAIR_COLORS.length] : null;

              return (
                <div
                  key={pair.id}
                  ref={setTermRef(pair.id)}
                  draggable
                  onDragStart={(e) => {
                    setDragging(pair.id);
                    dragNode.current = e.target;
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragEnd={() => {
                    setDragging(null);
                    setDragOver(null);
                  }}
                  className={cn(
                    "px-4 rounded-[10px] border text-[14px] leading-[20px] cursor-grab active:cursor-grabbing transition-all duration-150 select-none flex items-center",
                    "h-[80px]",
                    dragging === pair.id ? "opacity-50 scale-95" : "opacity-100",
                    isMatched
                      ? "border-l-[3px]"
                      : "border-border bg-[var(--surface-raised)] hover:border-[color-mix(in_srgb,var(--primary)_40%,transparent)]"
                  )}
                  style={isMatched && color ? { background: color.bg, borderColor: color.border, borderLeftColor: color.border } : {}}
                >
                  {pair.term}
                </div>
              );
            })}
          </div>

          {/* Definitions column */}
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
              Definitions
            </p>
            {shuffledDefs.map((pair) => {
              const matchedTermId = reverseMatches[pair.id];
              const isMatched = !!matchedTermId;
              const pairIdx = isMatched ? exercise.pairs.findIndex((p) => p.id === matchedTermId) : -1;
              const color = isMatched ? PAIR_COLORS[pairIdx % PAIR_COLORS.length] : null;
              const isOver = dragOver === pair.id;

              return (
                <div
                  key={pair.id}
                  ref={setDefRef(pair.id)}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(pair.id); }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragging) onMatch(dragging, pair.id);
                    setDragOver(null);
                    setDragging(null);
                  }}
                  className={cn(
                    "px-4 rounded-[10px] border text-[14px] leading-[20px] transition-all duration-150 flex items-center",
                    "h-[80px]",
                    isOver && !isMatched
                      ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_8%,transparent)] scale-[1.01]"
                      : isMatched
                      ? "border-l-[3px]"
                      : "border-border border-dashed bg-[var(--surface-raised)]/50 text-muted-foreground"
                  )}
                  style={isMatched && color ? { background: color.bg, borderColor: color.border, borderLeftColor: color.border } : {}}
                >
                  {pair.definition}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onNext}
            className="flex items-center gap-2 h-10 px-5 rounded-[8px] bg-[var(--primary)] text-[var(--primary-foreground)] text-[14px] font-medium hover:opacity-90 transition-opacity duration-100 cursor-pointer"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
