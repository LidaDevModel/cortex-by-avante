"use client";

import type { KCQuestion, KCAnswer } from "@/lib/knowledge-check-mock";
import { scoreQuestion } from "@/lib/knowledge-check-mock";
import { KCScoreTable } from "./KCScoreTable";
import { Button } from "@/components/ui/button";

export function KCResults({
  questions,
  answers,
  onTryAnother,
  onBack,
}: {
  questions: KCQuestion[];
  answers: Record<string, KCAnswer>;
  onTryAnother: () => void;
  onBack: () => void;
}) {
  const totalCorrect = questions.reduce((acc, q) => acc + scoreQuestion(q, answers[q.id]).correct, 0);
  const totalPoints = questions.reduce((acc, q) => acc + scoreQuestion(q, answers[q.id]).total, 0);
  const pct = totalPoints > 0 ? Math.round((totalCorrect / totalPoints) * 100) : 0;

  return (
    <div
      className="max-w-[640px] mx-auto py-16 flex flex-col gap-10 animate-in fade-in duration-200"
      style={{ animationTimingFunction: "ease-out" }}
    >
      {/* Heading + score */}
      <div className="flex flex-col gap-3">
        <h1
          className="text-[28px] leading-[36px] sm:text-[36px] sm:leading-[44px] font-bold"
          style={{ color: pct === 100 ? "var(--success)" : "var(--foreground)" }}
        >
          {pct === 100 ? "Perfect score" : "Knowledge check complete"}
        </h1>
        <div className="flex items-baseline gap-3">
          <span
            className="text-[40px] sm:text-[48px] leading-none font-bold tabular-nums"
            style={{ color: pct >= 70 ? "var(--success)" : "var(--destructive)" }}
          >
            {pct}%
          </span>
          <span className="text-[18px] sm:text-[20px] text-muted-foreground font-medium">
            {totalCorrect} of {totalPoints} correct
          </span>
        </div>
      </div>

      {/* Score table */}
      <KCScoreTable questions={questions} answers={answers} />

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <Button size="cta" onClick={onTryAnother}>
          Try another
        </Button>
        <Button size="cta" variant="outline" onClick={onBack}>
          Back to knowledge check
        </Button>
      </div>
    </div>
  );
}
