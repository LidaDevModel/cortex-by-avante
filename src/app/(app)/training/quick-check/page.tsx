"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { FilterSelect } from "@/components/ui/filter-select";
import { Pagination } from "@/components/ui/pagination";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell, type SortDir } from "@/components/ui/table";
import {
  FORMAT_LABELS,
  CATEGORY_LABELS,
  getBudget,
  generateQuestions,
  computeKCScore,
} from "@/lib/knowledge-check-mock";
import { addAttempt, getAllAttempts, getPendingOrdinal, getAttemptOrdinal, getWeakestCategories } from "@/lib/kc-store";
import type {
  KCFormat,
  KCCategory,
  KCQuestion,
  KCAnswer,
  KCAttempt,
  KCPreset,
} from "@/lib/knowledge-check-mock";
import { KCQuestionFlow, KCSectionTabs, buildSections } from "@/components/knowledge-check/KCQuestionFlow";
import { KCReview } from "@/components/knowledge-check/KCReview";
import { KCResults } from "@/components/knowledge-check/KCResults";
import { KCStartSection } from "@/components/knowledge-check/KCStartSection";
import { KCExamSimConfig } from "@/components/knowledge-check/KCExamSimConfig";
import { useGlassHeader } from "@/hooks/use-glass-header";
import { useFocusedTask } from "@/hooks/use-mobile-nav";
import { getModules } from "@/lib/training-mock";

/* ─── Types ─── */

type Phase = "listing" | "config" | "examSim" | "generating" | "flow" | "review" | "results";

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

const CATEGORY_OPTIONS = ALL_CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }));
const FORMAT_OPTIONS = ALL_FORMATS.map((f) => ({ value: f, label: FORMAT_LABELS[f] }));

function HistorySection({ attempts, onViewDetail }: { attempts: KCAttempt[]; onViewDetail: (id: string) => void }) {
  const [categoryFilter, setCategoryFilter] = useState("");
  const [formatFilter, setFormatFilter] = useState("");

  const filtered = attempts.filter((a) => {
    if (categoryFilter && !a.categories.includes(categoryFilter as KCCategory)) return false;
    if (formatFilter && !a.formats.includes(formatFilter as KCFormat)) return false;
    return true;
  });

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-[12px] leading-[16px] font-medium uppercase tracking-wider text-muted-foreground shrink-0">
          Previous checks
        </p>
        {attempts.length > 0 && (
          <div className="flex items-center gap-2">
            <FilterSelect
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={CATEGORY_OPTIONS}
              placeholder="All categories"
              className="flex-1 sm:flex-none sm:w-[168px]"
            />
            <FilterSelect
              value={formatFilter}
              onChange={setFormatFilter}
              options={FORMAT_OPTIONS}
              placeholder="All formats"
              className="flex-1 sm:flex-none sm:w-[168px]"
            />
          </div>
        )}
      </div>
      <HistoryTable key={`${categoryFilter}-${formatFilter}`} attempts={filtered} onViewDetail={onViewDetail} />
    </section>
  );
}

const PAGE_SIZE = 8;

function HistoryTable({
  attempts,
  onViewDetail,
}: {
  attempts: KCAttempt[];
  onViewDetail: (id: string) => void;
}) {
  const [sortCol, setSortCol] = useState<SortCol>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  function handleSort(col: SortCol) {
    if (sortCol === col) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortCol(col);
      setSortDir("desc");
    }
    setPage(1);
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

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

  const rows = paginated.map((attempt) => {
    const pct = attempt.total > 0 ? Math.round((attempt.score / attempt.total) * 100) : 0;
    const catLabel = (() => {
      const cats = attempt.categories;
      if (cats.length === ALL_CATEGORIES.length) return "All categories";
      if (cats.length === 1) return CATEGORY_LABELS[cats[0]];
      if (cats.length === 2) return `${CATEGORY_LABELS[cats[0]]} & ${CATEGORY_LABELS[cats[1]]}`;
      return `${CATEGORY_LABELS[cats[0]]} & ${cats.length - 1} more`;
    })();
    const formatLabel = attempt.formats.length === ALL_FORMATS.length
      ? "All formats"
      : attempt.formats.map((f) => FORMAT_LABELS[f]).join(", ");
    const scoreColor = pct === 100 ? "var(--primary)" : "var(--muted-foreground)";
    return { attempt, pct, catLabel, formatLabel, scoreColor };
  });

  const emptyFiltered = (
    <div className="px-4 py-10 text-center text-[13px] leading-[20px] text-muted-foreground">
      No checks match the selected filters.
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Desktop: sortable 4-column table */}
      <Table className="hidden md:block">
        <TableHeader>
          <TableHead className="flex-1">Categories</TableHead>
          <TableHead className="flex-1">Formats</TableHead>
          <TableHead className="w-[120px]" sortDir={sortCol === "date" ? sortDir : null} onSort={() => handleSort("date")}>Date</TableHead>
          <TableHead className="w-[100px]" sortDir={sortCol === "score" ? sortDir : null} onSort={() => handleSort("score")}>Score</TableHead>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? emptyFiltered : rows.map(({ attempt, pct, catLabel, formatLabel, scoreColor }) => (
            <TableRow key={attempt.id} onClick={() => onViewDetail(attempt.id)}>
              <TableCell className="flex-1 truncate pr-2">{catLabel} #{getAttemptOrdinal(attempt.id)}</TableCell>
              <TableCell className="flex-1 text-muted-foreground truncate pr-2">{formatLabel === "All formats" ? "All" : formatLabel}</TableCell>
              <TableCell className="w-[120px] text-muted-foreground">{formatDate(attempt.date)}</TableCell>
              <TableCell
                className="w-[100px] font-semibold"
                style={{ fontVariantNumeric: "tabular-nums", color: scoreColor }}
              >
                {attempt.score}/{attempt.total} · {pct}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Mobile: the columns collapse into card rows — categories over a
          formats · date meta line, score on the right. Sorted by the default
          date-desc; the filters above carry the slicing. */}
      <Table className="md:hidden">
        <TableBody>
          {rows.length === 0 ? emptyFiltered : rows.map(({ attempt, pct, catLabel, formatLabel, scoreColor }) => (
            <TableRow key={attempt.id} className="py-3 items-start" onClick={() => onViewDetail(attempt.id)}>
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span className="text-[14px] leading-[20px] font-medium text-foreground truncate">{catLabel} #{getAttemptOrdinal(attempt.id)}</span>
                <span className="text-[12px] leading-[16px] font-[500] text-muted-foreground truncate">
                  {formatLabel} · {formatDate(attempt.date)}
                </span>
              </div>
              <span
                className="shrink-0 text-[13px] leading-[20px] font-semibold"
                style={{ fontVariantNumeric: "tabular-nums", color: scoreColor }}
              >
                {attempt.score}/{attempt.total} · {pct}%
              </span>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} className="px-1" />
    </div>
  );
}

/* ─── Page ─── */

export default function QuickCheckPage() {
  // useSearchParams (read in the deep-link handler) requires a Suspense boundary
  // so the static route doesn't bail out of prerendering.
  return (
    <Suspense fallback={null}>
      <QuickCheckContent />
    </Suspense>
  );
}

function QuickCheckContent() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("listing");
  const { headerClassName, onScroll, reset: resetGlass } = useGlassHeader();
  // Phases swap canvases in and out — clear stale glass when that happens.
  useEffect(() => resetGlass(), [phase, resetGlass]);
  // An active session is a focused task — the mobile nav yields for full
  // height (app-shell protocol); listing and the config pickers keep it.
  useFocusedTask(phase === "generating" || phase === "flow" || phase === "review" || phase === "results");
  const [selectedFormats, setSelectedFormats] = useState<KCFormat[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<KCCategory[]>([]);
  const [generatedQuestions, setGeneratedQuestions] = useState<KCQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, KCAnswer>>({});
  const [attempts, setAttempts] = useState<KCAttempt[]>(() => getAllAttempts());
  // Fixed question cap for count-based presets (Daily 5); null = budget-derived.
  const [questionCap, setQuestionCap] = useState<number | null>(null);
  // Which preset launched the current session — recorded on the attempt so the
  // dashboard can detect "Daily 5 done today". null for plain/custom starts.
  const [activePreset, setActivePreset] = useState<KCPreset | null>(null);
  // Modules eligible for exam simulation — the ones actively being worked on.
  const inProgressModules = useMemo(() => getModules().filter((m) => m.status === "in-progress"), []);
  const searchParams = useSearchParams();

  // Weakest category label for the "Weak areas" preset; null disables it.
  const weakestLabel = useMemo(() => {
    const w = getWeakestCategories(1);
    return w.length > 0 ? CATEGORY_LABELS[w[0]] : null;
  }, [attempts]);

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

  /* Preset: Daily 5 — 5 mixed questions, no config step. */
  function startDaily5() {
    setSelectedFormats([...ALL_FORMATS]);
    setSelectedCategories([...ALL_CATEGORIES]);
    setQuestionCap(5);
    setActivePreset("daily5");
    setAnswers({});
    setGeneratedQuestions([]);
    setCurrentQuestionIndex(0);
    setPhase("generating");
  }

  /* Preset: Weak areas — mixed questions focused on the lowest-scoring category. */
  function startWeakAreas() {
    const cats = getWeakestCategories(1);
    if (cats.length === 0) return; // no history yet; the card is disabled anyway
    setSelectedFormats([...ALL_FORMATS]);
    setSelectedCategories(cats);
    setQuestionCap(null);
    setActivePreset("weak");
    setAnswers({});
    setGeneratedQuestions([]);
    setCurrentQuestionIndex(0);
    setPhase("generating");
  }

  /* Preset: Exam simulation — pick an in-progress module, then run its
     certification exam in practice mode (the exam route reads ?mode=simulation). */
  function launchExamSim(moduleId: string) {
    const ret = encodeURIComponent("/training/quick-check");
    router.push(`/training/modules/${moduleId}/exam?mode=simulation&return=${ret}`);
  }

  useEffect(() => {
    if (phase !== "generating") return;
    const timer = setTimeout(() => {
      const qs = generateQuestions(selectedFormats, selectedCategories);
      setGeneratedQuestions(questionCap != null ? qs.slice(0, questionCap) : qs);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setPhase("flow");
    }, 1200);
    return () => clearTimeout(timer);
  }, [phase, selectedFormats, selectedCategories, questionCap]);

  // Deep-link: /training/quick-check?start=daily5|weak|examSim|custom fires the
  // matching preset on arrival (from the dashboard Quick practice widget), then
  // strips the param so refresh/back doesn't re-trigger.
  useEffect(() => {
    const start = searchParams.get("start");
    if (!start) return;
    window.history.replaceState(null, "", "/training/quick-check");
    if (start === "daily5") startDaily5();
    else if (start === "weak") startWeakAreas();
    else if (start === "examSim") setPhase("examSim");
    else if (start === "custom") openConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      preset: activePreset ?? undefined,
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

  /* Reset to config for "try another" / Custom check */
  function openConfig() {
    setPhase("config");
    setSelectedFormats([]);
    setSelectedCategories([]);
    setQuestionCap(null);
    setActivePreset("custom");
    setAnswers({});
    setGeneratedQuestions([]);
    setCurrentQuestionIndex(0);
  }

  // Breadcrumb reflects the phase: the deep crumb (category + attempt number)
  // only appears once a session is underway.
  const inSession = phase === "flow" || phase === "review" || phase === "results";
  const crumbs = inSession
    ? [
        { label: "Training" },
        { label: "Knowledge check" },
        { label: (() => {
            const cats = selectedCategories;
            const label = cats.length === 0 || cats.length === ALL_CATEGORIES.length
              ? "All categories"
              : cats.length === 1
              ? CATEGORY_LABELS[cats[0]]
              : `${CATEGORY_LABELS[cats[0]]} & ${cats.length - 1} more`;
            return `${label} #${getPendingOrdinal(cats)}`;
          })() },
      ]
    : [{ label: "Training" }, { label: "Knowledge check" }];

  return (
    <>
      <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
        <PageHeader crumbs={crumbs} className={headerClassName} />

        {/* Canvas */}
        <div className="relative flex-1 overflow-hidden flex flex-col">
          {/* Listing */}
          {phase === "listing" && (
            <ScrollCanvas onScroll={onScroll}>
              <div className="max-w-[920px] mx-auto px-4 sm:px-8 pt-8 pb-12 flex flex-col gap-8">
                {/* Title */}
                <div className="flex flex-col gap-1">
                  <h1 className="text-[22px] leading-[30px] sm:text-[28px] sm:leading-[36px] font-bold text-foreground">
                    Knowledge check
                  </h1>
                  <p className="text-[14px] leading-[20px] text-muted-foreground">
                    Test your knowledge across topics and formats without time pressure.
                  </p>
                </div>

                {/* Start a check — presets + custom */}
                <KCStartSection
                  weakestLabel={weakestLabel}
                  examSimAvailable={inProgressModules.length > 0}
                  onDaily5={startDaily5}
                  onWeakAreas={startWeakAreas}
                  onExamSim={() => setPhase("examSim")}
                  onCustom={openConfig}
                />

                {/* History */}
                <HistorySection attempts={attempts} onViewDetail={(id) => router.push(`/training/quick-check/${id}`)} />
              </div>
            </ScrollCanvas>
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

          {/* Exam simulation — pick an in-progress module */}
          {phase === "examSim" && (
            <KCExamSimConfig
              modules={inProgressModules}
              onSelect={launchExamSim}
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
              <div className="max-w-[920px] mx-auto w-full px-4 sm:px-8 pt-8 pb-4 flex flex-col gap-4 shrink-0">
                <div className="flex items-center justify-between gap-3">
                  <h1 className="text-[22px] leading-[30px] sm:text-[28px] sm:leading-[36px] font-bold text-foreground capitalize min-w-0 truncate">
                    {selectedCategories.length === 0 || selectedCategories.length === ALL_CATEGORIES.length
                      ? "All categories check"
                      : selectedCategories.length === 1
                      ? `${CATEGORY_LABELS[selectedCategories[0]]} check`
                      : `${CATEGORY_LABELS[selectedCategories[0]]} & ${selectedCategories.length - 1} more`}
                  </h1>
                  <button
                    onClick={resetToListing}
                    className="h-[36px] px-4 rounded-[8px] border text-[13px] leading-[20px] font-medium transition-opacity duration-100 hover:opacity-70 shrink-0 whitespace-nowrap"
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
              <ScrollCanvas onScroll={onScroll}>
                <div className="max-w-[920px] mx-auto px-4 sm:px-8 pb-12">
                  <KCReview
                    questions={generatedQuestions}
                    answers={answers}
                    onJumpTo={(i) => { setCurrentQuestionIndex(i); setPhase("flow"); }}
                    onSubmit={submitCheck}
                    onBack={() => { setCurrentQuestionIndex(generatedQuestions.length - 1); setPhase("flow"); }}
                  />
                </div>
              </ScrollCanvas>
            </div>
          )}

          {/* Results */}
          {phase === "results" && (
            <ScrollCanvas onScroll={onScroll}>
              <div className="max-w-[920px] mx-auto px-4 sm:px-8">
                <KCResults
                  questions={generatedQuestions}
                  answers={answers}
                  onTryAnother={openConfig}
                  onBack={() => setPhase("listing")}
                />
              </div>
            </ScrollCanvas>
          )}
        </div>
      </div>
    </>
  );
}
