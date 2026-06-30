"use client";

import { X, ExternalLink, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  KCAttempt,
  KCQuestion,
  KCAnswer,
  KCMCQuestion,
  KCMatchingQuestion,
  KCBranchingQuestion,
  KCMCAnswer,
  KCMatchingAnswer,
  KCBranchingAnswer,
} from "@/lib/knowledge-check-mock";
import { scoreQuestion, FORMAT_LABELS, CATEGORY_LABELS } from "@/lib/knowledge-check-mock";
import { useEffect } from "react";

/* ─── Helpers ─── */

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

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

/* ─── Per-question result views ─── */

function MCResult({ question, answer }: { question: KCMCQuestion; answer: KCMCAnswer | undefined }) {
  const { correct } = scoreQuestion(question, answer);
  const isCorrect = correct === 1;
  const userIdx = answer?.selectedIndex ?? null;
  const skipped = userIdx === null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[14px] leading-[20px] font-semibold text-foreground">{question.question}</p>
      <div className="flex flex-col gap-1">
        {question.options.map((opt, i) => {
          const isUserChoice = i === userIdx;
          const isCorrectOpt = i === question.correctIndex;
          const highlight = isUserChoice || isCorrectOpt;
          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-[8px] text-[13px] leading-[20px]",
                highlight ? "border" : "opacity-50"
              )}
              style={
                highlight
                  ? {
                      background: isCorrectOpt
                        ? "color-mix(in srgb, var(--primary) 8%, transparent)"
                        : "color-mix(in srgb, var(--destructive) 8%, transparent)",
                      borderColor: isCorrectOpt ? "var(--primary)" : "var(--destructive)",
                      color: "var(--foreground)",
                    }
                  : { border: "1px solid var(--border)", background: "var(--surface-raised)" }
              }
            >
              {isCorrectOpt ? (
                <Check size={13} strokeWidth={2.5} style={{ color: "var(--primary)", flexShrink: 0 }} />
              ) : isUserChoice && !isCorrect ? (
                <X size={13} strokeWidth={2.5} style={{ color: "var(--destructive)", flexShrink: 0 }} />
              ) : (
                <span className="w-[13px] shrink-0" />
              )}
              {opt}
              {isCorrectOpt && <span className="ml-auto text-[11px] font-medium" style={{ color: "var(--primary)" }}>Correct</span>}
              {isUserChoice && !isCorrectOpt && <span className="ml-auto text-[11px] font-medium" style={{ color: "var(--destructive)" }}>Your answer</span>}
            </div>
          );
        })}
      </div>
      {!isCorrect && !skipped && <SourceLink doc={question.sourceDoc} section={question.sourceSection} />}
      {skipped && <p className="text-[12px] leading-[16px] text-muted-foreground italic">Skipped</p>}
    </div>
  );
}

function MatchingResult({
  question,
  answer,
}: {
  question: KCMatchingQuestion;
  answer: KCMatchingAnswer | undefined;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[14px] leading-[20px] font-semibold text-foreground">{question.instruction}</p>
      <div className="flex flex-col gap-1.5">
        {question.pairs.map((pair) => {
          const userMatchId = answer?.matches[pair.id];
          const userMatch = question.pairs.find((p) => p.id === userMatchId);
          const isCorrect = userMatchId === pair.id;
          const skipped = !userMatchId;

          return (
            <div
              key={pair.id}
              className="rounded-[8px] border px-3 py-2"
              style={{
                borderColor: skipped
                  ? "var(--border)"
                  : isCorrect
                  ? "var(--primary)"
                  : "var(--destructive)",
                background: skipped
                  ? "var(--surface-raised)"
                  : isCorrect
                  ? "color-mix(in srgb, var(--primary) 8%, transparent)"
                  : "color-mix(in srgb, var(--destructive) 8%, transparent)",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[13px] leading-[20px] font-medium text-foreground">{pair.term}</span>
                {!skipped && (
                  isCorrect ? (
                    <Check size={13} strokeWidth={2.5} className="mt-0.5 shrink-0" style={{ color: "var(--primary)" }} />
                  ) : (
                    <X size={13} strokeWidth={2.5} className="mt-0.5 shrink-0" style={{ color: "var(--destructive)" }} />
                  )
                )}
              </div>
              {!isCorrect && !skipped && (
                <div className="mt-1 flex flex-col gap-0.5">
                  <p className="text-[12px] leading-[16px] text-muted-foreground line-through">
                    {userMatch?.definition ?? "—"}
                  </p>
                  <p className="text-[12px] leading-[16px]" style={{ color: "var(--primary)" }}>
                    {pair.definition}
                  </p>
                </div>
              )}
              {isCorrect && (
                <p className="mt-0.5 text-[12px] leading-[16px] text-muted-foreground">{pair.definition}</p>
              )}
              {skipped && (
                <p className="mt-0.5 text-[12px] leading-[16px] text-muted-foreground italic">Not matched</p>
              )}
            </div>
          );
        })}
      </div>
      <SourceLink doc={question.sourceDoc} section={question.sourceSection} />
    </div>
  );
}

function BranchingResult({
  question,
  answer,
}: {
  question: KCBranchingQuestion;
  answer: KCBranchingAnswer | undefined;
}) {
  const decisionNodes = question.nodes.filter(n => n.type === "decision");

  return (
    <div className="flex flex-col gap-4">
      {decisionNodes.map((node, i) => {
        const chosenId = answer?.decisions[node.id];
        const chosenOpt = node.options?.find(o => o.id === chosenId);
        const correctOpt = node.options?.find(o => o.isCorrect);
        const isCorrect = chosenOpt?.isCorrect;

        return (
          <div key={node.id} className="flex flex-col gap-2">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Decision {i + 1}</p>
            <p className="text-[13px] leading-[20px] font-medium text-foreground">{node.scenarioText}</p>
            <div className="flex flex-col gap-1">
              {node.options?.map((opt) => {
                const isUserChoice = chosenId === opt.id;
                const highlight = isUserChoice || opt.isCorrect;
                return (
                  <div
                    key={opt.id}
                    className={cn("flex items-start gap-2 px-3 py-2 rounded-[8px] text-[13px] leading-[20px]", highlight ? "border" : "opacity-40")}
                    style={
                      highlight
                        ? {
                            background: opt.isCorrect
                              ? "color-mix(in srgb, var(--primary) 8%, transparent)"
                              : "color-mix(in srgb, var(--destructive) 8%, transparent)",
                            borderColor: opt.isCorrect ? "var(--primary)" : "var(--destructive)",
                          }
                        : { border: "1px solid var(--border)", background: "var(--surface-raised)" }
                    }
                  >
                    {opt.isCorrect ? (
                      <Check size={13} strokeWidth={2.5} className="mt-0.5 shrink-0" style={{ color: "var(--primary)" }} />
                    ) : isUserChoice ? (
                      <X size={13} strokeWidth={2.5} className="mt-0.5 shrink-0" style={{ color: "var(--destructive)" }} />
                    ) : (
                      <span className="w-[13px] shrink-0" />
                    )}
                    <span className="flex-1">{opt.text}</span>
                    {opt.isCorrect && <span className="ml-auto shrink-0 text-[11px] font-medium" style={{ color: "var(--primary)" }}>Correct</span>}
                    {isUserChoice && !isCorrect && <span className="ml-auto shrink-0 text-[11px] font-medium" style={{ color: "var(--destructive)" }}>Your answer</span>}
                  </div>
                );
              })}
              {!chosenOpt && <p className="text-[12px] text-muted-foreground italic">Not decided</p>}
            </div>
          </div>
        );
      })}
      <SourceLink doc={question.sourceDoc} section={question.sourceSection} />
    </div>
  );
}

function QuestionResult({ question, answer }: { question: KCQuestion; answer: KCAnswer | undefined }) {
  const { correct, total } = scoreQuestion(question, answer);
  const isCorrect = correct === total && total > 0;
  const label =
    question.type === "mc"
      ? "Multiple choice"
      : question.type === "matching"
      ? "Matching"
      : "Scenario";

  return (
    <div className="flex flex-col gap-3 py-4 border-b border-border last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-[11px] leading-[16px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span
          className="text-[11px] leading-[16px] font-medium px-1.5 py-0.5 rounded-full"
          style={
            isCorrect
              ? {
                  background: "color-mix(in srgb, var(--primary) 12%, transparent)",
                  color: "var(--primary)",
                }
              : {
                  background: "color-mix(in srgb, var(--destructive) 12%, transparent)",
                  color: "var(--destructive)",
                }
          }
        >
          {correct}/{total}
        </span>
      </div>
      {question.type === "mc" && (
        <MCResult question={question} answer={answer as KCMCAnswer | undefined} />
      )}
      {question.type === "matching" && (
        <MatchingResult question={question} answer={answer as KCMatchingAnswer | undefined} />
      )}
      {question.type === "branching" && (
        <BranchingResult question={question} answer={answer as KCBranchingAnswer | undefined} />
      )}
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
      style={{ background: "rgba(17, 24, 39, 0.4)" }}
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
              <span className="text-[13px] leading-[20px] font-semibold" style={{ color: "var(--primary)" }}>
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
        <div className="flex-1 overflow-y-auto px-6 scroll-thin">
          {attempt.questions.map((q) => (
            <QuestionResult key={q.id} question={q} answer={attempt.answers[q.id]} />
          ))}
        </div>
      </div>
    </div>
  );
}
