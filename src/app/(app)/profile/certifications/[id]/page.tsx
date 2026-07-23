"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { TierChip } from "@/components/training/HonorCard";
import { RequiredPill } from "@/components/training/ModuleCard";
import { ModuleIllustration } from "@/components/training/ModuleIllustration";
import { useGlassHeader } from "@/hooks/use-glass-header";
import { PASS_MARK } from "@/lib/exam-mock";
import { getTier, isCertified, EXAM_SECTIONS } from "@/lib/training-mock";
import { getLearnerModule } from "@/lib/training-store";
import { useCurrentRole } from "@/lib/current-role";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/**
 * Certification detail — the dedicated page a single earned certification opens
 * to. Reached only by clicking a certification (Profile grid, Home shelf, Home
 * readiness board's certified rows), never from the nav. The route lives under
 * Profile (breadcrumb "Profile › {title}") because certifications are a profile
 * credential; the back link returns to wherever the click came from (?from=).
 */
export default function CertificationDetailPage() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const { headerClassName, onScroll } = useGlassHeader();

  const moduleId = params?.id ?? "";
  const m = getLearnerModule(moduleId, useCurrentRole());
  const backHref = search.get("from") || "/profile";
  const title = m?.title ?? "Certification";
  const tier = m ? getTier(m) : null;
  const cert = m?.certification;

  return (
    <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
      <PageHeader
        crumbs={[{ label: "Profile", href: "/profile" }, { label: title }]}
        className={headerClassName}
      />

      <ScrollCanvas onScroll={onScroll}>
        <div className="max-w-[720px] mx-auto px-4 sm:px-8 pt-8 pb-12 flex flex-col gap-6">
          <Link
            href={backHref}
            className="flex items-center gap-1.5 w-fit text-[13px] leading-[20px] text-muted-foreground hover:text-foreground transition-colors duration-100"
          >
            <ArrowLeft size={14} strokeWidth={2} />
            <span>Back</span>
          </Link>

          {!m ? (
            /* Unknown module id — graceful fallback rather than a broken page. */
            <section
              className="rounded-[12px] p-6 flex flex-col items-start gap-2 bg-surface-raised"
              style={{ border: "1px solid var(--border)" }}
            >
              <h1 className="text-[22px] leading-[30px] font-bold text-foreground">Certification unavailable</h1>
              <p className="text-[14px] leading-[20px] text-muted-foreground">
                We couldn&apos;t find this certification.
              </p>
              <Link
                href="/profile"
                className="text-[13px] leading-[20px] font-medium transition-opacity duration-100 hover:opacity-70"
                style={{ color: "var(--primary)" }}
              >
                Back to profile
              </Link>
            </section>
          ) : !isCertified(m) || !cert || !tier ? (
            /* Module exists but the certification hasn't been earned yet (direct
               URL hit). Point the user at the work that earns it. */
            <section
              className="rounded-[12px] p-6 flex flex-col items-start gap-3 bg-surface-raised"
              style={{ border: "1px solid var(--border)" }}
            >
              <RequiredPill required={m.required} />
              <h1 className="text-[22px] leading-[30px] font-bold text-foreground">{m.title}</h1>
              <p className="text-[14px] leading-[20px] text-muted-foreground">
                You haven&apos;t earned this certification yet. Finish the module and pass its exam to earn it.
              </p>
              <Button size="cta" asChild>
                <Link href={`/training/modules/${m.id}`}>Go to module</Link>
              </Button>
            </section>
          ) : (
            <>
              {/* Identity + overall score */}
              <section
                className="relative overflow-hidden rounded-[12px] p-6 bg-surface-raised"
                style={{ border: "1px solid var(--border)" }}
              >
                {/* Card-gradient bleed — same recipe as ModuleCard, but as a
                    full-card layer: a left-anchored radial glow that fills the
                    whole card (through the padding, clipped only by the rounded
                    edge) and melts rightward into the body. */}
                <div
                  className="absolute inset-0 z-0 pointer-events-none"
                  style={{ background: "var(--illustration-glow-side-card)" }}
                />

                <div className="relative z-10 flex items-center gap-4">
                  <ModuleIllustration
                    category={m.category}
                    width={48}
                    height={48}
                    className="hidden sm:block shrink-0 object-contain"
                  />

                  <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <TierChip tier={tier} />
                      <RequiredPill required={m.required} />
                    </div>
                    <h1 className="text-[22px] leading-[30px] sm:text-[28px] sm:leading-[36px] font-bold text-foreground">
                      {m.title}
                    </h1>
                    <p className="text-[13px] leading-[18px] text-muted-foreground">
                      Issued {formatDate(cert.date)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-[32px] leading-[36px] font-bold tabular-nums text-foreground">
                      {cert.score}%
                    </span>
                    <span className="text-[12px] leading-[16px] text-muted-foreground">Overall score</span>
                  </div>
                </div>
              </section>

              {/* Section results */}
              <section
                className="rounded-[12px] p-6 flex flex-col gap-5 bg-surface-raised"
                style={{ border: "1px solid var(--border)" }}
              >
                <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">Section results</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {EXAM_SECTIONS.map((label, i) => {
                    const s = cert.sectionScores[i] ?? 0;
                    return (
                      <div
                        key={label}
                        // Static chip-card per section — no hover, since it isn't
                        // interactive (nothing to click through to).
                        className="flex flex-col gap-3 rounded-[10px] p-4 bg-surface-lifted"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[14px] leading-[20px] font-medium text-foreground">{label}</span>
                          <span className="text-[14px] leading-[20px] font-semibold tabular-nums text-foreground">
                            {s}%
                          </span>
                        </div>
                        <ProgressBar value={s} />
                      </div>
                    );
                  })}
                </div>
                <p className="text-[12px] leading-[16px] text-muted-foreground">
                  Overall pass mark {PASS_MARK}%.
                </p>
              </section>
            </>
          )}
        </div>
      </ScrollCanvas>
    </div>
  );
}
