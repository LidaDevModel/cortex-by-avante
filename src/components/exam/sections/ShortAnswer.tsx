"use client";

import type { ShortAnswerQuestion } from "@/lib/exam-mock";
import { Button } from "@/components/ui/button";

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
        className="container-read py-12 flex flex-col gap-8 animate-in fade-in duration-200"
        style={{ animationTimingFunction: "ease-out" }}
      >
        {/* Question */}
        <div className="flex flex-col gap-1">
          <span className="type-caption font-medium text-muted-foreground uppercase tracking-wider">
            Short answer
          </span>
          <h2 id={`sa-prompt-${question.id}`} className="type-h2 font-semibold text-foreground">
            {question.prompt}
          </h2>
        </div>

        {/* Textarea */}
        <div className="flex flex-col gap-2">
          <div className="relative">
            <textarea
              value={answer}
              onChange={(e) => onChange(e.target.value)}
              // The question is the field's label, and the guidance below is its
              // description — without these the field announced as unlabelled
              // and the prompt was unreachable from it.
              aria-labelledby={`sa-prompt-${question.id}`}
              aria-describedby={`sa-hint-${question.id}`}
              placeholder="Write your answer here…"
              rows={5}
              className="w-full px-4 py-3 rounded-[8px] border border-input bg-[var(--surface-raised)] type-body text-foreground placeholder:text-muted-foreground resize-y outline-none focus:ring-2 transition-shadow duration-100"
              style={
                { "--tw-ring-color": "color-mix(in srgb, var(--primary) 30%, transparent)" } as React.CSSProperties
              }
            />
          </div>
          {/* The character count is gone: there is no limit to count against,
              so it reported a number the candidate could not act on — and it
              read as a constraint that does not exist. The guidance stays, and
              is now the field's description. */}
          <p id={`sa-hint-${question.id}`} className="type-caption text-muted-foreground">
            Cover the key points in 2–3 sentences.
          </p>
        </div>

        {/* Rubric hints */}
        <div className="flex flex-col gap-2 p-4 rounded-[10px] bg-[var(--surface-raised)] border border-border">
          <p className="type-caption font-semibold text-muted-foreground uppercase tracking-wider">
            Your answer should address
          </p>
          <ul className="flex flex-col gap-1">
            {question.rubricHints.map((hint, i) => (
              <li key={i} className="flex items-start gap-2 type-meta text-muted-foreground">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground shrink-0" />
                {hint}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-2">
          <Button size="cta" onClick={onNext}>
            Next →
          </Button>
        </div>
      </div>
    </div>
  );
}
