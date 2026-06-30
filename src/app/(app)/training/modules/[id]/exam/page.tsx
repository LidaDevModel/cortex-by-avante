"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import { ExitConfirmDialog } from "@/components/ui/exit-confirm-dialog";
import { ExamProgress, SectionNav, type ExamSection } from "@/components/exam/ExamProgress";
import { MultipleChoice } from "@/components/exam/sections/MultipleChoice";
import { Matching } from "@/components/exam/sections/Matching";
import { ShortAnswer } from "@/components/exam/sections/ShortAnswer";
import { BranchingGame } from "@/components/exam/sections/BranchingGame";
import { ReviewSubmit } from "@/components/exam/ReviewSubmit";
import { ExamResults } from "@/components/exam/ExamResults";
import { MOCK_EXAM } from "@/lib/exam-mock";

type Phase =
  | "preExam"
  | "mc"
  | "matching"
  | "shortAnswer"
  | "branching"
  | "review"
  | "timesUp"
  | "results";

type SectionScore = { mc: number; matching: number; shortAnswer: number; branching: number };

function computeScores(
  mcAnswers: { questionIndex: number; selectedIndex: number | null }[],
  matchAnswers: Record<string, string>,
  shortAnswerText: string,
  branchDecisions: Record<string, string>,
  exam: typeof MOCK_EXAM
): SectionScore {
  // MC: 5 points each
  const mcScore = mcAnswers.reduce((acc, a) => {
    const q = exam.multipleChoice[a.questionIndex];
    return acc + (a.selectedIndex === q?.correctIndex ? 5 : 0);
  }, 0);

  // Matching: 25/N per correct pair (matching termId→termId since defId == termId in our mock)
  const matchPairs = exam.matching.pairs.length;
  const matchCorrect = exam.matching.pairs.filter(
    (p) => matchAnswers[p.id] === p.id
  ).length;
  const matchScore = parseFloat(((matchCorrect / matchPairs) * 25).toFixed(2));

  // Short answer: mock AI scoring — 20 if answered, 0 if not
  const saScore = shortAnswerText.trim().length > 20 ? 20 : 0;

  // Branching: path-based — 25 if all optimal, partial otherwise
  const decisionNodes = exam.branching.nodes.filter((n) => n.type === "decision");
  const optimalCount = decisionNodes.filter((n) => {
    const chosenId = branchDecisions[n.id];
    return n.options?.find((o) => o.id === chosenId)?.isOptimal;
  }).length;
  const branchScore = parseFloat(((optimalCount / decisionNodes.length) * 25).toFixed(2));

  return { mc: mcScore, matching: matchScore, shortAnswer: saScore, branching: branchScore };
}

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params.id as string;
  const exam = MOCK_EXAM; // In production: fetched/generated per moduleId

  const [phase, setPhase] = useState<Phase>("preExam");
  const [completedSections, setCompletedSections] = useState<Set<ExamSection>>(new Set());
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Timer
  const [timeRemaining, setTimeRemaining] = useState(exam.timeLimitSeconds);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const timesUpRef = useRef(false);

  // MC state
  const [mcIndex, setMcIndex] = useState(0);
  const [mcAnswers, setMcAnswers] = useState<{ questionIndex: number; selectedIndex: number | null }[]>(
    exam.multipleChoice.map((_, i) => ({ questionIndex: i, selectedIndex: null }))
  );
  const mcAnsweredSet = new Set(
    mcAnswers.filter((a) => a.selectedIndex !== null).map((a) => a.questionIndex)
  );
  const mcSkippedSet = new Set(
    mcAnswers
      .filter((a, i) => a.selectedIndex === null && i < mcIndex)
      .map((a) => a.questionIndex)
  );

  // Matching state
  const [matchAnswers, setMatchAnswers] = useState<Record<string, string>>({});

  // Short answer state
  const [shortAnswerText, setShortAnswerText] = useState("");

  // Branching state
  const [branchDecisions, setBranchDecisions] = useState<Record<string, string>>({});
  const [branchingComplete, setBranchingComplete] = useState(false);

  // Scores (computed on submit)
  const [scores, setScores] = useState<SectionScore>({ mc: 0, matching: 0, shortAnswer: 0, branching: 0 });

  // Start timer when exam begins
  useEffect(() => {
    if (phase === "mc" || phase === "matching" || phase === "shortAnswer" || phase === "branching" || phase === "review") {
      if (timerRef.current) return;
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            if (!timesUpRef.current) {
              timesUpRef.current = true;
              handleTimesUp();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {};
  }, [phase]);

  const handleTimesUp = useCallback(() => {
    // Auto-submit with whatever's answered
    const computed = computeScores(mcAnswers, matchAnswers, shortAnswerText, branchDecisions, exam);
    setScores(computed);
    setPhase("timesUp");
    setTimeout(() => setPhase("results"), 4000);
  }, [mcAnswers, matchAnswers, shortAnswerText, branchDecisions, exam]);

  // Back button interception
  useEffect(() => {
    if (phase === "preExam" || phase === "results") return;
    const onPop = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, "", window.location.href);
      setShowExitDialog(true);
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [phase]);

  function markSectionComplete(section: ExamSection) {
    setCompletedSections((prev) => new Set([...prev, section]));
  }

  function handleMCSelect(optionIndex: number | null) {
    setMcAnswers((prev) =>
      prev.map((a) =>
        a.questionIndex === mcIndex ? { ...a, selectedIndex: optionIndex } : a
      )
    );
  }

  function handleMCNext() {
    if (mcIndex < exam.multipleChoice.length - 1) {
      setMcIndex((i) => i + 1);
    } else {
      markSectionComplete("mc");
      setPhase("matching");
    }
  }

  function handleMCSkip() {
    if (mcIndex < exam.multipleChoice.length - 1) {
      setMcIndex((i) => i + 1);
    } else {
      markSectionComplete("mc");
      setPhase("matching");
    }
  }

  function handleMatch(termId: string, defId: string) {
    setMatchAnswers((prev) => {
      const next = { ...prev };
      // Remove any existing mapping to this defId
      Object.keys(next).forEach((k) => { if (next[k] === defId) delete next[k]; });
      next[termId] = defId;
      return next;
    });
  }

  function handleMatchNext() {
    markSectionComplete("matching");
    setPhase("shortAnswer");
  }

  function handleShortAnswerNext() {
    markSectionComplete("shortAnswer");
    setPhase("branching");
  }

  function handleBranchDecision(nodeId: string, optionId: string) {
    setBranchDecisions((prev) => ({ ...prev, [nodeId]: optionId }));
  }

  function handleBranchComplete(_lastNodeId?: string, _lastOptionId?: string) {
    setBranchingComplete(true);
    markSectionComplete("branching");
    setPhase("review");
  }

  function handleSubmit() {
    clearInterval(timerRef.current);
    const computed = computeScores(mcAnswers, matchAnswers, shortAnswerText, branchDecisions, exam);
    setScores(computed);
    setPhase("results");
  }

  function handleExit() {
    clearInterval(timerRef.current);
    router.push(`/training/modules/${moduleId}`);
  }

  function handleJumpSection(section: ExamSection) {
    setPhase(section);
    if (section === "mc") setMcIndex(0);
  }

  const matchingComplete = Object.keys(matchAnswers).length === exam.matching.pairs.length;

  // ─── Pre-exam screen ───
  if (phase === "preExam") {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--background)]"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 40%, color-mix(in srgb, var(--accent) 40%, transparent), transparent), var(--background)`,
        }}
      >
        <div
          className="w-full max-w-[480px] mx-4 rounded-[12px] border border-border bg-[var(--surface)] p-8 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200"
          style={{ animationTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)" }}
        >
          <div className="flex flex-col gap-2">
            <h2
              className="text-[22px] leading-[30px] font-bold"
              style={{ color: "var(--primary)" }}
            >
              Certification exam
            </h2>
            <p className="text-[14px] text-muted-foreground">{exam.moduleName}</p>
          </div>

          {/* Time badge */}
          <div className="self-start flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-[var(--surface-raised)] text-[12px] font-medium text-muted-foreground">
            <Clock size={12} />
            {Math.round(exam.timeLimitSeconds / 60)} minutes
          </div>

          {/* Rules */}
          <ul className="flex flex-col gap-3">
            {[
              "5 multiple choice questions, 1 matching exercise, 1 short answer, 1 branching scenario.",
              "You can skip and return to questions in sections 1–3.",
              "Exiting at any point discards your progress.",
            ].map((rule, i) => (
              <li key={i} className="flex items-start gap-3 text-[14px] text-foreground">
                <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-[var(--primary)] flex items-center justify-center text-[11px] font-semibold">
                  {i + 1}
                </span>
                {rule}
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => setPhase("mc")}
              className="w-full h-10 rounded-[8px] bg-[var(--primary)] text-[var(--primary-foreground)] text-[14px] font-medium hover:opacity-90 transition-opacity duration-100 cursor-pointer"
            >
              Start exam
            </button>
            <button
              onClick={() => router.push(`/training/modules/${moduleId}`)}
              className="text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-100 cursor-pointer text-center"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Time's up interstitial ───
  if (phase === "timesUp") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-200">
          <Clock size={48} color="var(--destructive)" strokeWidth={1.5} />
          <h1 className="text-[32px] leading-[40px] font-bold text-foreground">Time&apos;s up</h1>
          <p className="text-[14px] text-muted-foreground">Your answers have been submitted.</p>
          <p className="text-[13px] text-muted-foreground animate-pulse">
            Taking you to your results…
          </p>
        </div>
      </div>
    );
  }

  // ─── Results ───
  if (phase === "results") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-[var(--background)]"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 40%, color-mix(in srgb, var(--accent) 30%, transparent), transparent), var(--background)`,
        }}
      >
        <ExamResults
          exam={exam}
          scores={scores}
          mcAnswers={mcAnswers}
          matchAnswers={matchAnswers}
          shortAnswer={shortAnswerText}
          branchDecisions={branchDecisions}
          onBack={() => {
            const total = scores.mc + scores.matching + scores.shortAnswer + scores.branching;
            if (total >= 85) {
              router.push("/training/modules");
            } else {
              router.push(`/training/modules/${moduleId}`);
            }
          }}
        />
      </div>
    );
  }

  // ─── Active exam (mc / matching / shortAnswer / branching / review) ───
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--background)]">
      <ExamProgress
        activeSection={phase as ExamSection}
        completedSections={completedSections}
        onSectionClick={handleJumpSection}
        onExit={() => setShowExitDialog(true)}
        timeRemaining={timeRemaining}
        timeLimitSeconds={exam.timeLimitSeconds}
      />

      {/* Section nav strip */}
      <div className="shrink-0 px-8 pt-3 pb-3">
        <SectionNav
          activeSection={phase as ExamSection}
          completedSections={completedSections}
          onSectionClick={handleJumpSection}
        />
      </div>

      {/* Section content */}
      {phase === "mc" && (
        <MultipleChoice
          question={exam.multipleChoice[mcIndex]}
          questionIndex={mcIndex}
          totalQuestions={exam.multipleChoice.length}
          selectedIndex={mcAnswers[mcIndex]?.selectedIndex ?? null}
          answeredIndices={mcAnsweredSet}
          skippedIndices={mcSkippedSet}
          onSelect={handleMCSelect}
          onJumpTo={setMcIndex}
          onNext={handleMCNext}
          onSkip={handleMCSkip}
          isLast={mcIndex === exam.multipleChoice.length - 1}
        />
      )}

      {phase === "matching" && (
        <Matching
          exercise={exam.matching}
          matches={matchAnswers}
          onMatch={handleMatch}
          onClear={() => setMatchAnswers({})}
          onNext={handleMatchNext}
        />
      )}

      {phase === "shortAnswer" && (
        <ShortAnswer
          question={exam.shortAnswer}
          answer={shortAnswerText}
          onChange={setShortAnswerText}
          onNext={handleShortAnswerNext}
        />
      )}

      {phase === "branching" && (
        <BranchingGame
          scenario={exam.branching}
          decisions={branchDecisions}
          isCompleted={branchingComplete}
          onDecision={handleBranchDecision}
          onComplete={handleBranchComplete}
        />
      )}

      {phase === "review" && (
        <ReviewSubmit
          mcQuestions={exam.multipleChoice}
          mcAnswers={mcAnswers}
          matchingExercise={exam.matching}
          matchAnswers={matchAnswers}
          shortAnswerQuestion={exam.shortAnswer}
          shortAnswerText={shortAnswerText}
          branchingComplete={branchingComplete}
          branchingScenario={exam.branching}
          branchingDecisions={branchDecisions}
          onEditSection={handleJumpSection}
          onSubmit={handleSubmit}
        />
      )}

      <ExitConfirmDialog
        open={showExitDialog}
        onOpenChange={setShowExitDialog}
        title="Exit the exam?"
        description="Your progress will not be saved."
        exitLabel="Exit exam"
        onExit={() => {
          clearInterval(timerRef.current);
          router.push(`/training/modules/${moduleId}`);
        }}
      />
    </div>
  );
}
