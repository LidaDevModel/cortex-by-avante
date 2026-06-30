"use client";

import type { KCQuestion, KCAnswer } from "@/lib/knowledge-check-mock";
import { scoreQuestion } from "@/lib/knowledge-check-mock";

type Props = {
  questions: KCQuestion[];
  answers: Record<string, KCAnswer>;
  onJumpTo: (index: number) => void;
  onSubmit: () => void;
  onBack: () => void;
};

function questionLabel(q: KCQuestion, index: number): string {
  if (q.type === "mc") return `Question ${index + 1}`;
  if (q.type === "matching") return "Matching exercise";
  return "Scenario";
}

function answerSummary(q: KCQuestion, answer: KCAnswer | undefined): { label: string; answered: boolean } {
  if (!answer) return { label: "Skipped", answered: false };

  if (q.type === "mc" && answer.type === "mc") {
    if (answer.selectedIndex === null) return { label: "Skipped", answered: false };
    return { label: q.options[answer.selectedIndex], answered: true };
  }

  if (q.type === "matching" && answer.type === "matching") {
    const matched = q.pairs.filter((p) => answer.matches[p.id]).length;
    if (matched === 0) return { label: "Not started", answered: false };
    if (matched < q.pairs.length) return { label: `${matched} of ${q.pairs.length} pairs matched`, answered: true };
    return { label: "All pairs matched", answered: true };
  }

  if (q.type === "branching" && answer.type === "branching") {
    if (!answer.isCompleted) return { label: "Not completed", answered: false };
    const decided = Object.keys(answer.decisions).length;
    const total = q.nodes.filter(n => n.type === "decision").length;
    return { label: `${decided} of ${total} decisions made`, answered: true };
  }

  return { label: "Skipped", answered: false };
}

export function KCReview({ questions, answers, onJumpTo, onSubmit, onBack }: Props) {
  const unansweredCount = questions.filter((q) => {
    const ans = answers[q.id];
    return !answerSummary(q, ans).answered;
  }).length;

  return (
    <div className="flex flex-col gap-6 max-w-[600px] mx-auto py-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">Review your answers</h2>
        <p className="text-[14px] leading-[20px] text-muted-foreground">
          Check your answers before submitting. You can still go back and change them.
        </p>
      </div>

      {/* Question list */}
      <div
        className="flex flex-col rounded-[12px] overflow-hidden"
        style={{ border: "1px solid var(--border)" }}
      >
        {questions.map((q, i) => {
          const ans = answers[q.id];
          const { label, answered } = answerSummary(q, ans);
          return (
            <div
              key={q.id}
              className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border last:border-0"
              style={{ background: "var(--surface-raised)" }}
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <p className="text-[13px] leading-[20px] font-medium text-foreground">
                  {questionLabel(q, i)}
                </p>
                <p
                  className="text-[12px] leading-[16px] truncate"
                  style={{ color: answered ? "var(--muted-foreground)" : "var(--destructive)" }}
                >
                  {label}
                </p>
              </div>
              <button
                onClick={() => onJumpTo(i)}
                className="shrink-0 text-[12px] leading-[16px] font-medium transition-opacity duration-100 hover:opacity-70"
                style={{ color: "var(--primary)" }}
              >
                Edit
              </button>
            </div>
          );
        })}
      </div>

      {/* Unanswered warning */}
      {unansweredCount > 0 && (
        <p className="text-[13px] leading-[20px] text-muted-foreground">
          {unansweredCount} question{unansweredCount !== 1 ? "s" : ""} unanswered. You can submit anyway — skipped questions count as incorrect.
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <button
          onClick={onSubmit}
          className="h-[40px] rounded-[8px] text-[14px] leading-[20px] font-semibold transition-opacity duration-100 hover:opacity-90"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          {unansweredCount > 0 ? "Submit anyway" : "Submit"}
        </button>
        <button
          onClick={onBack}
          className="h-[40px] rounded-[8px] border text-[14px] leading-[20px] font-semibold transition-colors duration-100"
          style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
        >
          Back to questions
        </button>
      </div>
    </div>
  );
}
