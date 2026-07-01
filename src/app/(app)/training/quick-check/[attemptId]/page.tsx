"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ArrowLeft } from "lucide-react";
import { MOCK_ATTEMPTS, FORMAT_LABELS, CATEGORY_LABELS } from "@/lib/knowledge-check-mock";
import { KCScoreTable } from "@/components/knowledge-check/KCScoreTable";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default function KCAttemptPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = use(params);
  const attempt = MOCK_ATTEMPTS.find((a) => a.id === attemptId);

  if (!attempt) notFound();

  const pct = attempt.total > 0 ? Math.round((attempt.score / attempt.total) * 100) : 0;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Breadcrumb */}
      <header className="flex items-center gap-2 px-6 py-3 border-b border-border shrink-0">
        <SidebarTrigger />
        <span className="text-[13px] text-muted-foreground">Training</span>
        <span className="text-[13px] text-muted-foreground">/</span>
        <Link href="/training/quick-check" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-100">
          Knowledge check
        </Link>
        <span className="text-[13px] text-muted-foreground">/</span>
        <span className="text-[13px] text-foreground">{formatDate(attempt.date)}</span>
      </header>

      {/* Main canvas */}
      <main
        className="flex-1 overflow-y-auto scroll-thin"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 40%, color-mix(in srgb, #d1f0d1 40%, transparent), transparent), var(--background)`,
        }}
      >
        <div className="max-w-[640px] mx-auto px-8 py-12 flex flex-col gap-8">
          {/* Back link */}
          <Link
            href="/training/quick-check"
            className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-100 w-fit"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            Back to knowledge check
          </Link>

          {/* Heading */}
          <div className="flex flex-col gap-2">
            <h1 className="text-[28px] leading-[36px] font-bold text-foreground">
              Check results
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-[14px] text-muted-foreground">{formatDate(attempt.date)}</span>
              <span className="text-muted-foreground text-[14px]">·</span>
              <span className="text-[14px] text-muted-foreground">
                {attempt.categories.map((c) => CATEGORY_LABELS[c]).join(", ")}
              </span>
              <span className="text-muted-foreground text-[14px]">·</span>
              <span className="text-[14px] text-muted-foreground">
                {attempt.formats.map((f) => FORMAT_LABELS[f]).join(", ")}
              </span>
            </div>
            <div className="flex items-baseline gap-3 mt-1">
              <span
                className="text-[48px] leading-none font-bold tabular-nums"
                style={{ color: pct >= 70 ? "var(--primary)" : "var(--destructive)" }}
              >
                {pct}%
              </span>
              <span className="text-[18px] text-muted-foreground font-medium">
                {attempt.score} of {attempt.total} correct
              </span>
            </div>
          </div>

          {/* Score table */}
          <KCScoreTable questions={attempt.questions} answers={attempt.answers} />

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Link
              href="/training/quick-check"
              className="flex items-center justify-center h-[40px] rounded-[8px] text-[14px] leading-[20px] font-semibold transition-opacity duration-100 hover:opacity-90"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              Try another check
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
