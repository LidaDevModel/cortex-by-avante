"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Check, Lock } from "lucide-react";
import { Matching } from "@/components/exam/sections/Matching";
import { BranchingGame } from "@/components/exam/sections/BranchingGame";
import { ExitConfirmDialog } from "@/components/ui/exit-confirm-dialog";
import type {
  KCQuestion,
  KCAnswer,
  KCMCAnswer,
  KCMatchingAnswer,
  KCBranchingAnswer,
  KCCategory,
} from "@/lib/knowledge-check-mock";
import { CATEGORY_LABELS } from "@/lib/knowledge-check-mock";

/* ─── Section helpers ─── */

type KCType = "mc" | "matching" | "branching";

const TYPE_LABELS: Record<KCType, string> = {
  mc: "Multiple choice",
  matching: "Matching",
  branching: "Scenarios",
};

type Section = { type: KCType; label: string; startIndex: number; count: number };

export function buildSections(questions: KCQuestion[]): Section[] {
  const sections: Section[] = [];
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const last = sections[sections.length - 1];
    if (last && last.type === q.type) {
      last.count++;
    } else {
      sections.push({ type: q.type as KCType, label: TYPE_LABELS[q.type as KCType], startIndex: i, count: 1 });
    }
  }
  return sections;
}

function getSectionForIndex(sections: Section[], index: number): Section {
  for (let i = sections.length - 1; i >= 0; i--) {
    if (index >= sections[i].startIndex) return sections[i];
  }
  return sections[0];
}

function isSectionComplete(section: Section, questions: KCQuestion[], answers: Record<string, KCAnswer>): boolean {
  for (let i = section.startIndex; i < section.startIndex + section.count; i++) {
    const ans = answers[questions[i].id];
    if (!ans) return false;
    if (ans.type === "mc" && (ans as KCMCAnswer).selectedIndex === null) return false;
  }
  return true;
}

/* ─── (ExitConfirmDialog is shared from @/components/ui/exit-confirm-dialog) ─── */

/* ─── Section tabs ─── */

export function KCSectionTabs({
  sections,
  currentIndex,
  questions,
  answers,
  onJumpTo,
  onReview,
  isReviewActive,
}: {
  sections: Section[];
  currentIndex: number;
  questions: KCQuestion[];
  answers: Record<string, KCAnswer>;
  onJumpTo: (i: number) => void;
  onReview: () => void;
  isReviewActive?: boolean;
}) {
  const activeSection = isReviewActive ? null : getSectionForIndex(sections, currentIndex);

  return (
    <div className="flex items-center gap-2">
      {sections.map((s) => {
        const isActive = !isReviewActive && s.type === activeSection?.type;
        const isDone = !isActive && isSectionComplete(s, questions, answers);

        return (
          <button
            key={s.type}
            onClick={() => onJumpTo(s.startIndex)}
            className="flex items-center gap-1.5 h-[34px] px-4 rounded-full text-[13px] leading-[20px] font-medium transition-colors duration-150"
            style={
              isActive
                ? { background: "var(--primary)", color: "var(--primary-foreground)" }
                : isDone
                ? {
                    background: "color-mix(in srgb, var(--primary) 12%, transparent)",
                    color: "var(--primary)",
                    border: "1px solid color-mix(in srgb, var(--primary) 30%, transparent)",
                  }
                : {
                    background: "var(--surface-raised)",
                    color: "var(--muted-foreground)",
                    border: "1px solid var(--border)",
                  }
            }
          >
            {isDone && <Check size={12} strokeWidth={2.5} />}
            {s.label}
          </button>
        );
      })}
      {/* Review tab — always shown at the end */}
      <button
        onClick={onReview}
        className="flex items-center gap-1.5 h-[34px] px-4 rounded-full text-[13px] leading-[20px] font-medium transition-colors duration-150"
        style={
          isReviewActive
            ? { background: "var(--primary)", color: "var(--primary-foreground)" }
            : {
                background: "var(--surface-raised)",
                color: "var(--muted-foreground)",
                border: "1px solid var(--border)",
              }
        }
      >
        Review
      </button>
    </div>
  );
}

/* ─── Progress indicators (section-scoped) ─── */

function MCProgressDots({
  section,
  questions,
  answers,
  currentIndex,
  onJumpTo,
}: {
  section: Section;
  questions: KCQuestion[];
  answers: Record<string, KCAnswer>;
  currentIndex: number;
  onJumpTo: (i: number) => void;
}) {
  const indices = Array.from({ length: section.count }, (_, i) => section.startIndex + i);

  return (
    <div className="flex items-center gap-2 self-center">
      {indices.map((globalIdx, pos) => {
        const isCurrent = globalIdx === currentIndex;
        const q = questions[globalIdx];
        const ans = answers[q.id] as KCMCAnswer | undefined;
        const isAnswered = ans?.selectedIndex !== null && ans?.selectedIndex !== undefined && !isCurrent;
        const isSkipped = ans !== undefined && ans.selectedIndex === null && !isCurrent;

        return (
          <div key={globalIdx} className="flex items-center gap-2">
            <button
              onClick={() => onJumpTo(globalIdx)}
              aria-label={`Question ${pos + 1}`}
              className="flex items-center justify-center rounded-full text-[11px] font-semibold transition-all duration-150 shrink-0 focus-visible:outline-none focus-visible:ring-2"
              style={{
                width: 28,
                height: 28,
                background: isCurrent || isAnswered ? "var(--primary)" : "transparent",
                border: isCurrent || isAnswered ? "none" : isSkipped ? "1.5px dashed var(--muted-foreground)" : "1.5px solid var(--border)",
                color: isCurrent || isAnswered ? "var(--primary-foreground)" : "var(--muted-foreground)",
              }}
            >
              {isAnswered ? "✓" : `Q${pos + 1}`}
            </button>
            {pos < section.count - 1 && (
              <div
                className="shrink-0"
                style={{ width: 16, height: 1.5, background: isAnswered ? "color-mix(in srgb, var(--primary) 30%, transparent)" : "var(--border)" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SimpleDots({
  section,
  questions,
  answers,
  currentIndex,
  onJumpTo,
}: {
  section: Section;
  questions: KCQuestion[];
  answers: Record<string, KCAnswer>;
  currentIndex: number;
  onJumpTo: (i: number) => void;
}) {
  const indices = Array.from({ length: section.count }, (_, i) => section.startIndex + i);

  return (
    <div className="flex items-center justify-center gap-2">
      {indices.map((globalIdx) => {
        const isCurrent = globalIdx === currentIndex;
        const q = questions[globalIdx];
        const ans = answers[q.id];
        let hasAnswer = false;
        if (ans?.type === "matching") hasAnswer = Object.keys((ans as KCMatchingAnswer).matches).length > 0;
        else if (ans?.type === "branching") hasAnswer = (ans as KCBranchingAnswer).isCompleted;

        return (
          <button
            key={globalIdx}
            onClick={() => onJumpTo(globalIdx)}
            aria-label={`Question ${globalIdx + 1}`}
            className={cn("rounded-full transition-all duration-150", isCurrent ? "w-6 h-2.5" : "w-2.5 h-2.5")}
            style={{
              background: isCurrent
                ? "var(--primary)"
                : hasAnswer
                ? "color-mix(in srgb, var(--primary) 60%, transparent)"
                : "var(--border)",
            }}
          />
        );
      })}
    </div>
  );
}

function ProgressDots(props: {
  section: Section;
  questions: KCQuestion[];
  answers: Record<string, KCAnswer>;
  currentIndex: number;
  onJumpTo: (i: number) => void;
}) {
  if (props.section.type === "mc") return <MCProgressDots {...props} />;
  return <SimpleDots {...props} />;
}



/* ─── MC question ─── */

function MCQuestion({
  question,
  answer,
  onSelect,
  onSkip,
  onNext,
  isLastInSection,
  isLastSection,
  questionIndex,
  totalQuestions,
  dots,
}: {
  question: Extract<KCQuestion, { type: "mc" }>;
  answer: KCMCAnswer | undefined;
  onSelect: (index: number) => void;
  onSkip: () => void;
  onNext: () => void;
  isLastInSection: boolean;
  isLastSection: boolean;
  questionIndex: number;
  totalQuestions: number;
  dots?: React.ReactNode;
}) {
  const selectedIndex = answer?.selectedIndex ?? null;
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (advanceTimer.current) clearTimeout(advanceTimer.current); }, []);

  function handleSelect(i: number) {
    onSelect(i);
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(onNext, 600);
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-[600px] mx-auto">
      {dots}
      <div className="flex flex-col gap-3">
        <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
          Question {questionIndex + 1} of {totalQuestions}
        </span>
        <p className="text-[20px] leading-[28px] font-semibold text-foreground">{question.question}</p>
      </div>
      <div className="flex flex-col gap-2">
        {question.options.map((opt, i) => {
          const isSelected = i === selectedIndex;
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className="px-4 py-3 rounded-[8px] border text-left text-[14px] leading-[20px] transition-colors duration-100"
              style={
                isSelected
                  ? { borderColor: "var(--primary)", background: "color-mix(in srgb, var(--primary) 10%, transparent)", color: "var(--foreground)" }
                  : { borderColor: "var(--border)", background: "var(--surface-raised)", color: "var(--foreground)" }
              }
            >
              {opt}
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-end pt-2">
        {isLastInSection ? (
          <button
            onClick={onNext}
            className="h-[40px] px-5 rounded-[8px] text-[14px] leading-[20px] font-semibold transition-opacity duration-100 hover:opacity-90"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            Next →
          </button>
        ) : (
          <button
            onClick={onSkip}
            className="text-[14px] leading-[20px] font-medium transition-opacity duration-100 hover:opacity-70"
            style={{ color: "var(--muted-foreground)" }}
          >
            Skip question
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Matching question ─── */

function MatchingQuestion({
  question,
  answer,
  onMatch,
  onClear,
  onNext,
}: {
  question: Extract<KCQuestion, { type: "matching" }>;
  answer: KCMatchingAnswer | undefined;
  onMatch: (termId: string, defId: string) => void;
  onClear: () => void;
  onNext: () => void;
}) {
  const matches = answer?.matches ?? {};
  const exercise = { instruction: question.instruction, pairs: question.pairs };
  return (
    <div className="w-full flex-1 flex flex-col">
      <Matching exercise={exercise} matches={matches} onMatch={onMatch} onClear={onClear} onNext={onNext} />
    </div>
  );
}

/* ─── Branching question — uses exam BranchingGame ─── */

function KCDecisionMap({ answered }: { answered: boolean }) {
  const W = 360;
  const H = 120;
  const R = 20;
  // Three nodes: start, decision, end
  const nodes = [
    { x: W * 0.18, y: H / 2, type: "start" },
    { x: W * 0.5,  y: H / 2, type: "decision" },
    { x: W * 0.82, y: H / 2, type: "end" },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ overflow: "visible" }}>
      <style>{`
        @keyframes kc-node-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>

      {/* Edge: start → decision */}
      <line x1={nodes[0].x + R} y1={nodes[0].y} x2={nodes[1].x - R} y2={nodes[1].y} stroke="var(--primary)" strokeWidth={2.5} />
      {/* Edge: decision → end */}
      <line
        x1={nodes[1].x + R} y1={nodes[1].y} x2={nodes[2].x - R * 1.1} y2={nodes[2].y}
        stroke={answered ? "var(--primary)" : "var(--border)"} strokeWidth={answered ? 2.5 : 2}
      />

      {/* Start node */}
      <circle cx={nodes[0].x} cy={nodes[0].y} r={R}
        fill="color-mix(in srgb, var(--primary) 15%, var(--surface-raised))"
        stroke="var(--primary)" strokeWidth={1.5}
      />
      <text x={nodes[0].x} y={nodes[0].y} textAnchor="middle" dominantBaseline="central"
        fontSize="11" fontWeight="600" fill="var(--primary)">✓</text>

      {/* Decision node */}
      <circle cx={nodes[1].x} cy={nodes[1].y} r={R}
        fill={answered ? "color-mix(in srgb, var(--primary) 15%, var(--surface-raised))" : "var(--accent-subtle, #D4EC93)"}
        stroke="var(--primary)" strokeWidth={answered ? 1.5 : 2.5}
        style={!answered ? { animation: "kc-node-pulse 2s ease-in-out infinite" } : {}}
      />
      {answered
        ? <text x={nodes[1].x} y={nodes[1].y} textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="600" fill="var(--primary)">✓</text>
        : <Lock x={nodes[1].x - 6} y={nodes[1].y - 6} size={12} color="var(--foreground)" strokeWidth={1.5} />
      }

      {/* End node — diamond */}
      {(() => {
        const s = R * 1.1;
        const { x, y } = nodes[2];
        return (
          <polygon
            points={`${x},${y - s} ${x + s},${y} ${x},${y + s} ${x - s},${y}`}
            fill={answered ? "color-mix(in srgb, var(--primary) 15%, var(--surface-raised))" : "var(--surface-raised)"}
            stroke={answered ? "var(--primary)" : "var(--border)"}
            strokeWidth={answered ? 2.5 : 1.5}
          />
        );
      })()}
      {answered && (
        <circle cx={nodes[2].x} cy={nodes[2].y} r={4} fill="var(--primary)" />
      )}
    </svg>
  );
}

function BranchingQuestion({
  question,
  answer,
  onAnswer,
  onNext,
}: {
  question: Extract<KCQuestion, { type: "branching" }>;
  answer: KCBranchingAnswer | undefined;
  onAnswer: (decisions: Record<string, string>, isCompleted: boolean) => void;
  onNext: () => void;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scenario = { nodes: question.nodes, startNodeId: question.startNodeId } as any;
  const decisions = answer?.decisions ?? {};
  const isCompleted = answer?.isCompleted ?? false;

  return (
    <div className="flex flex-col w-full flex-1" style={{ minHeight: 500 }}>
      <BranchingGame
        scenario={scenario}
        decisions={decisions}
        isCompleted={isCompleted}
        mapVariant="card"
        onDecision={(nodeId, optionId) =>
          onAnswer({ ...decisions, [nodeId]: optionId }, false)
        }
        onComplete={(lastNodeId, lastOptionId) => {
          onAnswer({ ...decisions, [lastNodeId]: lastOptionId }, true);
          onNext();
        }}
      />
    </div>
  );
}

/* ─── Title helper ─── */

const ALL_CATS: KCCategory[] = ["escalations", "first-aid", "incidents", "clients"];

function buildTitle(categories: KCCategory[]): string {
  if (categories.length === 0 || categories.length === ALL_CATS.length) {
    return "All categories check";
  }
  const labels = categories.map((c) => CATEGORY_LABELS[c]);
  if (labels.length === 1) return `${labels[0]} knowledge check`;
  if (labels.length === 2) return `${labels[0]} & ${labels[1]} check`;
  return `${labels.slice(0, -1).join(", ")} & ${labels[labels.length - 1]} check`;
}

/* ─── Main ─── */

type Props = {
  questions: KCQuestion[];
  currentIndex: number;
  answers: Record<string, KCAnswer>;
  categories: KCCategory[];
  onAnswer: (id: string, answer: KCAnswer) => void;
  onNext: () => void;
  onBack: () => void;
  onJumpTo: (index: number) => void;
  onExit: () => void;
  onReview: () => void;
};

export function KCQuestionFlow({
  questions,
  currentIndex,
  answers,
  categories,
  onAnswer,
  onNext,
  onJumpTo,
  onExit,
  onReview,
}: Props) {
  const [exitOpen, setExitOpen] = useState(false);
  const question = questions[currentIndex];
  const sections = buildSections(questions);
  const activeSection = getSectionForIndex(sections, currentIndex);
  const activeSectionIdx = sections.indexOf(activeSection);
  const isLastInSection = currentIndex === activeSection.startIndex + activeSection.count - 1;
  const isLastSection = activeSectionIdx === sections.length - 1;
  const title = buildTitle(categories);

  function handleNext() {
    if (isLastInSection) {
      if (isLastSection) onReview();
      else onJumpTo(sections[activeSectionIdx + 1].startIndex);
    } else {
      onNext();
    }
  }

  function handleSkip() {
    if (question.type === "mc") {
      onAnswer(question.id, { type: "mc", selectedIndex: null });
    }
    handleNext();
  }

  if (!question) return null;

  return (
    <>
      <ExitConfirmDialog
        open={exitOpen}
        onOpenChange={setExitOpen}
        title="Exit this knowledge check?"
        description="Your progress will not be saved."
        exitLabel="Exit check"
        onExit={onExit}
      />

      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto scroll-thin">
          <div className="max-w-[920px] mx-auto px-8 pt-8 pb-12 flex flex-col gap-4">

            {/* Title row */}
            <div className="flex items-center justify-between">
              <h1 className="text-[28px] leading-[36px] font-bold text-foreground capitalize">
                {title}
              </h1>
              <button
                onClick={() => setExitOpen(true)}
                className="h-[36px] px-4 rounded-[8px] border text-[13px] leading-[20px] font-medium transition-opacity duration-100 hover:opacity-70"
                style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
              >
                Quit check
              </button>
            </div>

            {/* Section tabs */}
            {sections.length > 1 && (
              <KCSectionTabs
                sections={sections}
                currentIndex={currentIndex}
                questions={questions}
                answers={answers}
                onJumpTo={onJumpTo}
                onReview={onReview}
                isReviewActive={false}
              />
            )}

            {/* Question */}
            {question.type === "mc" && (
              <MCQuestion
                question={question}
                answer={answers[question.id] as KCMCAnswer | undefined}
                onSelect={(i) => onAnswer(question.id, { type: "mc", selectedIndex: i })}
                onSkip={handleSkip}
                onNext={handleNext}
                isLastInSection={isLastInSection}
                isLastSection={isLastSection}
                questionIndex={currentIndex - activeSection.startIndex}
                totalQuestions={activeSection.count}
                dots={
                  <ProgressDots
                    section={activeSection}
                    questions={questions}
                    answers={answers}
                    currentIndex={currentIndex}
                    onJumpTo={onJumpTo}
                  />
                }
              />
            )}
            {question.type === "matching" && (
              <MatchingQuestion
                question={question}
                answer={answers[question.id] as KCMatchingAnswer | undefined}
                onMatch={(termId, defId) => {
                  const existing = (answers[question.id] as KCMatchingAnswer | undefined)?.matches ?? {};
                  const cleaned: Record<string, string> = {};
                  for (const [k, v] of Object.entries(existing)) {
                    if (v !== defId) cleaned[k] = v;
                  }
                  onAnswer(question.id, { type: "matching", matches: { ...cleaned, [termId]: defId } });
                }}
                onClear={() => onAnswer(question.id, { type: "matching", matches: {} })}
                onNext={handleNext}
              />
            )}
            {question.type === "branching" && (
              <BranchingQuestion
                question={question}
                answer={answers[question.id] as KCBranchingAnswer | undefined}
                onAnswer={(decisions, isCompleted) =>
                  onAnswer(question.id, { type: "branching", decisions, isCompleted })
                }
                onNext={handleNext}
              />
            )}

          </div>
        </div>
      </div>
    </>
  );
}
