"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell, TableFooter } from "@/components/ui/table";
import type {
  KCQuestion,
  KCAnswer,
  KCMCAnswer,
  KCMatchingAnswer,
  KCBranchingAnswer,
} from "@/lib/knowledge-check-mock";
import { scoreQuestion } from "@/lib/knowledge-check-mock";

/* ─── Primitives ─── */

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
      <TableRow onClick={() => setOpen((o) => !o)}>
        <TableCell className="flex-1 text-left">{label}</TableCell>
        <TableCell
          className="w-10 text-right font-medium tabular-nums"
          style={{ color: correct === total ? "var(--primary)" : "var(--destructive)" } as React.CSSProperties}
        >
          {correct}
        </TableCell>
        <TableCell className="w-10 text-right text-muted-foreground tabular-nums">{total}</TableCell>
        <span className="w-5 flex justify-end text-muted-foreground">
          {open ? <ChevronUp size={14} strokeWidth={1.5} /> : <ChevronDown size={14} strokeWidth={1.5} />}
        </span>
      </TableRow>
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
  if (decisionNodes.length === 0) {
    return <p className="text-[13px] text-muted-foreground">Scenario not attempted.</p>;
  }
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

/* ─── Main export ─── */

export function KCScoreTable({
  questions,
  answers,
}: {
  questions: KCQuestion[];
  answers: Record<string, KCAnswer>;
}) {
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
    <Table>
      <TableHeader>
        <TableHead className="flex-1">Section</TableHead>
        <TableHead className="w-10 text-right">Score</TableHead>
        <TableHead className="w-10 text-right">Total</TableHead>
        <span className="w-5" />
      </TableHeader>

      <TableBody>
        {rows.map((row) => (
          <SectionRow key={row.key} label={row.label} correct={row.correct} total={row.total}>
            {row.content}
          </SectionRow>
        ))}
      </TableBody>

      <TableFooter>
        <TableCell className="flex-1 font-semibold">Total</TableCell>
        <TableCell
          className="w-10 text-right font-bold tabular-nums"
          style={{ color: totalCorrect === totalPoints ? "var(--primary)" : "var(--destructive)" } as React.CSSProperties}
        >
          {totalCorrect}
        </TableCell>
        <TableCell className="w-10 text-right font-medium text-muted-foreground tabular-nums">{totalPoints}</TableCell>
        <span className="w-5" />
      </TableFooter>
    </Table>
  );
}
