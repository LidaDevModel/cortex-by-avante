"use client";

import { useState } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  KCAttempt,
  KCQuestion,
  KCAnswer,
  KCMCAnswer,
  KCMatchingAnswer,
  KCBranchingAnswer,
} from "@/lib/knowledge-check-mock";
import { scoreQuestion, FORMAT_LABELS } from "@/lib/knowledge-check-mock";
import { useEffect } from "react";

/* ─── Helpers ─── */

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/* ─── Shared table primitives ─── */

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
  correct,
  total,
  children,
}: {
  label: string;
  correct: number;
  total: number;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-4 py-[10px] border-b border-border hover:bg-[color-mix(in_srgb,var(--surface-raised)_60%,transparent)] transition-colors duration-100"
      >
        <span className="flex-1 text-left text-[14px] text-foreground">{label}</span>
        <span
          className="w-10 text-right text-[14px] font-medium tabular-nums"
          style={{ color: correct === total ? "var(--primary)" : "var(--destructive)" }}
        >
          {correct}
        </span>
        <span className="w-10 text-right text-[14px] text-muted-foreground tabular-nums">{total}</span>
        <span className="w-5 flex justify-end text-muted-foreground">
          {open ? <ChevronUp size={14} strokeWidth={1.5} /> : <ChevronDown size={14} strokeWidth={1.5} />}
        </span>
      </button>
      {open && (
        <div className="border-b border-border bg-[var(--surface)] px-4 py-3">
          <div className="rounded-[8px] bg-[var(--surface-raised)] px-3 py-[14px] flex flex-col gap-4">
            {children ?? <p className="text-[13px] text-muted-foreground">All answers correct.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Wrong answer content per type ─── */

function MCWrong({ question, answer }: {
  question: Extract<KCQuestion, { type: "mc" }>;
  answer: KCMCAnswer;
}) {
  const userIdx = answer.selectedIndex;
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] font-medium text-foreground">{question.question}</span>
      <WrongAnswerRow>
        <span className={cn("text-[13px]", userIdx !== null ? "text-destructive" : "text-muted-foreground")}>
          Your answer: {userIdx !== null ? question.options[userIdx] : "Skipped"}
        </span>
        <span className="text-[13px]" style={{ color: "var(--primary)" }}>
          Correct answer: {question.options[question.correctIndex]}
        </span>
      </WrongAnswerRow>
    </div>
  );
}

function MatchingWrong({ question, answer }: {
  question: Extract<KCQuestion, { type: "matching" }>;
  answer: KCMatchingAnswer;
}) {
  const wrongPairs = question.pairs.filter((p) => answer.matches[p.id] !== p.id);
  if (wrongPairs.length === 0) return null;
  return (
    <>
      {wrongPairs.map((pair) => {
        const matchedId = answer.matches[pair.id];
        const matchedDef = question.pairs.find((p) => p.id === matchedId);
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
      })}
    </>
  );
}

function BranchingWrong({ question, answer }: {
  question: Extract<KCQuestion, { type: "branching" }>;
  answer: KCBranchingAnswer;
}) {
  const decisionNodes = question.nodes.filter((n) => n.type === "decision" && answer.decisions[n.id]);
  const wrongNodes = decisionNodes.filter((node) => {
    const chosenId = answer.decisions[node.id];
    return !node.options?.find((o) => o.id === chosenId)?.isCorrect;
  });
  if (wrongNodes.length === 0) return null;
  return (
    <>
      {wrongNodes.map((node) => {
        const chosenId = answer.decisions[node.id];
        const chosenOpt = node.options?.find((o) => o.id === chosenId);
        const correctOpt = node.options?.find((o) => o.isCorrect);
        return (
          <div key={node.id} className="flex flex-col gap-2">
            <span className="text-[13px] font-medium text-foreground">{node.label}</span>
            <WrongAnswerRow>
              <span className={cn("text-[13px]", chosenOpt ? "text-destructive" : "text-muted-foreground")}>
                Your choice: {chosenOpt?.text ?? "Not answered"}
              </span>
              <span className="text-[13px]" style={{ color: "var(--primary)" }}>
                Correct choice: {correctOpt?.text}
              </span>
            </WrongAnswerRow>
          </div>
        );
      })}
    </>
  );
}

/* ─── Score table (mirrors KCResults) ─── */

function ScoreTable({ questions, answers }: { questions: KCQuestion[]; answers: Record<string, KCAnswer> }) {
  const totalCorrect = questions.reduce((acc, q) => acc + scoreQuestion(q, answers[q.id]).correct, 0);
  const totalPoints = questions.reduce((acc, q) => acc + scoreQuestion(q, answers[q.id]).total, 0);

  const rows: { key: string; label: string; correct: number; total: number; content: React.ReactNode }[] = [];

  const mcQuestions = questions.filter((q): q is Extract<KCQuestion, { type: "mc" }> => q.type === "mc");
  if (mcQuestions.length > 0) {
    const correct = mcQuestions.reduce((acc, q) => acc + scoreQuestion(q, answers[q.id]).correct, 0);
    const total = mcQuestions.reduce((acc, q) => acc + scoreQuestion(q, answers[q.id]).total, 0);
    const wrong = mcQuestions.filter((q) => scoreQuestion(q, answers[q.id]).correct < scoreQuestion(q, answers[q.id]).total);
    rows.push({
      key: "mc",
      label: "Multiple choice",
      correct,
      total,
      content: wrong.length > 0
        ? wrong.map((q) => <MCWrong key={q.id} question={q} answer={(answers[q.id] as KCMCAnswer) ?? { type: "mc", selectedIndex: null }} />)
        : null,
    });
  }

  const matchingQuestions = questions.filter((q): q is Extract<KCQuestion, { type: "matching" }> => q.type === "matching");
  matchingQuestions.forEach((q, nth) => {
    const { correct, total } = scoreQuestion(q, answers[q.id]);
    const ans = (answers[q.id] as KCMatchingAnswer) ?? { type: "matching", matches: {} };
    rows.push({
      key: q.id,
      label: matchingQuestions.length > 1 ? `Matching ${nth + 1}` : "Matching",
      correct,
      total,
      content: correct < total ? <MatchingWrong question={q} answer={ans} /> : null,
    });
  });

  const branchingQuestions = questions.filter((q): q is Extract<KCQuestion, { type: "branching" }> => q.type === "branching");
  branchingQuestions.forEach((q, nth) => {
    const { correct, total } = scoreQuestion(q, answers[q.id]);
    const ans = (answers[q.id] as KCBranchingAnswer) ?? { type: "branching", decisions: {}, isCompleted: false };
    rows.push({
      key: q.id,
      label: branchingQuestions.length > 1 ? `Scenario ${nth + 1}` : "Scenario",
      correct,
      total,
      content: correct < total ? <BranchingWrong question={q} answer={ans} /> : null,
    });
  });

  return (
    <div className="rounded-[12px] border border-border overflow-hidden bg-[var(--surface)]">
      <div className="flex items-center gap-2 px-4 py-[10px] bg-[var(--surface-raised)] border-b border-border">
        <span className="flex-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Section</span>
        <span className="w-10 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Score</span>
        <span className="w-10 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Total</span>
        <span className="w-5" />
      </div>
      {rows.map((row) => (
        <SectionRow key={row.key} label={row.label} correct={row.correct} total={row.total}>
          {row.content}
        </SectionRow>
      ))}
      <div className="flex items-center gap-2 px-4 py-[13px] bg-[var(--surface-raised)]">
        <span className="flex-1 text-[14px] font-semibold text-foreground">Total</span>
        <span
          className="w-10 text-right text-[14px] font-bold tabular-nums"
          style={{ color: totalCorrect === totalPoints ? "var(--primary)" : "var(--destructive)" }}
        >
          {totalCorrect}
        </span>
        <span className="w-10 text-right text-[14px] font-medium text-muted-foreground tabular-nums">{totalPoints}</span>
        <span className="w-5" />
      </div>
    </div>
  );
}

/* ─── Modal ─── */

export function KCDetailModal({ attempt, onClose }: { attempt: KCAttempt; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const pct = attempt.total > 0 ? Math.round((attempt.score / attempt.total) * 100) : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "var(--scrim)" }}
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-[600px] max-h-[80vh] rounded-[12px] overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-border shrink-0">
          <div className="flex flex-col gap-0.5">
            <p className="text-[16px] leading-[24px] font-semibold text-foreground">
              Knowledge check — {formatDate(attempt.date)}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-[13px] leading-[20px] text-muted-foreground">
                {attempt.formats.map((f) => FORMAT_LABELS[f]).join(", ")}
              </span>
              <span
                className="text-[13px] leading-[20px] font-semibold tabular-nums"
                style={{ color: pct >= 70 ? "var(--primary)" : "var(--destructive)" }}
              >
                {attempt.score}/{attempt.total} · {pct}%
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-[8px] text-muted-foreground hover:text-foreground hover:bg-[var(--surface-raised)] transition-colors duration-100"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 scroll-thin">
          <ScoreTable questions={attempt.questions} answers={attempt.answers} />
        </div>
      </div>
    </div>
  );
}
