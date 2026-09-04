"use client";

import { useRef, useEffect } from "react";
import type { MCQuestion } from "@/lib/exam-mock";
import { Button } from "@/components/ui/button";
import { McOptions } from "@/components/exam/sections/McOptions";

type Props = {
  question: MCQuestion;
  questionIndex: number;
  totalQuestions: number;
  /** This section's place in the whole run, e.g. 1 of 4. Optional: without it
      the counter falls back to the question count alone. */
  sectionPosition?: number;
  sectionCount?: number;
  selectedIndex: number | null;
  answeredIndices: Set<number>;
  skippedIndices: Set<number>;
  onSelect: (index: number | null) => void;
  onJumpTo: (index: number) => void;
  onNext: () => void;
  onSkip: () => void;
  isLast: boolean;
};

export function MultipleChoice({
  question,
  questionIndex,
  totalQuestions,
  sectionPosition,
  sectionCount,
  selectedIndex,
  answeredIndices,
  skippedIndices,
  onSelect,
  onJumpTo,
  onNext,
  onSkip,
  isLast,
}: Props) {
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (advanceTimer.current) clearTimeout(advanceTimer.current); }, []);

  function handleSelect(i: number) {
    onSelect(i);
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(onNext, 600);
  }

  return (
    <div
      className="flex-1 overflow-y-auto scroll-thin"
      style={{ maskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 48px), transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 48px), transparent 100%)" }}
      onClick={() => onSelect(null)}
    >
      <div
        className="max-w-[640px] mx-auto px-4 sm:px-8 py-12 flex flex-col gap-8 animate-in fade-in duration-200"
        style={{ animationTimingFunction: "ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Q stepper — centered */}
        <div className="flex items-center gap-2 self-center">
          {Array.from({ length: totalQuestions }, (_, i) => {
            const isCurrent = i === questionIndex;
            const isAnswered = answeredIndices.has(i) && !isCurrent;
            const isSkipped = skippedIndices.has(i);
            return (
              <div key={i} className="flex items-center gap-2">
                <button
                  onClick={() => onJumpTo(i)}
                  className="flex items-center justify-center rounded-full text-[11px] font-semibold transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 shrink-0"
                  style={{
                    width: 28, height: 28,
                    background: isCurrent || isAnswered ? "var(--primary)" : "transparent",
                    border: isCurrent || isAnswered ? "none" : isSkipped ? "1.5px dashed var(--muted-foreground)" : "1.5px solid var(--border)",
                    color: isCurrent || isAnswered ? "var(--primary-foreground)" : "var(--muted-foreground)",
                  }}
                >
                  {isAnswered ? "✓" : `Q${i + 1}`}
                </button>
                {i < totalQuestions - 1 && (
                  <div className="shrink-0" style={{ width: 16, height: 1.5, background: isAnswered ? "color-mix(in srgb, var(--primary) 30%, transparent)" : "var(--border)" }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Question */}
        <div className="flex flex-col gap-1">
          {/* "Question 1 of 5" alone read as the whole exam, which has eight
              questions across four sections on one shared timer -- so a
              candidate could pace against 5 and meet three unseen sections
              with minutes left. Naming the section's position scopes the
              count without repeating the section name, which the tabs above
              already show. */}
          <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
            {sectionPosition && sectionCount
              ? `Section ${sectionPosition} of ${sectionCount} · Question ${questionIndex + 1} of ${totalQuestions}`
              : `Question ${questionIndex + 1} of ${totalQuestions}`}
          </span>
          <h2 id={`mc-q-${questionIndex}`} className="text-[20px] leading-[28px] font-semibold text-foreground">
            {question.question}
          </h2>
        </div>

        {/* Options — the shared radio group (see McOptions). This list used to
            be duplicated here and in the knowledge check, and neither copy had
            radio semantics or a non-colour selected state. */}
        <McOptions
          options={question.options}
          selectedIndex={selectedIndex}
          onSelect={handleSelect}
          labelledBy={`mc-q-${questionIndex}`}
        />

        {/* Actions */}
        <div className="flex items-center justify-end pt-2">
          {isLast ? (
            <Button size="cta" onClick={onNext}>
              Next →
            </Button>
          ) : (
            <button
              onClick={onSkip}
              className="text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-100 cursor-pointer"
            >
              Skip question
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
