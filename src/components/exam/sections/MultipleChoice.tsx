"use client";

import { cn } from "@/lib/utils";
import type { MCQuestion } from "@/lib/exam-mock";

type Props = {
  question: MCQuestion;
  questionIndex: number;
  totalQuestions: number;
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
  selectedIndex,
  answeredIndices,
  skippedIndices,
  onSelect,
  onJumpTo,
  onNext,
  onSkip,
  isLast,
}: Props) {
  return (
    <div
      className="flex-1 overflow-y-auto scroll-thin"
      style={{ maskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 48px), transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 48px), transparent 100%)" }}
      onClick={() => onSelect(null)}
    >
      <div
        className="max-w-[640px] mx-auto px-8 py-12 flex flex-col gap-8 animate-in fade-in duration-200"
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
        <div className="flex flex-col gap-3">
          <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
            Question {questionIndex + 1} of {totalQuestions}
          </span>
          <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">
            {question.question}
          </h2>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-3">
          {question.options.map((option, i) => {
            const isSelected = selectedIndex === i;
            return (
              <button
                key={i}
                onClick={() => onSelect(i)}
                className={cn(
                  "w-full text-left px-4 py-3.5 rounded-[12px] border-2 text-[14px] leading-[20px] transition-all duration-150 cursor-pointer",
                  isSelected
                    ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_8%,transparent)] text-foreground"
                    : "border-border bg-[var(--surface-raised)] text-foreground hover:border-[color-mix(in_srgb,var(--primary)_40%,transparent)] hover:bg-[color-mix(in_srgb,var(--primary)_4%,transparent)]"
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[11px] font-semibold transition-all duration-150",
                      isSelected
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-border text-muted-foreground"
                    )}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{option}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onSkip}
            className="text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-100 cursor-pointer"
          >
            Skip question
          </button>
          <button
            onClick={onNext}
            className="flex items-center gap-2 h-10 px-5 rounded-[8px] bg-[var(--primary)] text-[var(--primary-foreground)] text-[14px] font-medium hover:opacity-90 transition-opacity duration-100 cursor-pointer"
          >
            {isLast ? "Review answers" : "Next"} →
          </button>
        </div>
      </div>
    </div>
  );
}
