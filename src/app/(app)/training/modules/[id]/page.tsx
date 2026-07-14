"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Check, X, Flag, ArrowLeft, ListChecks } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Highlight } from "@/components/ui/highlight";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { SplitPanel } from "@/components/ui/split-panel";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DocumentToolbar } from "@/components/ui/document-toolbar";
import { SearchInput } from "@/components/ui/search-input";
import { ModuleIllustration } from "@/components/training/ModuleIllustration";
import { Button } from "@/components/ui/button";
import { getModuleById, MODULE_CHAPTERS, type Quiz, type Chapter } from "@/lib/training-mock";

const CHAPTERS: Chapter[] = MODULE_CHAPTERS;

function deriveInitialState(progress: number) {
  const contentChapters = CHAPTERS.filter((c) => !c.isFinalQuiz);
  const completedCount = Math.min(
    Math.round((progress / 100) * contentChapters.length),
    contentChapters.length
  );
  const completedIds = new Set(contentChapters.slice(0, completedCount).map((c) => c.id));
  const currentId =
    completedCount >= contentChapters.length
      ? "final"
      : completedCount > 0
      ? contentChapters[completedCount].id
      : contentChapters[0].id;
  return { completedIds, currentId };
}

/* ─── Helpers ─── */

function countOccurrences(text: string, query: string): number {
  if (!query) return 0;
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  let count = 0;
  let idx = 0;
  while ((idx = lower.indexOf(q, idx)) !== -1) {
    count++;
    idx += q.length;
  }
  return count;
}

/* ─── Chapter stepper ─── */

function ChapterStepper({
  chapters,
  currentId,
  completedIds,
  skippedIds,
  onSelect,
  tocFilter,
  matchCounts,
}: {
  chapters: Chapter[];
  currentId: string;
  completedIds: Set<string>;
  skippedIds: Set<string>;
  onSelect: (id: string) => void;
  tocFilter: string;
  matchCounts: Record<string, number>;
}) {
  const q = tocFilter.trim().toLowerCase();
  // Left panel filters by chapter title only — full-text find lives in the Find bar
  const filtered = q
    ? chapters.filter(c => c.title.toLowerCase().includes(q))
    : chapters;

  return (
    <div className="flex flex-col">
      {filtered.map((chapter, i) => {
        const isCompleted = completedIds.has(chapter.id);
        const isSkipped = skippedIds.has(chapter.id) && !isCompleted;
        const isActive = chapter.id === currentId;
        const isLast = i === filtered.length - 1;
        // Only show match badge for text chapters (not final quiz)
        const matchCount = !chapter.isFinalQuiz ? (matchCounts[chapter.id] ?? 0) : 0;

        return (
          <div key={chapter.id} className="flex gap-3">
            {/* Connector column */}
            <div className="flex flex-col items-center shrink-0" style={{ width: 28 }}>
              <button
                onClick={() => onSelect(chapter.id)}
                className="shrink-0 flex items-center justify-center rounded-full transition-all duration-150 focus-visible:outline-none focus-visible:ring-2"
                style={{
                  width: 28,
                  height: 28,
                  background: isActive || isCompleted ? "var(--primary)" : "transparent",
                  border: isActive || isCompleted
                    ? "none"
                    : isSkipped
                    ? "1.5px dashed var(--muted-foreground)"
                    : "1.5px solid var(--border)",
                  color: isActive || isCompleted ? "var(--primary-foreground)" : "var(--muted-foreground)",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {isCompleted && !isActive ? (
                  <Check size={13} strokeWidth={2.5} />
                ) : chapter.isFinalQuiz ? (
                  <Flag size={12} strokeWidth={2} />
                ) : (
                  <span>{chapter.num}</span>
                )}
              </button>
              {!isLast && (
                <div
                  className="flex-1 w-px"
                  style={{
                    background: isCompleted ? "var(--primary)" : "var(--border)",
                    minHeight: 24,
                    opacity: isCompleted ? 0.4 : 1,
                  }}
                />
              )}
            </div>

            {/* Chapter label + badge */}
            <button
              onClick={() => onSelect(chapter.id)}
              className="flex-1 min-w-0 text-left pb-6 focus-visible:outline-none overflow-hidden flex items-start justify-between gap-2"
              style={{ paddingTop: 4 }}
            >
              <span
                className="text-[13px] leading-[18px] block truncate flex-1 min-w-0"
                style={{
                  fontWeight: isActive ? 600 : 400,
                  color: isActive
                    ? "var(--primary)"
                    : isCompleted
                    ? "var(--muted-foreground)"
                    : "var(--foreground)",
                }}
              >
                {chapter.title}
              </span>
              {matchCount > 0 && (
                <span
                  className="text-[11px] font-semibold px-[6px] py-[1px] rounded-[4px] tabular-nums shrink-0 mt-[1px]"
                  style={{
                    background: "color-mix(in srgb, var(--accent-subtle) 50%, transparent)",
                    color: "var(--primary)",
                  }}
                >
                  {matchCount}
                </span>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Quiz card ─── */

type QuizSubmitState = "idle" | "correct" | "wrong";

function QuizCard({ quiz }: { quiz: Quiz }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<QuizSubmitState>("idle");

  const submitted = submitState !== "idle";

  function handleSubmit() {
    if (!selected) return;
    setSubmitState(selected === quiz.correctId ? "correct" : "wrong");
  }

  return (
    <div
      className="rounded-[10px] flex flex-col gap-4 p-5"
      style={{ background: "color-mix(in srgb, var(--primary) 6%, var(--surface))" }}
    >
      <p className="text-[14px] leading-[22px] font-semibold" style={{ color: "var(--foreground)" }}>
        {quiz.question}
      </p>

      <div className="flex flex-col gap-2">
        {quiz.options.map((opt) => {
          const isSelected = selected === opt.id;
          const isCorrect = opt.id === quiz.correctId;
          const showCorrect = submitted && isCorrect;
          const showWrong = submitted && isSelected && !isCorrect;

          return (
            <button
              key={opt.id}
              onClick={() => !submitted && setSelected(opt.id)}
              className="flex items-center gap-3 text-left rounded-[8px] px-3 py-2.5 transition-colors duration-100"
              style={{
                background: showCorrect
                  ? "color-mix(in srgb, var(--primary) 8%, transparent)"
                  : showWrong
                  ? "color-mix(in srgb, var(--destructive) 6%, transparent)"
                  : isSelected && !submitted
                  ? "color-mix(in srgb, var(--primary) 6%, transparent)"
                  : "transparent",
                cursor: submitted ? "default" : "pointer",
              }}
            >
              <span
                className="shrink-0 flex items-center justify-center rounded-full"
                style={{
                  width: 18,
                  height: 18,
                  border: showCorrect
                    ? "none"
                    : showWrong
                    ? "2px solid var(--destructive)"
                    : isSelected && !submitted
                    ? "2px solid var(--primary)"
                    : "1.5px solid var(--control-border)",
                  background: showCorrect ? "var(--primary)" : "transparent",
                }}
              >
                {showCorrect && <Check size={10} strokeWidth={3} color="var(--primary-foreground)" />}
                {showWrong && <X size={10} strokeWidth={3} className="text-destructive" />}
                {isSelected && !submitted && (
                  <span className="rounded-full block" style={{ width: 8, height: 8, background: "var(--primary)" }} />
                )}
              </span>

              <span
                className="text-[13px] leading-[20px]"
                style={{
                  fontWeight: showCorrect ? 600 : 400,
                  color: showCorrect
                    ? "var(--primary)"
                    : showWrong
                    ? "var(--destructive)"
                    : "var(--foreground)",
                }}
              >
                {opt.text}
              </span>
            </button>
          );
        })}
      </div>

      {submitted && (
        <div
          className="flex items-center gap-2"
          style={{
            color: submitState === "correct" ? "var(--primary)" : "var(--destructive)",
            animation: submitState === "correct" ? undefined : "quiz-shake 250ms ease-out",
          }}
        >
          <span style={{ animation: "check-pop 250ms cubic-bezier(0.32, 0.72, 0, 1) both" }} className="flex">
            {submitState === "correct" ? <Check size={15} strokeWidth={2.5} /> : <X size={15} strokeWidth={2.5} />}
          </span>
          <span className="text-[13px] leading-[20px] font-semibold">
            {submitState === "correct" ? "Correct" : "Incorrect"}
          </span>
        </div>
      )}

      {!submitted && (
        <div className="flex items-center gap-3">
          <Button size="cta" disabled={!selected} onClick={handleSubmit}>
            Submit your answer
          </Button>
          <span className="text-[12px] leading-[16px] text-muted-foreground">optional</span>
        </div>
      )}
    </div>
  );
}

/* ─── Page ─── */

export default function ModuleDetailPage() {
  const params = useParams<{ id: string }>();
  const moduleId = params?.id ?? "1";
  const trainingModule = getModuleById(moduleId);
  const initialProgress = trainingModule?.progress ?? 0;

  const [currentId, setCurrentId] = useState(() => deriveInitialState(initialProgress).currentId);
  const [completedIds, setCompletedIds] = useState(() => deriveInitialState(initialProgress).completedIds);
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());

  // Left panel — chapter title filter
  const [tocFilter, setTocFilter] = useState("");
  // Mobile: the chapter stepper moves into a sheet (the rail is desktop-only).
  const [chaptersSheetOpen, setChaptersSheetOpen] = useState(false);

  // Find in document
  const [findOpen, setFindOpen] = useState(false);
  const [findQuery, setFindQuery] = useState("");
  const [findMatchIdx, setFindMatchIdx] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const handleScroll = useCallback(() => {
    scrollRef.current?.classList.add("is-scrolling");
    clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => scrollRef.current?.classList.remove("is-scrolling"), 800);
  }, []);

  const currentIndex = CHAPTERS.findIndex((c) => c.id === currentId);
  const currentChapter = CHAPTERS[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === CHAPTERS.length - 1;
  const isSecondToLast = currentIndex === CHAPTERS.length - 2;

  const contentChapters = CHAPTERS.filter((c) => !c.isFinalQuiz);
  const progress = Math.round((completedIds.size / contentChapters.length) * 100);

  // Searchable chapters: text chapters only (no final quiz)
  const textChapters = useMemo(() => CHAPTERS.filter(c => !c.isFinalQuiz && c.body), []);

  // Chapters matching the find query (title + body, text chapters only)
  const findMatchChapters = useMemo(() => {
    const q = findQuery.trim().toLowerCase();
    if (!q) return [];
    return textChapters.filter(c =>
      c.title.toLowerCase().includes(q) || c.body.toLowerCase().includes(q)
    );
  }, [textChapters, findQuery]);

  // Total text occurrences across all searchable chapters
  const totalFindCount = useMemo(() => {
    const q = findQuery.trim().toLowerCase();
    if (!q) return 0;
    return textChapters.reduce((sum, c) => sum + countOccurrences(c.title + " " + c.body, q), 0);
  }, [textChapters, findQuery]);

  // Per-chapter occurrence counts for TOC badges
  const matchCountByChapterId = useMemo<Record<string, number>>(() => {
    const q = findQuery.trim().toLowerCase();
    if (!q) return {};
    return Object.fromEntries(
      textChapters.map(c => [c.id, countOccurrences(c.title + " " + c.body, q)])
    );
  }, [textChapters, findQuery]);

  // Jump to chapter when find match index changes (no skip marking)
  useEffect(() => {
    if (findQuery.trim() && findMatchChapters.length > 0) {
      const clamped = Math.min(findMatchIdx, findMatchChapters.length - 1);
      const target = findMatchChapters[clamped];
      setCurrentId(target.id);
      scrollRef.current?.scrollTo({ top: 0 });
    }
  }, [findMatchIdx, findMatchChapters, findQuery]);

  // Reset match index when query changes
  useEffect(() => {
    setFindMatchIdx(0);
  }, [findQuery]);

  // Cmd+F / Ctrl+F
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        setFindOpen(true);
      }
      if (e.key === "Escape" && findOpen) {
        setFindOpen(false);
        setFindQuery("");
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [findOpen]);

  const closeFindBar = useCallback(() => {
    setFindOpen(false);
    setFindQuery("");
  }, []);

  const goFindPrev = useCallback(() => {
    if (findMatchChapters.length === 0) return;
    setFindMatchIdx(i => (i - 1 + findMatchChapters.length) % findMatchChapters.length);
  }, [findMatchChapters.length]);

  const goFindNext = useCallback(() => {
    if (findMatchChapters.length === 0) return;
    setFindMatchIdx(i => (i + 1) % findMatchChapters.length);
  }, [findMatchChapters.length]);

  function scrollToTop() {
    scrollRef.current?.scrollTo({ top: 0 });
  }

  function goTo(id: string) {
    const targetIndex = CHAPTERS.findIndex((c) => c.id === id);
    setSkippedIds((prev) => {
      const next = new Set(prev);
      const lo = Math.min(currentIndex, targetIndex);
      const hi = Math.max(currentIndex, targetIndex);
      for (let i = lo; i < hi; i++) {
        const c = CHAPTERS[i];
        if (!completedIds.has(c.id)) next.add(c.id);
      }
      return next;
    });
    setCurrentId(id);
    scrollToTop();
  }

  function goNext() {
    if (isLast) return;
    const next = CHAPTERS[currentIndex + 1];
    setCompletedIds((prev) => new Set([...prev, currentId]));
    setSkippedIds((prev) => { const s = new Set(prev); s.delete(next.id); return s; });
    setCurrentId(next.id);
    scrollToTop();
  }

  function goPrev() {
    if (isFirst) return;
    setCurrentId(CHAPTERS[currentIndex - 1].id);
    scrollToTop();
  }

  const nextLabel = isSecondToLast ? "Final Quiz" : "Next Chapter";

  // Chapter list — shared by the desktop rail and the mobile "Chapters" sheet.
  const renderChapters = (onSelect: (id: string) => void, searchPad: string, listPad: string) => (
    <>
      <div className={`${searchPad} py-3 shrink-0`}>
        <SearchInput value={tocFilter} onChange={setTocFilter} placeholder="Jump to chapter..." />
      </div>
      <div className={`flex-1 overflow-y-auto ${listPad} pb-6 scroll-thin`}>
        <ChapterStepper
          chapters={CHAPTERS}
          currentId={currentId}
          completedIds={completedIds}
          skippedIds={skippedIds}
          onSelect={onSelect}
          tocFilter={tocFilter}
          matchCounts={matchCountByChapterId}
        />
      </div>
    </>
  );

  if (!trainingModule) {
    return (
      <div className="flex flex-col h-full overflow-hidden bg-surface">
        <PageHeader crumbs={[
          { label: "Training", href: "/training/modules" },
          { label: "Modules", href: "/training/modules" },
          { label: "Module" },
        ]} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[14px] text-muted-foreground">Module not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader crumbs={[
        { label: "Training", href: "/training/modules" },
        { label: "Modules", href: "/training/modules" },
        { label: trainingModule.title },
      ]} />

      {/* Module info bar */}
      <div className="shrink-0 px-4 sm:px-8 pt-6 pb-5 flex flex-col gap-2" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <Link
          href="/training/modules"
          className="flex items-center gap-1.5 w-fit text-[13px] leading-[20px] text-muted-foreground hover:text-foreground transition-colors duration-100"
        >
          <ArrowLeft size={14} strokeWidth={2} />
          <span>Back to modules</span>
        </Link>
        <h1 className="text-[22px] leading-[30px] font-bold" style={{ color: "var(--foreground)" }}>
          {trainingModule.title}
        </h1>
        <p className="text-[13px] leading-[20px] text-muted-foreground">
          {trainingModule.chapters} chapters&nbsp;&nbsp;·&nbsp;&nbsp;{trainingModule.hours}h&nbsp;&nbsp;·&nbsp;&nbsp;Certification
        </p>
        <div className="flex items-center gap-3 mt-1">
          <div className="flex-1">
            <ProgressBar value={progress} height={8} />
          </div>
          <span className="text-[12px] leading-[16px] font-medium shrink-0" style={{ color: "var(--primary)" }}>
            {progress}% Complete
          </span>
        </div>
      </div>

      <SplitPanel
        leftWidth={354}
        left={renderChapters(goTo, "px-8", "px-8")}
        right={
          <div className="relative flex flex-col flex-1 overflow-hidden">
            {/* Blob gradients on final quiz */}
            {currentChapter.isFinalQuiz && (
              <>
                <div className="absolute inset-0 pointer-events-none z-0"
                  style={{ background: "radial-gradient(ellipse 60% 70% at 28% 55%, var(--blob-1) 0%, var(--blob-1) 10%, transparent 70%)" }} />
                <div className="absolute inset-0 pointer-events-none z-0"
                  style={{ background: "radial-gradient(ellipse 65% 70% at 68% 45%, var(--blob-2) 0%, var(--blob-2) 10%, transparent 70%)" }} />
              </>
            )}

            <DocumentToolbar
              findOpen={findOpen}
              onFindToggle={() => setFindOpen(o => !o)}
              findQuery={findQuery}
              onFindChange={setFindQuery}
              onFindClose={closeFindBar}
              onFindPrev={goFindPrev}
              onFindNext={goFindNext}
              findMatchCount={findMatchChapters.length}
              findTotalCount={totalFindCount}
              findMatchIdx={findMatchIdx}
              findEntityLabel="chapters"
              left={
                // Mobile chapters trigger — the rail is desktop-only
                <button
                  type="button"
                  onClick={() => setChaptersSheetOpen(true)}
                  aria-label="Chapters"
                  className="md:hidden shrink-0 flex items-center justify-center size-10 rounded-[10px] border border-border bg-surface text-foreground transition-colors duration-100 hover:bg-[var(--surface-raised)]"
                >
                  <ListChecks size={15} strokeWidth={1.5} />
                </button>
              }
            />

            <ScrollCanvas ref={scrollRef} onScroll={handleScroll} fadeBottom={64}>
              <div
                key={currentChapter.id}
                style={{ animation: "msg-in 200ms ease-out both" }}
                className={currentChapter.isFinalQuiz
                  ? "h-full flex items-center justify-center px-4 sm:px-8 -mt-10"
                  : "max-w-[640px] mx-auto px-4 sm:px-8 pt-8 pb-24 flex flex-col gap-6"
                }>
                {/* Illustration — first chapter only */}
                {currentIndex === 0 && (
                  <div
                    className="flex items-center justify-center rounded-[12px] overflow-hidden"
                    style={{ height: 180, background: "var(--illustration-glow), var(--surface-raised)" }}
                  >
                    <ModuleIllustration category={trainingModule.category} width={96} height={96} className="object-contain" />
                  </div>
                )}

                {!currentChapter.isFinalQuiz ? (
                  <>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1.5">
                        <p className="text-[12px] leading-[16px] font-semibold uppercase tracking-wider text-muted-foreground tabular-nums">
                          Chapter {contentChapters.findIndex((c) => c.id === currentChapter.id) + 1} of {contentChapters.length}
                        </p>
                        <h2 className="text-[18px] leading-[26px] font-semibold" style={{ color: "var(--foreground)" }}>
                          {currentChapter.title}
                        </h2>
                      </div>
                      <div className="flex flex-col gap-4">
                        {currentChapter.body.split("\n\n").map((para, i) => (
                          <p key={i} className="text-[15px] leading-[26px]" style={{ color: "var(--foreground)" }}>
                            <Highlight text={para} query={findQuery.trim().toLowerCase()} />
                          </p>
                        ))}
                      </div>
                    </div>

                    {currentChapter.quiz && (
                      <QuizCard key={currentChapter.id} quiz={currentChapter.quiz} />
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div
                      className="flex items-center justify-center rounded-full"
                      style={{ width: 56, height: 56, background: "color-mix(in srgb, var(--primary) 8%, transparent)" }}
                    >
                      <Flag size={24} style={{ color: "var(--primary)" }} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[17px] leading-[26px] font-semibold" style={{ color: "var(--foreground)" }}>
                        Ready for the final quiz?
                      </p>
                      <p className="text-[14px] leading-[22px] text-muted-foreground">
                        You&apos;ve completed all chapters. Test your knowledge to earn your certification.
                      </p>
                    </div>
                    <Link
                      href={`/training/modules/${moduleId}/exam`}
                      className="h-[40px] px-6 rounded-[8px] text-[14px] leading-[20px] font-semibold flex items-center bg-primary text-primary-foreground transition-opacity duration-100 hover:opacity-90"
                    >
                      Start final quiz
                    </Link>
                    <p className="text-[13px] leading-[16px] text-muted-foreground">
                      Not ready?{" "}
                      <Link
                        href={`/training/modules/${moduleId}/exam?mode=simulation&return=${encodeURIComponent(`/training/modules/${moduleId}`)}`}
                        className="font-medium transition-colors duration-100"
                        style={{ color: "var(--primary)" }}
                      >
                        Try a timed simulation
                      </Link>
                    </p>
                  </div>
                )}

                {!currentChapter.isFinalQuiz && (
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      {!isFirst && (
                        <Button size="cta" variant="outline" onClick={goPrev} className="bg-surface-raised">
                          Previous
                        </Button>
                      )}
                    </div>
                    <Button size="cta" onClick={goNext}>
                      {nextLabel}
                    </Button>
                  </div>
                )}
              </div>
            </ScrollCanvas>
          </div>
        }
      />

      {/* Mobile chapters sheet — same recipe as the library file viewer's contents */}
      <Sheet open={chaptersSheetOpen} onOpenChange={setChaptersSheetOpen}>
        <SheetContent side="left" className="w-[300px] bg-surface p-0 gap-0 flex flex-col">
          <SheetHeader className="px-4 pt-4 pb-0">
            <SheetTitle className="flex items-center gap-2.5 text-[14px] leading-[20px] font-semibold text-primary">
              <ListChecks size={16} strokeWidth={1.5} />
              Chapters
            </SheetTitle>
          </SheetHeader>
          {renderChapters((id) => { goTo(id); setChaptersSheetOpen(false); }, "px-4", "px-3")}
        </SheetContent>
      </Sheet>
    </div>
  );
}
