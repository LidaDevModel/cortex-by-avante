"use client";

import { ExternalLink, Check, X } from "lucide-react";
import type {
  KCAttempt,
  KCQuestion,
  KCAnswer,
  KCMCAnswer,
  KCMatchingAnswer,
  KCBranchingAnswer,
} from "@/lib/knowledge-check-mock";
import { scoreQuestion } from "@/lib/knowledge-check-mock";
import Link from "next/link";

/* ─── Helpers ─── */

function SourceLink({ doc, section }: { doc: string; section: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[12px] leading-[16px] font-medium"
      style={{ color: "var(--primary)" }}
    >
      <ExternalLink size={11} strokeWidth={2} />
      {doc} · {section}
    </span>
  );
}

/* ─── Wrong answer breakdowns ─── */

function MCBreakdown({
  question,
  answer,
}: {
  question: Extract<KCQuestion, { type: "mc" }>;
  answer: KCMCAnswer;
}) {
  const userOpt = answer.selectedIndex !== null ? question.options[answer.selectedIndex] : null;
  const correctOpt = question.options[question.correctIndex];

  return (
    <div className="flex flex-col gap-2 py-3 border-b border-border last:border-0">
      <p className="text-[14px] leading-[20px] font-medium text-foreground">{question.question}</p>
      <div className="flex flex-col gap-1">
        {userOpt && answer.selectedIndex !== question.correctIndex && (
          <div className="flex items-center gap-2 text-[13px] leading-[20px]">
            <X size={13} strokeWidth={2.5} className="shrink-0" style={{ color: "var(--destructive)" }} />
            <span className="text-muted-foreground line-through">{userOpt}</span>
          </div>
        )}
        {!userOpt && (
          <p className="text-[12px] leading-[16px] text-muted-foreground italic">Skipped</p>
        )}
        <div className="flex items-center gap-2 text-[13px] leading-[20px]">
          <Check size={13} strokeWidth={2.5} className="shrink-0" style={{ color: "var(--primary)" }} />
          <span style={{ color: "var(--primary)" }}>{correctOpt}</span>
        </div>
      </div>
      <SourceLink doc={question.sourceDoc} section={question.sourceSection} />
    </div>
  );
}

function MatchingBreakdown({
  question,
  answer,
}: {
  question: Extract<KCQuestion, { type: "matching" }>;
  answer: KCMatchingAnswer;
}) {
  const wrongPairs = question.pairs.filter((p) => answer.matches[p.id] !== p.id);
  if (wrongPairs.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 py-3 border-b border-border last:border-0">
      <p className="text-[14px] leading-[20px] font-medium text-foreground">{question.instruction}</p>
      <div className="flex flex-col gap-1.5">
        {wrongPairs.map((pair) => {
          const userMatchId = answer.matches[pair.id];
          const userMatch = question.pairs.find((p) => p.id === userMatchId);
          return (
            <div key={pair.id} className="flex flex-col gap-0.5 pl-2" style={{ borderLeft: "2px solid var(--border)" }}>
              <p className="text-[13px] leading-[20px] font-medium text-foreground">{pair.term}</p>
              {userMatch && (
                <p className="text-[12px] leading-[16px] text-muted-foreground line-through">
                  {userMatch.definition}
                </p>
              )}
              {!userMatch && (
                <p className="text-[12px] leading-[16px] text-muted-foreground italic">Not matched</p>
              )}
              <p className="text-[12px] leading-[16px]" style={{ color: "var(--primary)" }}>
                {pair.definition}
              </p>
            </div>
          );
        })}
      </div>
      <SourceLink doc={question.sourceDoc} section={question.sourceSection} />
    </div>
  );
}

function BranchingBreakdown({
  question,
  answer,
}: {
  question: Extract<KCQuestion, { type: "branching" }>;
  answer: KCBranchingAnswer;
}) {
  const decisionNodes = question.nodes.filter(n => n.type === "decision");

  return (
    <div className="flex flex-col gap-4 py-3">
      {decisionNodes.map((node, i) => {
        const chosenId = answer.decisions[node.id];
        const chosenOpt = node.options?.find(o => o.id === chosenId);
        const correctOpt = node.options?.find(o => o.isCorrect);
        const isCorrect = chosenId && chosenOpt?.isCorrect;

        return (
          <div key={node.id} className="flex flex-col gap-2 pb-3 border-b border-border last:border-0">
            <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">Decision {i + 1}</p>
            <p className="text-[14px] leading-[20px] font-medium text-foreground">{node.scenarioText}</p>
            <div className="flex flex-col gap-1">
              {!chosenOpt && (
                <p className="text-[12px] leading-[16px] text-muted-foreground italic">Not decided</p>
              )}
              {chosenOpt && !isCorrect && (
                <div className="flex items-start gap-2 text-[13px] leading-[20px]">
                  <X size={13} strokeWidth={2.5} className="mt-0.5 shrink-0" style={{ color: "var(--destructive)" }} />
                  <span className="text-muted-foreground line-through">{chosenOpt.text}</span>
                </div>
              )}
              {correctOpt && (
                <div className="flex items-start gap-2 text-[13px] leading-[20px]">
                  <Check size={13} strokeWidth={2.5} className="mt-0.5 shrink-0" style={{ color: "var(--primary)" }} />
                  <span style={{ color: "var(--primary)" }}>{correctOpt.text}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
      <SourceLink doc={question.sourceDoc} section={question.sourceSection} />
    </div>
  );
}

/* ─── Main results component ─── */

export function KCResults({
  questions,
  answers,
  onTryAnother,
}: {
  questions: KCQuestion[];
  answers: Record<string, KCAnswer>;
  onTryAnother: () => void;
}) {
  const totalCorrect = questions.reduce((acc, q) => acc + scoreQuestion(q, answers[q.id]).correct, 0);
  const totalPoints = questions.reduce((acc, q) => acc + scoreQuestion(q, answers[q.id]).total, 0);
  const pct = totalPoints > 0 ? Math.round((totalCorrect / totalPoints) * 100) : 0;

  const wrongQuestions = questions.filter((q) => {
    const { correct, total } = scoreQuestion(q, answers[q.id]);
    return correct < total;
  });

  return (
    <div className="flex flex-col gap-8 max-w-[600px] mx-auto py-8">
      {/* Score */}
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-[13px] leading-[20px] font-medium text-muted-foreground uppercase tracking-wider">
          Knowledge check complete
        </p>
        <p
          className="text-[56px] leading-none font-bold"
          style={{ fontVariantNumeric: "tabular-nums", color: "var(--primary)" }}
        >
          {pct}%
        </p>
        <p className="text-[15px] leading-[24px] text-muted-foreground">
          {totalCorrect} of {totalPoints} points
        </p>
      </div>

      {/* Breakdown: always visible */}
      {wrongQuestions.length === 0 ? (
        <div
          className="flex flex-col items-center gap-2 py-8 rounded-[12px] text-center"
          style={{ background: "color-mix(in srgb, var(--primary) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--primary) 20%, transparent)" }}
        >
          <Check size={24} strokeWidth={2} style={{ color: "var(--primary)" }} />
          <p className="text-[15px] leading-[24px] font-semibold" style={{ color: "var(--primary)" }}>
            All correct
          </p>
          <p className="text-[13px] leading-[20px] text-muted-foreground">
            You answered every question correctly.
          </p>
        </div>
      ) : (
        <div
          className="flex flex-col rounded-[12px] overflow-hidden"
          style={{ border: "1px solid var(--border)", background: "var(--surface-raised)" }}
        >
          <div className="px-4 py-3 border-b border-border">
            <p className="text-[13px] leading-[20px] font-semibold text-foreground">
              Review — {wrongQuestions.length} to revisit
            </p>
          </div>
          <div className="px-4">
            {wrongQuestions.map((q) => {
              const ans = answers[q.id] as KCAnswer | undefined;
              if (q.type === "mc")
                return <MCBreakdown key={q.id} question={q} answer={(ans as KCMCAnswer) ?? { type: "mc", selectedIndex: null }} />;
              if (q.type === "matching")
                return <MatchingBreakdown key={q.id} question={q} answer={(ans as KCMatchingAnswer) ?? { type: "matching", matches: {} }} />;
              if (q.type === "branching")
                return <BranchingBreakdown key={q.id} question={q} answer={(ans as KCBranchingAnswer) ?? { type: "branching", decisions: {}, isCompleted: false }} />;
              return null;
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <button
          onClick={onTryAnother}
          className="h-[40px] rounded-[8px] text-[14px] leading-[20px] font-semibold transition-opacity duration-100 hover:opacity-90"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          Try another
        </button>
        <Link
          href="/training/modules"
          className="flex items-center justify-center h-[40px] rounded-[8px] border text-[14px] leading-[20px] font-semibold transition-colors duration-100"
          style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
        >
          Back to training
        </Link>
      </div>
    </div>
  );
}
