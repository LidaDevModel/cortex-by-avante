"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Eye, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import {
  FORMAT_LABELS,
  CATEGORY_LABELS,
  getBudget,
  generateQuestions,
  computeKCScore,
} from "@/lib/knowledge-check-mock";
import { addAttempt, getAllAttempts } from "@/lib/kc-store";
import type {
  KCFormat,
  KCCategory,
  KCQuestion,
  KCAnswer,
  KCAttempt,
} from "@/lib/knowledge-check-mock";
import { KCQuestionFlow, KCSectionTabs, buildSections } from "@/components/knowledge-check/KCQuestionFlow";
import { KCReview } from "@/components/knowledge-check/KCReview";
import { KCResults } from "@/components/knowledge-check/KCResults";

/* ─── Types ─── */

type Phase = "listing" | "config" | "generating" | "flow" | "review" | "results";

const ALL_FORMATS: KCFormat[] = ["mc", "matching", "branching"];
const ALL_CATEGORIES: KCCategory[] = ["escalations", "first-aid", "incidents", "clients"];

/* ─── Helpers ─── */

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/* ─── Sub-components ─── */

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="h-[34px] px-4 rounded-full border text-[13px] leading-[20px] font-medium transition-colors duration-100"
      style={
        active
          ? {
              background: "color-mix(in srgb, var(--primary) 14%, transparent)",
              borderColor: "color-mix(in srgb, var(--primary) 45%, transparent)",
              color: "var(--primary)",
            }
          : { background: "var(--surface-raised)", borderColor: "var(--border)", color: "var(--muted-foreground)" }
      }
    >
      {label}
    </button>
  );
}

/* ─── Config screen ─── */

function ConfigScreen({
  formats,
  categories,
  onToggleFormat,
  onToggleAllFormats,
  onToggleCategory,
  onToggleAllCategories,
  onStart,
  onCancel,
}: {
  formats: KCFormat[];
  categories: KCCategory[];
  onToggleFormat: (f: KCFormat) => void;
  onToggleAllFormats: () => void;
  onToggleCategory: (c: KCCategory) => void;
  onToggleAllCategories: () => void;
  onStart: () => void;
  onCancel: () => void;
}) {
  const allFormatsSelected = ALL_FORMATS.every((f) => formats.includes(f));
  const allCategoriesSelected = ALL_CATEGORIES.every((c) => categories.includes(c));
  const budget = getBudget(formats.length > 0 ? formats : ["mc"]);
  const canStart = formats.length > 0 && categories.length > 0;

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8">
      <div
        className="w-full max-w-[440px] flex flex-col gap-6 rounded-[12px] p-6"
        style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
      >
        <div className="flex flex-col gap-1">
          <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">
            Configure your check
          </h2>
          <p className="text-[13px] leading-[20px] text-muted-foreground">
            Choose the formats and categories for this session.
          </p>
        </div>

        {/* Formats */}
        <div className="flex flex-col gap-3">
          <p className="text-[12px] leading-[16px] font-semibold uppercase tracking-wider text-muted-foreground">
            Format
          </p>
          <div className="flex flex-wrap gap-2">
            <Chip label="All" active={allFormatsSelected} onClick={onToggleAllFormats} />
            {ALL_FORMATS.map((f) => (
              <Chip
                key={f}
                label={FORMAT_LABELS[f]}
                active={formats.includes(f)}
                onClick={() => onToggleFormat(f)}
              />
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-col gap-3">
          <p className="text-[12px] leading-[16px] font-semibold uppercase tracking-wider text-muted-foreground">
            Category
          </p>
          <div className="flex flex-wrap gap-2">
            <Chip label="All" active={allCategoriesSelected} onClick={onToggleAllCategories} />
            {ALL_CATEGORIES.map((c) => (
              <Chip
                key={c}
                label={CATEGORY_LABELS[c]}
                active={categories.includes(c)}
                onClick={() => onToggleCategory(c)}
              />
            ))}
          </div>
        </div>

        {/* Live estimate */}
        <div
          className="flex items-center justify-between px-4 py-3 rounded-[8px]"
          style={{ background: "color-mix(in srgb, var(--primary) 6%, transparent)", border: "1px solid color-mix(in srgb, var(--primary) 15%, transparent)" }}
        >
          <span className="text-[13px] leading-[20px] text-muted-foreground">Estimated</span>
          <span className="text-[13px] leading-[20px] font-semibold" style={{ color: "var(--primary)" }}>
            {formats.length > 0 && categories.length > 0 ? `${budget.total} questions · ${budget.time}` : "Select formats and categories"}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onStart}
            disabled={!canStart}
            className="h-[40px] rounded-[8px] text-[14px] leading-[20px] font-semibold transition-opacity duration-100"
            style={
              canStart
                ? { background: "var(--primary)", color: "var(--primary-foreground)" }
                : { background: "var(--primary)", color: "var(--primary-foreground)", opacity: 0.5, cursor: "not-allowed" }
            }
          >
            Start knowledge check
          </button>
          <button
            onClick={onCancel}
            className="text-[13px] leading-[20px] text-muted-foreground hover:text-foreground transition-colors duration-100 text-center py-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Generating screen ─── */

function GeneratingScreen() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4">
      <div
        className="w-8 h-8 rounded-full border-2 animate-spin"
        style={{ borderColor: "var(--border)", borderTopColor: "var(--primary)" }}
      />
      <p className="text-[15px] leading-[24px] font-medium text-foreground">
        Preparing your questions…
      </p>
    </div>
  );
}

/* ─── History table ─── */

type SortCol = "date" | "score";
type SortDir = "asc" | "desc";

function HistoryTable({
  attempts,
  onViewDetail,
}: {
  attempts: KCAttempt[];
  onViewDetail: (id: string) => void;
}) {
  const [sortCol, setSortCol] = useState<SortCol>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [hoveredCol, setHoveredCol] = useState<SortCol | null>(null);

  function handleSort(col: SortCol) {
    if (sortCol === col) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortCol(col);
      setSortDir("desc");
    }
  }

  const sorted = [...attempts].sort((a, b) => {
    let cmp = 0;
    if (sortCol === "date") cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (sortCol === "score") {
      const pa = a.total > 0 ? a.score / a.total : 0;
      const pb = b.total > 0 ? b.score / b.total : 0;
      cmp = pa - pb;
    }
    return sortDir === "desc" ? -cmp : cmp;
  });

  if (attempts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <Eye size={32} strokeWidth={1.5} className="text-muted-foreground" />
        <p className="text-[15px] leading-[24px] font-medium text-foreground">No previous checks.</p>
        <p className="text-[13px] leading-[20px] text-muted-foreground">
          Start a knowledge check to see your history here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[12px] overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      {/* Table header */}
      <div
        className="grid items-center px-4 py-2.5 border-b border-border"
        style={{ gridTemplateColumns: "2fr 2fr 110px 80px", background: "var(--surface-raised)" }}
      >
        {(["Categories", "Formats", "Date", "Score"] as const).map((col) => {
          const key = col === "Date" ? "date" : col === "Score" ? "score" : null;
          const isActive = key && sortCol === key;
          const isHovered = key && hoveredCol === key;
          const Icon = isActive
            ? sortDir === "desc" ? ArrowDown : ArrowUp
            : ArrowUpDown;
          return key ? (
            <button
              key={col}
              onClick={() => handleSort(key)}
              onMouseEnter={() => setHoveredCol(key)}
              onMouseLeave={() => setHoveredCol(null)}
              className="flex items-center gap-1 text-[11px] leading-[16px] font-semibold uppercase tracking-wider transition-colors duration-100 text-left"
              style={{ color: isActive ? "var(--primary)" : "var(--muted-foreground)" }}
            >
              {col}
              <Icon
                size={11}
                strokeWidth={2.5}
                style={{ opacity: isActive || isHovered ? 1 : 0, transition: "opacity 100ms" }}
              />
            </button>
          ) : (
            <span key={col} className="text-[11px] leading-[16px] font-semibold uppercase tracking-wider text-muted-foreground">
              {col}
            </span>
          );
        })}
      </div>

      {/* Rows */}
      {sorted.map((attempt) => {
        const pct = attempt.total > 0 ? Math.round((attempt.score / attempt.total) * 100) : 0;
        return (
          <button
            key={attempt.id}
            onClick={() => onViewDetail(attempt.id)}
            className="w-full grid items-center px-4 py-3 border-b border-border last:border-0 bg-[var(--surface)] hover:bg-[color-mix(in_srgb,var(--surface-raised)_60%,transparent)] transition-colors duration-100"
            style={{ gridTemplateColumns: "2fr 2fr 110px 80px" }}
          >
            <span className="text-[13px] leading-[20px] text-foreground truncate pr-2 text-left">
              {attempt.categories.length === ALL_CATEGORIES.length ? "All" : attempt.categories.map((c) => CATEGORY_LABELS[c]).join(", ")}
            </span>
            <span className="text-[13px] leading-[20px] text-muted-foreground truncate pr-2 text-left">
              {attempt.formats.length === ALL_FORMATS.length ? "All" : attempt.formats.map((f) => FORMAT_LABELS[f]).join(", ")}
            </span>
            <span className="text-[13px] leading-[20px] text-muted-foreground text-left">{formatDate(attempt.date)}</span>
            <span
              className="text-[13px] leading-[20px] font-semibold text-left"
              style={{
                fontVariantNumeric: "tabular-nums",
                color: pct === 100 ? "var(--primary)" : "var(--muted-foreground)",
              }}
            >
              {attempt.score}/{attempt.total} · {pct}%
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Page ─── */

export default function QuickCheckPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("listing");
  const [selectedFormats, setSelectedFormats] = useState<KCFormat[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<KCCategory[]>([]);
  const [generatedQuestions, setGeneratedQuestions] = useState<KCQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, KCAnswer>>({});
  const [attempts, setAttempts] = useState<KCAttempt[]>(() => getAllAttempts());

  /* Format toggle */
  const toggleFormat = useCallback((f: KCFormat) => {
    setSelectedFormats((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  }, []);

  const toggleAllFormats = useCallback(() => {
    setSelectedFormats((prev) =>
      ALL_FORMATS.every((f) => prev.includes(f)) ? [] : [...ALL_FORMATS]
    );
  }, []);

  const toggleAllCategories = useCallback(() => {
    setSelectedCategories((prev) =>
      ALL_CATEGORIES.every((c) => prev.includes(c)) ? [] : [...ALL_CATEGORIES]
    );
  }, []);

  /* Category toggle */
  const toggleCategory = useCallback((c: KCCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  }, []);

  /* Start flow */
  function startCheck() {
    setPhase("generating");
  }

  useEffect(() => {
    if (phase !== "generating") return;
    const timer = setTimeout(() => {
      const qs = generateQuestions(selectedFormats, selectedCategories);
      setGeneratedQuestions(qs);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setPhase("flow");
    }, 1200);
    return () => clearTimeout(timer);
  }, [phase, selectedFormats, selectedCategories]);

  /* Submit */
  function submitCheck() {
    const { score, total } = computeKCScore(generatedQuestions, answers);
    const newAttempt: KCAttempt = {
      id: `kc-${Date.now()}`,
      date: new Date().toISOString(),
      categories: selectedCategories,
      formats: selectedFormats,
      score,
      total,
      questions: generatedQuestions,
      answers,
    };
    addAttempt(newAttempt);
    setAttempts(getAllAttempts());
    setPhase("results");
  }

  /* Reset back to listing */
  function resetToListing() {
    setPhase("listing");
    setAnswers({});
    setGeneratedQuestions([]);
    setCurrentQuestionIndex(0);
  }

  /* Reset to config for "try another" */
  function openConfig() {
    setPhase("config");
    setSelectedFormats([]);
    setSelectedCategories([]);
    setAnswers({});
    setGeneratedQuestions([]);
    setCurrentQuestionIndex(0);
  }

  return (
    <>
      <div className="relative flex flex-col h-full overflow-hidden" style={{ background: "var(--surface)" }}>
        {/* Header */}
        <header
          className="relative z-10 flex items-center gap-2 px-4 h-14 shrink-0"
          style={{ background: "var(--surface)" }}
        >
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-1.5 text-[14px] leading-[20px] min-w-0">
            <span className="text-muted-foreground shrink-0">Training</span>
            <span className="text-muted-foreground shrink-0">/</span>
            {phase === "flow" || phase === "review" || phase === "results" ? (
              <>
                <span className="text-muted-foreground shrink-0">Knowledge check</span>
                <span className="text-muted-foreground shrink-0">/</span>
                <span className="font-medium text-foreground truncate">
                  {selectedCategories.length === 0 || selectedCategories.length === ALL_CATEGORIES.length
                    ? "All categories"
                    : selectedCategories.length === 1
                    ? CATEGORY_LABELS[selectedCategories[0]]
                    : `${CATEGORY_LABELS[selectedCategories[0]]} & ${selectedCategories.length - 1} more`}
                </span>
              </>
            ) : (
              <span className="font-medium text-foreground truncate">Knowledge check</span>
            )}
          </div>
        </header>

        {/* Canvas */}
        <div className="relative flex-1 overflow-hidden flex flex-col">
          {/* Listing */}
          {phase === "listing" && (
            <div
              className="absolute inset-0 overflow-y-auto z-10 scroll-thin"
              style={{
                maskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 48px), transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 48px), transparent 100%)",
              }}
            >
              <div className="max-w-[920px] mx-auto px-8 pt-8 pb-12 flex flex-col gap-8">
                {/* Title + CTA */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <h1 className="text-[28px] leading-[36px] font-bold text-foreground">
                      Knowledge check
                    </h1>
                    <p className="text-[14px] leading-[20px] text-muted-foreground">
                      Test your knowledge across topics and formats without time pressure.
                    </p>
                  </div>
                  <button
                    onClick={openConfig}
                    className="shrink-0 h-[40px] px-5 rounded-[8px] text-[14px] leading-[20px] font-semibold transition-opacity duration-100 hover:opacity-90"
                    style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                  >
                    Check your knowledge
                  </button>
                </div>

                {/* History */}
                <section className="flex flex-col gap-4">
                  <p className="text-[12px] leading-[16px] font-medium uppercase tracking-wider text-muted-foreground">
                    Previous checks
                  </p>
                  <HistoryTable attempts={attempts} onViewDetail={(id) => router.push(`/training/quick-check/${id}`)} />
                </section>
              </div>
            </div>
          )}

          {/* Config */}
          {phase === "config" && (
            <ConfigScreen
              formats={selectedFormats}
              categories={selectedCategories}
              onToggleFormat={toggleFormat}
              onToggleAllFormats={toggleAllFormats}
              onToggleCategory={toggleCategory}
              onToggleAllCategories={toggleAllCategories}
              onStart={startCheck}
              onCancel={() => setPhase("listing")}
            />
          )}

          {/* Generating */}
          {phase === "generating" && <GeneratingScreen />}

          {/* Question flow */}
          {phase === "flow" && (
            <KCQuestionFlow
              questions={generatedQuestions}
              currentIndex={currentQuestionIndex}
              answers={answers}
              categories={selectedCategories}
              onAnswer={(id, ans) => setAnswers((prev) => ({ ...prev, [id]: ans }))}
              onNext={() => setCurrentQuestionIndex((i) => Math.min(i + 1, generatedQuestions.length - 1))}
              onBack={() => setCurrentQuestionIndex((i) => Math.max(i - 1, 0))}
              onJumpTo={(i) => setCurrentQuestionIndex(i)}
              onExit={resetToListing}
              onReview={() => setPhase("review")}
            />
          )}

          {/* Review */}
          {phase === "review" && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="max-w-[920px] mx-auto w-full px-8 pt-8 pb-4 flex flex-col gap-4 shrink-0">
                <div className="flex items-center justify-between">
                  <h1 className="text-[28px] leading-[36px] font-bold text-foreground capitalize">
                    {selectedCategories.length === 0 || selectedCategories.length === ALL_CATEGORIES.length
                      ? "All categories check"
                      : selectedCategories.length === 1
                      ? `${CATEGORY_LABELS[selectedCategories[0]]} check`
                      : `${CATEGORY_LABELS[selectedCategories[0]]} & ${selectedCategories.length - 1} more`}
                  </h1>
                  <button
                    onClick={resetToListing}
                    className="h-[36px] px-4 rounded-[8px] border text-[13px] leading-[20px] font-medium transition-opacity duration-100 hover:opacity-70"
                    style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
                  >
                    Quit check
                  </button>
                </div>
                <KCSectionTabs
                  sections={buildSections(generatedQuestions)}
                  currentIndex={currentQuestionIndex}
                  questions={generatedQuestions}
                  answers={answers}
                  onJumpTo={(i) => { setCurrentQuestionIndex(i); setPhase("flow"); }}
                  onReview={() => setPhase("review")}
                  isReviewActive={true}
                />
              </div>
              <div
                className="flex-1 overflow-y-auto scroll-thin"
                style={{
                  maskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 48px), transparent 100%)",
                  WebkitMaskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 48px), transparent 100%)",
                }}
              >
                <div className="max-w-[920px] mx-auto px-8 pb-12">
                  <KCReview
                    questions={generatedQuestions}
                    answers={answers}
                    onJumpTo={(i) => { setCurrentQuestionIndex(i); setPhase("flow"); }}
                    onSubmit={submitCheck}
                    onBack={() => { setCurrentQuestionIndex(generatedQuestions.length - 1); setPhase("flow"); }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {phase === "results" && (
            <div
              className="absolute inset-0 overflow-y-auto z-10 scroll-thin"
              style={{
                maskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 48px), transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 48px), transparent 100%)",
              }}
            >
              <div className="max-w-[920px] mx-auto px-8">
                <KCResults
                  questions={generatedQuestions}
                  answers={answers}
                  onTryAnother={openConfig}
                  onBack={() => setPhase("listing")}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
