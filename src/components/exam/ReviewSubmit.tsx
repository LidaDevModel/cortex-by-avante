"use client";

import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ExamSection } from "./ExamProgress";
import type {
  MCQuestion,
  MatchingExercise,
  ShortAnswerQuestion,
  BranchingScenario,
} from "@/lib/exam-mock";

type Props = {
  // MC
  mcQuestions: MCQuestion[];
  mcAnswers: { questionIndex: number; selectedIndex: number | null }[];
  // Matching
  matchingExercise: MatchingExercise;
  matchAnswers: Record<string, string>;
  // Short answer
  shortAnswerQuestion: ShortAnswerQuestion;
  shortAnswerText: string;
  // Branching
  branchingComplete: boolean;
  branchingScenario: BranchingScenario;
  branchingDecisions: Record<string, string>;
  onEditSection: (section: ExamSection) => void;
  onSubmit: () => void;
};

function SectionBlock({
  label,
  ok,
  status,
  section,
  onEdit,
  children,
}: {
  label: string;
  ok: boolean;
  status: string;
  section?: ExamSection;
  onEdit?: () => void;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-[12px] border border-border overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--surface-raised)]">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-medium text-foreground">{label}</span>
          <span className={cn("text-[12px]", ok ? "text-muted-foreground" : "text-destructive")}>
            {status}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {section && onEdit && (
            <button
              onClick={onEdit}
              className="text-[13px] font-medium text-[var(--primary)] hover:opacity-70 transition-opacity duration-100 cursor-pointer"
            >
              Edit
            </button>
          )}
          {children && (
            <button
              onClick={() => setOpen((o) => !o)}
              className="text-muted-foreground hover:text-foreground transition-colors duration-100 cursor-pointer"
            >
              {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* Expandable answers */}
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

function MiniMap({
  scenario,
  decisions,
}: {
  scenario: BranchingScenario;
  decisions: Record<string, string>;
}) {
  const W = 200;
  const H = 50;
  const nodeIds = scenario.nodes.map((n) => n.id);
  const total = nodeIds.length;
  const R = 8;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      {nodeIds.slice(0, -1).map((id, i) => {
        const x1 = (W / (total + 1)) * (i + 1) + R;
        const x2 = (W / (total + 1)) * (i + 2) - R;
        const y = H / 2;
        return (
          <line
            key={`e-${id}`}
            x1={x1} y1={y} x2={x2} y2={y}
            stroke={decisions[id] ? "var(--primary)" : "var(--border)"}
            strokeWidth={1.5}
          />
        );
      })}
      {nodeIds.map((id, i) => {
        const node = scenario.nodes[i];
        const x = (W / (total + 1)) * (i + 1);
        const y = H / 2;
        const visited = !!decisions[id];
        if (node.type === "end") {
          const s = R * 1.1;
          return (
            <polygon
              key={id}
              points={`${x},${y - s} ${x + s},${y} ${x},${y + s} ${x - s},${y}`}
              fill={visited ? "color-mix(in srgb, var(--primary) 20%, var(--surface-raised))" : "var(--surface-raised)"}
              stroke="var(--border)" strokeWidth={1}
            />
          );
        }
        return (
          <circle
            key={id} cx={x} cy={y} r={R}
            fill={visited ? "color-mix(in srgb, var(--primary) 20%, var(--surface-raised))" : "var(--surface-raised)"}
            stroke={visited ? "var(--primary)" : "var(--border)"}
            strokeWidth={1.5}
          />
        );
      })}
    </svg>
  );
}

export function ReviewSubmit({
  mcQuestions,
  mcAnswers,
  matchingExercise,
  matchAnswers,
  shortAnswerQuestion,
  shortAnswerText,
  branchingComplete,
  branchingScenario,
  branchingDecisions,
  onEditSection,
  onSubmit,
}: Props) {
  const mcAnswered = new Set(
    mcAnswers.filter((a) => a.selectedIndex !== null).map((a) => a.questionIndex)
  );
  const matchingComplete = Object.keys(matchAnswers).length === matchingExercise.pairs.length;
  const shortAnswerAnswered = shortAnswerText.trim().length > 0;

  const hasSkipped =
    mcAnswered.size < mcQuestions.length || !matchingComplete || !shortAnswerAnswered;

  const decisionNodes = branchingScenario.nodes.filter((n) => n.type === "decision");
  const confirmedCount = decisionNodes.filter((n) => branchingDecisions[n.id]).length;
  const branchingHasUnconfirmed = !branchingComplete && confirmedCount > 0;

  return (
    <div className="flex-1 overflow-y-auto scroll-thin" style={{ maskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 48px), transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 48px), transparent 100%)" }}>
      <div
        className="max-w-[640px] mx-auto px-8 py-12 flex flex-col gap-6 animate-in fade-in duration-200"
        style={{ animationTimingFunction: "ease-out" }}
      >
        <div className="flex flex-col gap-1">
          <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">
            Review your answers
          </h2>
          <p className="text-[14px] text-muted-foreground">
            Check each section before submitting.
          </p>
        </div>

        {/* Multiple choice */}
        <SectionBlock
          label="Multiple choice"
          ok={mcAnswered.size === mcQuestions.length}
          status={`${mcAnswered.size} of ${mcQuestions.length} answered`}
          section="mc"
          onEdit={() => onEditSection("mc")}
        >
          {mcQuestions.map((q, i) => {
            const answer = mcAnswers.find((a) => a.questionIndex === i);
            const selected = answer?.selectedIndex ?? null;
            return (
              <div key={q.id} className="flex flex-col gap-1">
                <span className="text-[12px] text-muted-foreground">Q{i + 1} — {q.question}</span>
                <span
                  className={cn(
                    "text-[13px] font-medium pl-2 border-l-2",
                    selected !== null
                      ? "text-[var(--primary)] border-[var(--primary)]"
                      : "text-muted-foreground border-[#DEE7E4]"
                  )}
                >
                  {selected !== null ? q.options[selected] : "Not answered"}
                </span>
              </div>
            );
          })}
        </SectionBlock>

        {/* Matching */}
        <SectionBlock
          label="Matching"
          ok={matchingComplete}
          status={matchingComplete ? "All pairs matched" : `${Object.keys(matchAnswers).length} of ${matchingExercise.pairs.length} matched`}
          section="matching"
          onEdit={() => onEditSection("matching")}
        >
          {matchingExercise.pairs.map((pair) => {
            const matchedDefId = matchAnswers[pair.id];
            const matchedDef = matchingExercise.pairs.find((p) => p.id === matchedDefId);
            return (
              <div key={pair.id} className="flex items-start gap-2">
                <span className="text-[12px] text-muted-foreground shrink-0 w-[200px]">{pair.term}</span>
                <span
                  className={cn(
                    "text-[13px] font-medium pl-2 border-l-2 min-w-0",
                    matchedDef
                      ? "text-[var(--primary)] border-[var(--primary)]"
                      : "text-muted-foreground border-[#DEE7E4]"
                  )}
                >
                  {matchedDef ? matchedDef.definition : "Not matched"}
                </span>
              </div>
            );
          })}
        </SectionBlock>

        {/* Short answer */}
        <SectionBlock
          label="Short answer"
          ok={shortAnswerAnswered}
          status={shortAnswerAnswered ? "Answered" : "Skipped"}
          section="shortAnswer"
          onEdit={() => onEditSection("shortAnswer")}
        >
          <p className="text-[12px] text-muted-foreground">{shortAnswerQuestion.prompt}</p>
          <p
            className={cn(
              "text-[13px] font-medium pl-2 border-l-2",
              shortAnswerAnswered
                ? "text-[var(--primary)] border-[var(--primary)]"
                : "text-muted-foreground border-[#DEE7E4]"
            )}
          >
            {shortAnswerAnswered ? shortAnswerText : "No answer provided"}
          </p>
        </SectionBlock>

        {/* Branching */}
        <SectionBlock
          label="Branching scenario"
          ok={branchingComplete}
          status={
            branchingComplete
              ? "Completed"
              : branchingHasUnconfirmed
              ? `${confirmedCount} of ${decisionNodes.length} decisions made`
              : "Not reached"
          }
          section={branchingHasUnconfirmed ? "branching" : undefined}
          onEdit={branchingHasUnconfirmed ? () => onEditSection("branching") : undefined}
        >
          {branchingComplete ? (
            <>
              <MiniMap scenario={branchingScenario} decisions={branchingDecisions} />
              <div className="flex flex-col gap-2 mt-1">
                {decisionNodes.map((node) => {
                  const chosenId = branchingDecisions[node.id];
                  const chosenOption = node.options?.find((o) => o.id === chosenId);
                  return (
                    <div key={node.id} className="flex flex-col gap-0.5">
                      <span className="text-[12px] text-muted-foreground">{node.label}</span>
                      <span
                        className={cn(
                          "text-[13px] font-medium pl-2 border-l-2",
                          chosenOption
                            ? "text-[var(--primary)] border-[var(--primary)]"
                            : "text-muted-foreground border-[#DEE7E4]"
                        )}
                      >
                        {chosenOption ? chosenOption.text : "No decision made"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-[13px] text-muted-foreground italic">
              You haven&apos;t reached this section yet.
            </p>
          )}
        </SectionBlock>

        {/* Submit */}
        <div className="flex flex-col gap-3 pt-2">
          {hasSkipped && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-[8px] bg-[color-mix(in_srgb,var(--destructive)_8%,transparent)] border border-[color-mix(in_srgb,var(--destructive)_20%,transparent)]">
              <AlertCircle size={14} color="var(--destructive)" />
              <p className="text-[13px] text-destructive">
                You have unanswered questions.
              </p>
            </div>
          )}
          <button
            onClick={onSubmit}
            className="w-full h-10 rounded-[8px] bg-[var(--primary)] text-[var(--primary-foreground)] text-[14px] font-medium hover:opacity-90 transition-opacity duration-100 cursor-pointer"
          >
            {hasSkipped ? "Submit anyway" : "Submit exam"}
          </button>
        </div>
      </div>
    </div>
  );
}
