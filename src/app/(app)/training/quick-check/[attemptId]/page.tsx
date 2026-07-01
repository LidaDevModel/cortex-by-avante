"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ArrowLeft } from "lucide-react";
import { MOCK_ATTEMPTS, FORMAT_LABELS, CATEGORY_LABELS } from "@/lib/knowledge-check-mock";
import { KCScoreTable } from "@/components/knowledge-check/KCScoreTable";

const ALL_CATEGORIES = ["escalations", "first-aid", "incidents", "clients"] as const;

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function formatDateShort(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function KCAttemptPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = use(params);
  const attempt = MOCK_ATTEMPTS.find((a) => a.id === attemptId);

  if (!attempt) notFound();

  const pct = attempt.total > 0 ? Math.round((attempt.score / attempt.total) * 100) : 0;
  const categoryLabel = (() => {
    const cats = attempt.categories;
    if (cats.length === ALL_CATEGORIES.length) return "All categories";
    if (cats.length === 1) return CATEGORY_LABELS[cats[0]];
    if (cats.length === 2) return `${CATEGORY_LABELS[cats[0]]} & ${CATEGORY_LABELS[cats[1]]}`;
    return `${CATEGORY_LABELS[cats[0]]} & ${cats.length - 1} more`;
  })();

  return (
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
          <Link
            href="/training/quick-check"
            className="text-muted-foreground shrink-0 hover:text-foreground transition-colors duration-100"
          >
            Knowledge check
          </Link>
          <span className="text-muted-foreground shrink-0">/</span>
          <span className="font-medium text-foreground truncate">{formatDateShort(attempt.date)}</span>
        </div>
      </header>

      {/* Canvas */}
      <div
        className="flex-1 overflow-y-auto scroll-thin"
        style={{
          maskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 48px), transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 48px), transparent 100%)",
        }}
      >
        <div className="max-w-[920px] mx-auto px-8 pt-8 pb-12 flex flex-col gap-8">
          {/* Back + title block */}
          <div className="flex flex-col gap-2">
            <Link
              href="/training/quick-check"
              className="flex items-center gap-1.5 w-fit text-[13px] leading-[20px] text-muted-foreground hover:text-foreground transition-colors duration-100"
            >
              <ArrowLeft size={14} strokeWidth={2} />
              <span>Back to knowledge check</span>
            </Link>
            <h1 className="text-[28px] leading-[36px] font-bold text-foreground">
              {categoryLabel}
            </h1>
            <p className="text-[14px] leading-[20px] text-muted-foreground">
              {formatDate(attempt.date)}&nbsp;&nbsp;·&nbsp;&nbsp;{attempt.formats.map((f) => FORMAT_LABELS[f]).join(", ")}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className="text-[32px] leading-none font-bold tabular-nums"
                style={{ color: pct >= 70 ? "var(--primary)" : "var(--destructive)" }}
              >
                {pct}%
              </span>
              <span className="text-[15px] text-muted-foreground">
                {attempt.score} of {attempt.total} correct
              </span>
            </div>
          </div>

          {/* Score table */}
          <KCScoreTable questions={attempt.questions} answers={attempt.answers} />

        </div>
      </div>
    </div>
  );
}
