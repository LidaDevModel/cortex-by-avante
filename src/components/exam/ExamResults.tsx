"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExamObject } from "@/lib/exam-mock";

type SectionScore = {
  mc: number;
  matching: number;
  shortAnswer: number;
  branching: number;
};

type MCAnswer = { questionIndex: number; selectedIndex: number | null };
type MatchAnswer = Record<string, string>;
type BranchAnswer = Record<string, string>;

type Props = {
  exam: ExamObject;
  scores: SectionScore;
  mcAnswers: MCAnswer[];
  matchAnswers: MatchAnswer;
  shortAnswer: string;
  branchDecisions: BranchAnswer;
  onBack: () => void;
};

const PASS_THRESHOLD = 85;
const MAX_TOTAL = 100;

function WrongAnswerRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <div className="w-[2px] shrink-0 self-stretch rounded-full bg-border" />
      <div className="flex flex-col gap-1.5 min-w-0">{children}</div>
    </div>
  );
}

function SectionRow({
  label,
  score,
  max,
  children,
}: {
  label: string;
  score: number;
  max: number;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-4 py-[10px] border-b border-border hover:bg-[color-mix(in_srgb,var(--surface-raised)_60%,transparent)] transition-colors duration-100 cursor-pointer"
      >
        <span className="flex-1 text-left text-[14px] text-foreground">{label}</span>
        <span className="w-10 text-right text-[14px] font-medium text-foreground tabular-nums">{score}</span>
        <span className="w-10 text-right text-[14px] text-muted-foreground tabular-nums">{max}</span>
        <span className="w-5 flex justify-end text-muted-foreground">
          {open ? <ChevronUp size={14} strokeWidth={1.5} /> : <ChevronDown size={14} strokeWidth={1.5} />}
        </span>
      </button>

      {open && (
        <div className="border-b border-border bg-[var(--surface)] px-4 py-3">
          <div className="rounded-[8px] bg-[var(--surface-raised)] px-3 py-[14px] flex flex-col gap-4">
            {children ?? (
              <p className="text-[13px] text-muted-foreground">All answers correct.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function ExamResults({
  exam,
  scores,
  mcAnswers,
  matchAnswers,
  shortAnswer,
  branchDecisions,
  onBack,
}: Props) {
  const total = scores.mc + scores.matching + scores.shortAnswer + scores.branching;
  const passed = total >= PASS_THRESHOLD;

  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // MC wrong answers
  const mcWrong = exam.multipleChoice
    .map((q, qi) => {
      const answer = mcAnswers.find((a) => a.questionIndex === qi);
      const userIdx = answer?.selectedIndex ?? null;
      if (userIdx === q.correctIndex) return null;
      return { q, qi, userIdx };
    })
    .filter(Boolean) as { q: (typeof exam.multipleChoice)[0]; qi: number; userIdx: number | null }[];

  // Matching wrong pairs
  const matchWrong = exam.matching.pairs.filter((pair) => matchAnswers[pair.id] !== pair.id);

  // Branching wrong decisions
  const decisionNodes = exam.branching.nodes.filter((n) => n.type === "decision");
  const visitedDecisionNodes = decisionNodes.filter((n) => branchDecisions[n.id]);
  const branchWrong = visitedDecisionNodes.filter((node) => {
    const chosenId = branchDecisions[node.id];
    return !node.options?.find((o) => o.id === chosenId)?.isOptimal;
  });

  const shortAnswerWrong = scores.shortAnswer < 25;

  return (
    <div
      className="flex-1 overflow-y-auto scroll-thin"
      style={{
        maskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 48px), transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 48px), transparent 100%)",
      }}
    >
      <div
        className="max-w-[640px] mx-auto px-8 py-16 flex flex-col gap-10 animate-in fade-in duration-200"
        style={{ animationTimingFunction: "ease-out" }}
      >
        {/* Heading + score */}
        <div className="flex flex-col gap-3">
          <h1
            className="text-[36px] leading-[44px] font-bold"
            style={{ color: passed ? "var(--primary)" : "var(--foreground)" }}
          >
            {passed ? "Certified" : "Certification not awarded"}
          </h1>
          <div className="flex items-baseline gap-3">
            <span
              className="text-[48px] leading-none font-bold tabular-nums"
              style={{ color: passed ? "var(--primary)" : "var(--destructive)" }}
            >
              {total}
            </span>
            <span className="text-[20px] text-muted-foreground font-medium">/ {MAX_TOTAL}</span>
          </div>
          {passed ? (
            <p className="text-[14px] text-muted-foreground">
              Your certification has been recorded. Issued {today}.
            </p>
          ) : (
            <p className="text-[14px] text-muted-foreground">
              Passing score: {PASS_THRESHOLD}. Review the breakdown below and return to the module.
            </p>
          )}
        </div>

        {/* Score table with integrated accordion */}
        <div className="rounded-[12px] border border-border overflow-hidden bg-[var(--surface)]">
          {/* Header row */}
          <div className="flex items-center gap-2 px-4 py-[10px] bg-[var(--surface-raised)] border-b border-border">
            <span className="flex-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              Section
            </span>
            <span className="w-10 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              Score
            </span>
            <span className="w-10 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              Max
            </span>
            <span className="w-5" />
          </div>

          {/* Multiple choice */}
          <SectionRow label="Multiple choice" score={scores.mc} max={25}>
            {mcWrong.length > 0 ? (
              mcWrong.map(({ q, qi, userIdx }) => (
                <div key={q.id} className="flex flex-col gap-2">
                  <span className="text-[13px] font-medium text-foreground">
                    Q{qi + 1} — {q.question}
                  </span>
                  <WrongAnswerRow>
                    <span className={cn("text-[13px]", userIdx !== null ? "text-destructive" : "text-muted-foreground")}>
                      Your answer: {userIdx !== null ? q.options[userIdx] : "Skipped"}
                    </span>
                    <span className="text-[13px]" style={{ color: "var(--primary)" }}>
                      Correct answer: {q.options[q.correctIndex]}
                    </span>
                  </WrongAnswerRow>
                </div>
              ))
            ) : null}
          </SectionRow>

          {/* Matching */}
          <SectionRow label="Matching" score={scores.matching} max={25}>
            {matchWrong.length > 0 ? (
              matchWrong.map((pair) => {
                const matchedDefId = matchAnswers[pair.id];
                const matchedDef = exam.matching.pairs.find((p) => p.id === matchedDefId);
                return (
                  <div key={pair.id} className="flex flex-col gap-2">
                    <span className="text-[13px] font-medium text-foreground">{pair.term}</span>
                    <WrongAnswerRow>
                      <span className={cn("text-[13px]", matchedDef ? "text-destructive" : "text-muted-foreground")}>
                        Your match: {matchedDef ? matchedDef.definition : "Not matched"}
                      </span>
                      <span className="text-[13px]" style={{ color: "var(--primary)" }}>
                        Correct: {pair.definition}
                      </span>
                    </WrongAnswerRow>
                  </div>
                );
              })
            ) : null}
          </SectionRow>

          {/* Short answer */}
          <SectionRow label="Short answer" score={scores.shortAnswer} max={25}>
            {shortAnswerWrong ? (
              <div className="flex flex-col gap-2">
                <p className={cn("text-[13px]", shortAnswer.trim() ? "text-foreground" : "text-muted-foreground")}>
                  &ldquo;{shortAnswer || "No answer provided."}&rdquo;
                </p>
                <p className={cn("text-[13px]", shortAnswer.trim() ? "text-destructive" : "text-muted-foreground")}>
                  {exam.shortAnswer.aiJustification ?? "Your answer didn't fully address the required concepts."}
                </p>
              </div>
            ) : null}
          </SectionRow>

          {/* Branching scenario */}
          <SectionRow label="Branching scenario" score={scores.branching} max={25}>
            {branchWrong.length > 0 ? (
              branchWrong.map((node) => {
                const chosenId = branchDecisions[node.id];
                const chosenOption = node.options?.find((o) => o.id === chosenId);
                const optimalOption = node.options?.find((o) => o.isOptimal);
                return (
                  <div key={node.id} className="flex flex-col gap-2">
                    <span className="text-[13px] font-medium text-foreground">{node.label}</span>
                    <WrongAnswerRow>
                      <span className={cn("text-[13px]", chosenOption ? "text-destructive" : "text-muted-foreground")}>
                        Your choice: {chosenOption?.text ?? "Not answered"}
                      </span>
                      <span className="text-[13px]" style={{ color: "var(--primary)" }}>
                        Optimal choice: {optimalOption?.text}
                      </span>
                    </WrongAnswerRow>
                  </div>
                );
              })
            ) : null}
          </SectionRow>

          {/* Total row */}
          <div className="flex items-center gap-2 px-4 py-[13px] bg-[var(--surface-raised)]">
            <span className="flex-1 text-[14px] font-semibold text-foreground">Total</span>
            <span
              className={cn("w-10 text-right text-[14px] font-bold tabular-nums", passed ? "" : "text-destructive")}
              style={passed ? { color: "var(--primary)" } : undefined}
            >
              {total}
            </span>
            <span className="w-10 text-right text-[14px] font-medium text-muted-foreground tabular-nums">
              {MAX_TOTAL}
            </span>
            <span className="w-5" />
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onBack}
          className="w-full h-10 rounded-[8px] bg-[var(--primary)] text-[var(--primary-foreground)] text-[14px] font-medium hover:opacity-90 transition-opacity duration-100 cursor-pointer"
        >
          {passed ? "Back to training" : "Back to module"}
        </button>
      </div>
    </div>
  );
}
