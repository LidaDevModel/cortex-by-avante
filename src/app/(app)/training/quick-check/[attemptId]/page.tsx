"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { PageHeader, DetailHeader } from "@/components/ui/page-header";
import { FORMAT_LABELS, CATEGORY_LABELS } from "@/lib/knowledge-check-mock";
import { findAttempt, getAttemptOrdinal } from "@/lib/kc-store";
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
  const attempt = findAttempt(attemptId);

  if (!attempt) notFound();

  const pct = attempt.total > 0 ? Math.round((attempt.score / attempt.total) * 100) : 0;
  const ordinal = getAttemptOrdinal(attemptId);
  const categoryLabel = (() => {
    const cats = attempt.categories;
    if (cats.length === ALL_CATEGORIES.length) return "All categories";
    if (cats.length === 1) return CATEGORY_LABELS[cats[0]];
    if (cats.length === 2) return `${CATEGORY_LABELS[cats[0]]} & ${CATEGORY_LABELS[cats[1]]}`;
    return `${CATEGORY_LABELS[cats[0]]} & ${cats.length - 1} more`;
  })();
  const title = `${categoryLabel} #${ordinal}`;

  return (
    <div className="relative flex flex-col h-full overflow-hidden" style={{ background: "var(--surface)" }}>
      <PageHeader crumbs={[
        { label: "Training" },
        { label: "Knowledge check", href: "/training/quick-check" },
        { label: title },
      ]} />

      {/* Canvas */}
      <div
        className="flex-1 overflow-y-auto scroll-thin"
        style={{
          maskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 48px), transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 48px), transparent 100%)",
        }}
      >
        <div className="max-w-[920px] mx-auto px-4 sm:px-8 pt-8 pb-12 flex flex-col gap-8">
          <DetailHeader
            backHref="/training/quick-check"
            backLabel="Back to knowledge check"
            title={title}
            meta={`${formatDate(attempt.date)}  ·  ${attempt.formats.map((f) => FORMAT_LABELS[f]).join(", ")}`}
          />

          {/* Score */}
          <div className="flex items-baseline gap-2">
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

          {/* Score table */}
          <KCScoreTable questions={attempt.questions} answers={attempt.answers} />

        </div>
      </div>
    </div>
  );
}
