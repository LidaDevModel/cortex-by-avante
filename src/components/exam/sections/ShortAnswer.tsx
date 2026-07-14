"use client";

import type { ShortAnswerQuestion } from "@/lib/exam-mock";

type Props = {
  question: ShortAnswerQuestion;
  answer: string;
  onChange: (value: string) => void;
  onNext: () => void;
};

export function ShortAnswer({ question, answer, onChange, onNext }: Props) {
  return (
    <div className="flex-1 overflow-y-auto scroll-thin" style={{ maskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 48px), transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 48px), transparent 100%)" }}>
      <div
        className="max-w-[640px] mx-auto px-4 sm:px-8 py-12 flex flex-col gap-8 animate-in fade-in duration-200"
        style={{ animationTimingFunction: "ease-out" }}
      >
        {/* Question */}
        <div className="flex flex-col gap-1">
          <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
            Short answer
          </span>
          <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">
            {question.prompt}
          </h2>
        </div>

        {/* Textarea */}
        <div className="flex flex-col gap-2">
          <div className="relative">
            <textarea
              value={answer}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Write your answer here…"
              rows={5}
              className="w-full px-4 py-3 rounded-[8px] border border-border bg-[var(--surface-raised)] text-[14px] leading-[24px] text-foreground placeholder:text-muted-foreground resize-y outline-none focus:ring-2 transition-shadow duration-100"
              style={
                { "--tw-ring-color": "color-mix(in srgb, var(--primary) 30%, transparent)" } as React.CSSProperties
              }
            />
          </div>
          <div className="flex items-start justify-between gap-4">
            <p className="text-[12px] text-muted-foreground">
              Cover the key points in 2–3 sentences.
            </p>
            <span className="text-[11px] text-muted-foreground shrink-0 tabular-nums">
              {answer.length} characters
            </span>
          </div>
        </div>

        {/* Rubric hints */}
        <div className="flex flex-col gap-2 p-4 rounded-[10px] bg-[var(--surface-raised)] border border-border">
          <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
            Your answer should address
          </p>
          <ul className="flex flex-col gap-1">
            {question.rubricHints.map((hint, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-muted-foreground">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground shrink-0" />
                {hint}
              </li>
            ))}
          </ul>
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
