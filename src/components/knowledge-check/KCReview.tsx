"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KCQuestion, KCAnswer, KCMCAnswer, KCMatchingAnswer, KCBranchingAnswer } from "@/lib/knowledge-check-mock";
import { Button } from "@/components/ui/button";

type Props = {
  questions: KCQuestion[];
  answers: Record<string, KCAnswer>;
  onJumpTo: (index: number) => void;
  onSubmit: () => void;
  onBack: () => void;
};

function SectionBlock({
  label,
  ok,
  status,
  onEdit,
  children,
}: {
  label: string;
  ok: boolean;
  status: string;
  onEdit?: () => void;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-[12px] border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--surface-raised)]">
        <div className="flex items-center gap-2">
          <span className="type-label font-medium text-foreground">{label}</span>
          <span className={cn("type-caption", ok ? "text-muted-foreground" : "text-destructive")}>
            {status}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {onEdit && (
            <button
              onClick={onEdit}
              className="type-meta font-medium text-[var(--primary)] hover:opacity-70 transition-opacity duration-100"
            >
              Edit
            </button>
          )}
          {children && (
            <button
              onClick={() => setOpen((o) => !o)}
              className="text-muted-foreground hover:text-foreground transition-colors duration-100"
            >
              {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
      </div>
      {children && open && (
        <div className="border-t border-border bg-[var(--surface)] px-4 py-3">
          <div className="rounded-[8px] bg-[var(--surface-raised)] px-3 py-[14px] flex flex-col gap-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export function KCReview({ questions, answers, onJumpTo, onSubmit, onBack }: Props) {
  // Group questions by type preserving order
  type Group = { type: string; indices: number[] };
  const groups: Group[] = [];
  questions.forEach((q, i) => {
    const last = groups[groups.length - 1];
    if (last && last.type === q.type) last.indices.push(i);
    else groups.push({ type: q.type, indices: [i] });
  });

  const unansweredCount = questions.filter((q, i) => {
    const ans = answers[q.id];
    if (!ans) return true;
    if (q.type === "mc") return (ans as KCMCAnswer).selectedIndex === null;
    if (q.type === "matching") return Object.keys((ans as KCMatchingAnswer).matches ?? {}).length === 0;
    if (q.type === "branching") return !(ans as KCBranchingAnswer).isCompleted;
    return true;
  }).length;

  return (
    <div className="flex flex-col gap-6 py-8">
      <div className="flex flex-col gap-1">
        <h2 className="type-h2 font-semibold text-foreground">Review your answers</h2>
        <p className="type-label text-muted-foreground">
          Check each section before submitting.
        </p>
      </div>

      {groups.map((g) => {
        const firstIdx = g.indices[0];

        if (g.type === "mc") {
          const answered = g.indices.filter((i) => {
            const ans = answers[questions[i].id] as KCMCAnswer | undefined;
            return ans?.selectedIndex !== null && ans?.selectedIndex !== undefined;
          }).length;
          return (
            <SectionBlock
              key="mc"
              label="Multiple choice"
              ok={answered === g.indices.length}
              status={`${answered} of ${g.indices.length} answered`}
              onEdit={() => onJumpTo(firstIdx)}
            >
              {g.indices.map((i) => {
                const q = questions[i] as Extract<KCQuestion, { type: "mc" }>;
                const ans = answers[q.id] as KCMCAnswer | undefined;
                const selected = ans?.selectedIndex ?? null;
                return (
                  <div key={q.id} className="flex flex-col gap-1">
                    <span className="type-caption text-muted-foreground">Q{i + 1} — {q.question}</span>
                    <span
                      className={cn(
                        "type-meta font-medium pl-2 border-l-2",
                        selected !== null
                          ? "text-[var(--primary)] border-[var(--primary)]"
                          : "text-muted-foreground border-[var(--border)]"
                      )}
                    >
                      {selected !== null ? q.options[selected] : "Not answered"}
                    </span>
                  </div>
                );
              })}
            </SectionBlock>
          );
        }

        if (g.type === "matching") {
          return g.indices.map((i, nth) => {
            const q = questions[i] as Extract<KCQuestion, { type: "matching" }>;
            const ans = answers[q.id] as KCMatchingAnswer | undefined;
            const matches = ans?.matches ?? {};
            const matched = q.pairs.filter((p) => matches[p.id]).length;
            const allMatched = matched === q.pairs.length;
            const label = g.indices.length > 1 ? `Matching ${nth + 1}` : "Matching";
            return (
              <SectionBlock
                key={q.id}
                label={label}
                ok={allMatched}
                status={allMatched ? "All pairs matched" : `${matched} of ${q.pairs.length} matched`}
                onEdit={() => onJumpTo(i)}
              >
                {q.pairs.map((pair) => {
                  const matchedId = matches[pair.id];
                  const matchedDef = q.pairs.find((p) => p.id === matchedId);
                  return (
                    // Term over matched definition — same stacked shape as the
                    // MC and branching review rows, so all three read alike and
                    // the definition gets full width on narrow screens.
                    <div key={pair.id} className="flex flex-col gap-0.5">
                      <span className="type-caption text-muted-foreground">{pair.term}</span>
                      <span
                        className={cn(
                          "type-meta font-medium pl-2 border-l-2",
                          matchedDef
                            ? "text-[var(--primary)] border-[var(--primary)]"
                            : "text-muted-foreground border-[var(--border)]"
                        )}
                      >
                        {matchedDef ? matchedDef.definition : "Not matched"}
                      </span>
                    </div>
                  );
                })}
              </SectionBlock>
            );
          });
        }

        if (g.type === "branching") {
          return g.indices.map((i, nth) => {
            const q = questions[i] as Extract<KCQuestion, { type: "branching" }>;
            const ans = answers[q.id] as KCBranchingAnswer | undefined;
            const isCompleted = ans?.isCompleted ?? false;
            const decisions = ans?.decisions ?? {};
            const decisionNodes = q.nodes.filter((n) => n.type === "decision");
            const visitedNodes = decisionNodes.filter((n) => decisions[n.id]);
            const decided = visitedNodes.length;
            return (
              <SectionBlock
                key={q.id}
                label={`Scenario ${nth + 1}`}
                ok={isCompleted}
                status={isCompleted ? "Completed" : decided > 0 ? `${3 - decided} decision${3 - decided !== 1 ? "s" : ""} still to make` : "Not started"}
                onEdit={isCompleted ? undefined : () => onJumpTo(i)}
              >
                {isCompleted ? (
                  <div className="flex flex-col gap-2">
                    {visitedNodes.map((node) => {
                      const chosenId = decisions[node.id];
                      const chosenOption = node.options?.find((o) => o.id === chosenId);
                      return (
                        <div key={node.id} className="flex flex-col gap-0.5">
                          <span className="type-caption text-muted-foreground">{node.label}</span>
                          <span
                            className={cn(
                              "type-meta font-medium pl-2 border-l-2",
                              chosenOption
                                ? "text-[var(--primary)] border-[var(--primary)]"
                                : "text-muted-foreground border-[var(--border)]"
                            )}
                          >
                            {chosenOption ? chosenOption.text : "No decision made"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="type-meta text-muted-foreground italic">
                    {decided > 0 ? "Scenario not yet completed." : "You haven't reached this section yet."}
                  </p>
                )}
              </SectionBlock>
            );
          });
        }

        return null;
      })}

      {/* Submit */}
      <div className="flex flex-col gap-3 pt-2">
        {unansweredCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-[8px] bg-[color-mix(in_srgb,var(--destructive)_8%,transparent)] border border-[color-mix(in_srgb,var(--destructive)_20%,transparent)]">
            <AlertCircle size={14} color="var(--destructive)" />
            <p className="type-meta text-destructive">
              {unansweredCount} question{unansweredCount !== 1 ? "s" : ""} unanswered. Skipped questions count as incorrect.
            </p>
          </div>
        )}
        <Button size="cta" onClick={onSubmit}>
          {unansweredCount > 0 ? "Submit anyway" : "Submit"}
        </Button>
        <Button size="cta" variant="outline" onClick={onBack}>
          Back to questions
        </Button>
      </div>
    </div>
  );
}
