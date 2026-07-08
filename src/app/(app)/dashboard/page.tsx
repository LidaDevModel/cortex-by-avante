"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, ArrowRight, FileText } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { Button } from "@/components/ui/button";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { InProgressCard } from "@/components/training/ModuleCard";
import { MODULES } from "@/lib/training-mock";
import { getNewDocuments } from "@/lib/library-mock";
import { USER } from "@/lib/user-mock";

/** Counts 0 → target over ~500ms; lands instantly under reduced motion. */
function useCountUp(target: number, durationMs = 500) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      setValue(Math.round(t * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

export default function DashboardPage() {
  const router = useRouter();

  // ─── Derived state (all from existing data) ───
  const requiredModules = MODULES.filter((m) => m.required);
  const certifiedCount = requiredModules.filter((m) => m.status === "completed").length;
  const remainingRequired = requiredModules.filter((m) => m.status !== "completed");
  const isCleared = remainingRequired.length === 0;
  // Goal-gradient: nudge toward the closest-to-done required module.
  const nextRequired = [...remainingRequired].sort((a, b) => b.progress - a.progress)[0];

  const inProgress = MODULES.filter((m) => m.status === "in-progress").slice(0, 3);
  const newDocs = getNewDocuments();

  const shownCertified = useCountUp(certifiedCount);
  // Segments fill one by one after mount instead of appearing pre-filled.
  const [segmentsLive, setSegmentsLive] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setSegmentsLive(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
      <PageHeader crumbs={[{ label: "Dashboard" }]} className="bg-transparent" />

      <ScrollCanvas>
        <div className="max-w-[920px] mx-auto px-8 pt-8 pb-12 flex flex-col gap-8">
          <h1 className="text-[28px] leading-[36px] font-bold text-foreground">Welcome back, {USER.firstName}</h1>

          {/* ── Hero: shift readiness ── */}
          <section
            className="rounded-[12px] p-6 flex flex-col gap-5"
            style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
          >
            {isCleared ? (
              /* State B — cleared (compact reassurance) */
              <div className="flex items-center gap-3">
                <span
                  className="flex items-center justify-center w-9 h-9 rounded-full shrink-0"
                  style={{ background: "var(--primary)" }}
                >
                  <Check size={18} strokeWidth={2} style={{ color: "var(--primary-foreground)" }} />
                </span>
                <div className="flex flex-col">
                  <p className="text-[18px] leading-[26px] font-bold text-foreground">You&apos;re cleared for duty.</p>
                  <p className="text-[13px] leading-[18px] text-muted-foreground">
                    All {requiredModules.length} required certifications are current.
                  </p>
                </div>
              </div>
            ) : (
              /* State A — onboarding (countdown to shift-ready) */
              <>
                <div className="flex flex-col gap-3">
                  <p className="section-label">Certification path</p>
                  <p className="text-[22px] leading-[30px] font-bold text-foreground">
                    {remainingRequired.length} module{remainingRequired.length !== 1 ? "s" : ""} left to be shift-ready
                  </p>

                  {/* Segmented progress — one segment per required module, filling in sequence */}
                  <div className="flex gap-1.5" role="progressbar" aria-valuenow={certifiedCount} aria-valuemax={requiredModules.length}>
                    {requiredModules.map((m, i) => (
                      <div
                        key={m.id}
                        className="h-2 flex-1 rounded-full transition-colors duration-300"
                        style={{
                          background: segmentsLive && m.status === "completed" ? "var(--primary)" : "var(--border)",
                          transitionDelay: `${i * 80}ms`,
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-[13px] leading-[18px] text-muted-foreground tabular-nums">
                    {shownCertified} of {requiredModules.length} required certifications complete
                  </p>
                </div>

                {/* Required-module checklist */}
                <ul className="flex flex-col">
                  {requiredModules.map((m) => {
                    const done = m.status === "completed";
                    const isNext = nextRequired && m.id === nextRequired.id;
                    return (
                      <li
                        key={m.id}
                        className="flex items-center justify-between gap-3 py-2.5 border-t border-border first:border-t-0"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="flex items-center justify-center w-5 h-5 rounded-full shrink-0"
                            style={
                              done
                                ? { background: "var(--primary)" }
                                : { border: "1.5px solid var(--border)" }
                            }
                          >
                            {done && <Check size={12} strokeWidth={2.5} style={{ color: "var(--primary-foreground)" }} />}
                          </span>
                          <span
                            className="text-[14px] leading-[20px] truncate"
                            style={{ color: "var(--foreground)", fontWeight: isNext ? 600 : 400 }}
                          >
                            {m.title}
                          </span>
                        </div>
                        <span
                          className="text-[12px] leading-[16px] tabular-nums shrink-0"
                          style={{ color: done ? "var(--primary)" : "var(--muted-foreground)" }}
                        >
                          {done ? "Certified" : m.status === "in-progress" ? `${m.progress}%` : "Not started"}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {/* Primary next step */}
                {nextRequired && (
                  <Button asChild size="cta" className="self-start">
                    <Link href={`/training/modules/${nextRequired.id}`}>
                      {nextRequired.progress > 0 ? "Continue" : "Start"} {nextRequired.title}
                      <ArrowRight size={16} strokeWidth={1.5} />
                    </Link>
                  </Button>
                )}
              </>
            )}
          </section>

          {/* ── Jump back in ── */}
          {inProgress.length > 0 && (
            <section className="flex flex-col gap-3">
              <p className="section-label">Jump back in</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {inProgress.map((m) => (
                  <InProgressCard key={m.id} module={m} />
                ))}
              </div>
            </section>
          )}

          {/* ── Ask Cortex ── */}
          <section className="flex flex-col gap-3">
            <p className="section-label">Ask Cortex</p>
            <ChatComposer onSubmit={(text) => router.push(`/chat?q=${encodeURIComponent(text)}`)} />
          </section>

          {/* ── New for your role ── */}
          {newDocs.length > 0 && (
            <section className="flex flex-col gap-3">
              <p className="section-label">New for your role</p>
              <div className="flex flex-col rounded-[12px] overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                {newDocs.map((d) => (
                  <Link
                    key={d.id}
                    href={`/library/files/${d.id}`}
                    className="flex items-center gap-3 px-4 py-3 border-t border-border first:border-t-0 transition-colors duration-100 hover:bg-[var(--surface-raised)]"
                  >
                    <FileText size={16} strokeWidth={1.5} className="text-muted-foreground shrink-0" />
                    <span className="text-[14px] leading-[20px] font-medium truncate" style={{ color: "var(--primary)" }}>
                      {d.name}
                    </span>
                    <span
                      className="text-[11px] leading-[16px] font-medium px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: "color-mix(in srgb, var(--accent-subtle) 50%, transparent)", color: "var(--primary)" }}
                    >
                      New
                    </span>
                    <span className="text-[12px] leading-[16px] text-muted-foreground shrink-0 ml-auto">{d.content}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </ScrollCanvas>
    </div>
  );
}
