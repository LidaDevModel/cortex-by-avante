"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { ReadinessBoard } from "@/components/dashboard/ReadinessBoard";
import { ClearedBadge } from "@/components/dashboard/ClearedBadge";
import { AskCortexCard } from "@/components/dashboard/AskCortexCard";
import { ContinueLearning } from "@/components/dashboard/ContinueLearning";
import { QuickPractice } from "@/components/dashboard/QuickPractice";
import { CertificationsShelf } from "@/components/dashboard/CertificationsShelf";
import { RecencyFeed } from "@/components/dashboard/RecencyFeed";
import { useGlassHeader } from "@/hooks/use-glass-header";
import { MODULES, getRequiredModules, getCertifiedModules, getRecentModules, isShiftReady } from "@/lib/training-mock";
import { getRecentDocuments } from "@/lib/library-mock";
import { USER } from "@/lib/user-mock";

/** Two dashboard cards side by side on desktop, stacked below lg. Children
    stretch (each widget card is h-full) so paired cards match heights. */
function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">{children}</div>;
}

export default function DashboardPage() {
  // Readiness gates shift eligibility — the central predicate for the layout.
  const requiredModules = getRequiredModules();
  const cleared = isShiftReady();

  // Time-aware greeting + date meta, set after mount (client clock ≠ prerender
  // clock, so deriving in render would mismatch hydration).
  const [greeting, setGreeting] = useState("Welcome back");
  const [dateMeta, setDateMeta] = useState<string | null>(null);
  useEffect(() => {
    const now = new Date();
    const h = now.getHours();
    setGreeting(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
    setDateMeta(now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }));
  }, []);

  // Header turns glass once the canvas scrolls (shared canvas-glow behavior).
  const { headerClassName, onScroll } = useGlassHeader();

  const inProgress = MODULES.filter((m) => m.status === "in-progress");

  // ─── Reusable section blocks (placed per state) ───

  const continueLearning = <ContinueLearning modules={inProgress} />;
  const quickPractice = <QuickPractice />;
  const certifications = getCertifiedModules().length > 0 ? <CertificationsShelf /> : null;
  // RecencyFeed self-hides when empty (14-day window = the lib defaults) —
  // mirrored here so a lone sibling isn't stranded in a half-width column.
  const hasRecent = getRecentDocuments().length > 0 || getRecentModules().length > 0;
  const newForYourRole = hasRecent ? <RecencyFeed /> : null;

  const askCortex = <AskCortexCard />;

  return (
    <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
      <PageHeader crumbs={[{ label: "Home" }]} className={headerClassName} />

      <ScrollCanvas onScroll={onScroll}>
        <div className="max-w-[920px] mx-auto px-4 sm:px-8 pt-8 pb-12 flex flex-col gap-8">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-[28px] leading-[36px] font-bold text-foreground">{greeting}, {USER.firstName}</h1>
              {cleared && <ClearedBadge requiredCount={requiredModules.length} />}
            </div>
            {dateMeta && (
              <p className="text-[13px] leading-[18px] text-muted-foreground">{dateMeta}</p>
            )}
          </div>

          {cleared ? (
            /* ── State B — cleared for shift: Ask Cortex is the hero ── */
            <>
              {askCortex}
              {certifications}
              <Row>
                {continueLearning}
                {quickPractice}
              </Row>
              {newForYourRole}
            </>
          ) : (
            /* ── State A — pre-shift onboarding: readiness board is the hero ── */
            <>
              <ReadinessBoard requiredModules={requiredModules} role={USER.role} />
              <Row>
                {continueLearning}
                {quickPractice}
              </Row>
              {askCortex}
              {certifications && newForYourRole ? (
                <Row>
                  {certifications}
                  {newForYourRole}
                </Row>
              ) : (
                <>
                  {certifications}
                  {newForYourRole}
                </>
              )}
            </>
          )}
        </div>
      </ScrollCanvas>
    </div>
  );
}
