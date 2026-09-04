"use client";

import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { ReadinessBoard } from "@/components/dashboard/ReadinessBoard";
import { useLearnerModules } from "@/lib/training-store";

/**
 * Shown at any /admin route to an admin who isn't yet cleared for duty. Cortex
 * Manage is gated on shift-readiness like every other role's privileged work, so
 * a not-cleared admin gets the same not-cleared experience a field agent sees —
 * the shift-readiness board — framed for Manage. The board's rows link straight
 * into the required modules, so the way to unlock is one tap away.
 *
 * The Manage nav is hidden until cleared, so this is mostly a safety net for a
 * direct URL or a bookmark — but it's the enforcement layer (the shell gates the
 * route; screens never gate themselves).
 */
export function ManageLocked() {
  const required = useLearnerModules("field-agent").filter((m) => m.required);

  return (
    <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
      <PageHeader crumbs={[{ label: "Cortex Manage" }]} className="bg-transparent" />

      <ScrollCanvas>
        <div className="max-w-[920px] mx-auto px-4 sm:px-8 pt-8 pb-12 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full type-caption font-medium bg-surface-raised text-muted-foreground" style={{ border: "1px solid var(--border)" }}>
              <Lock size={13} strokeWidth={1.75} />
              Locked
            </span>
            <h1 className="type-h1 font-bold text-foreground">
              Finish your training to manage content
            </h1>
            <p className="type-label text-muted-foreground max-w-[60ch]">
              Cortex Manage unlocks once you&apos;re cleared for duty — certified in every required module. Earn the certifications below to open content, people, and reports.
            </p>
          </div>

          <ReadinessBoard requiredModules={required} role="field agent" />

          <Link
            href="/dashboard"
            className="self-start inline-flex items-center gap-1.5 type-label font-semibold text-primary hover:opacity-70 transition-opacity duration-100"
          >
            Go to your training
            <ArrowRight size={16} strokeWidth={2} />
          </Link>
        </div>
      </ScrollCanvas>
    </div>
  );
}
