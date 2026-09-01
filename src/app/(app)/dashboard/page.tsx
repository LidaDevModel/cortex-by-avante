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
import { NewRequirementCard } from "@/components/dashboard/NewRequirementCard";
import { useGlassHeader } from "@/hooks/use-glass-header";
import {
  acknowledgeRequired,
  useNewRequirements,
  wasClearedBefore,
} from "@/lib/required-seen";
import { isShiftReady } from "@/lib/training-mock";
import { useLearnerModules, getLearnerRecentModules } from "@/lib/training-store";
import { getLearnerRecent, useLibrary } from "@/lib/content-store";
import { USER } from "@/lib/user-mock";
import { useCurrentRole } from "@/lib/current-role";
import { useManageAccess } from "@/hooks/use-admin-unlocked";

/** Two dashboard cards side by side on desktop, stacked below lg. Children
    stretch (each widget card is h-full) so paired cards match heights. */
function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">{children}</div>;
}

export default function DashboardPage() {
  const role = useCurrentRole();
  // Only a CLEARED admin has a separate Manage Home, so their learning surface
  // is a sub-section titled "Learning". For everyone else — field agents and
  // not-cleared admins — this /dashboard IS their home, so it carries the full
  // home header (greeting + date), same as a field agent.
  const canManage = useManageAccess();
  useLibrary(); // reflect published docs in the recency feed
  // Learner's published module set — readiness gates shift eligibility.
  const modules = useLearnerModules(role);
  const requiredModules = modules.filter((m) => m.required);
  const cleared = isShiftReady(modules);
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

  const inProgress = modules.filter((m) => m.status === "in-progress");

  // ─── Reusable section blocks (placed per state) ───

  const continueLearning = <ContinueLearning modules={inProgress} />;
  const quickPractice = <QuickPractice />;
  // Always rendered — the shelf carries its own empty state, so a new hire sees
  // a motivated widget instead of a hole in the grid.
  const certifications = <CertificationsShelf />;
  // RecencyFeed self-hides when empty (14-day window = the lib defaults) —
  // mirrored here so a lone sibling isn't stranded in a half-width column.
  const hasRecent = getLearnerRecent(role).length > 0 || getLearnerRecentModules(role).length > 0;
  const newForYourRole = hasRecent ? <RecencyFeed /> : null;

  const askCortex = <AskCortexCard />;

  // Requirements added since the learner last looked. Readiness itself is a
  // pure boolean with no memory, so without this the dashboard would silently
  // reshape into the onboarding layout — see NewRequirementCard.
  const newlyRequired = useNewRequirements(role);
  const newRequirement = newlyRequired.length > 0 && (
    <NewRequirementCard
      modules={newlyRequired}
      requiredModules={requiredModules}
      role={USER.role}
      wasCleared={wasClearedBefore(role, newlyRequired)}
      onDismiss={() => acknowledgeRequired(role)}
    />
  );

  return (
    <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
      <PageHeader crumbs={[{ label: "Home" }]} className={headerClassName} />

      <ScrollCanvas onScroll={onScroll}>
        <div className="max-w-[920px] mx-auto px-4 sm:px-8 pt-8 pb-12 flex flex-col gap-8">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-[28px] leading-[36px] font-bold text-foreground">{canManage ? "Learning" : `${greeting}, ${USER.firstName}`}</h1>
              {cleared && <ClearedBadge requiredCount={requiredModules.length} />}
            </div>
            {!canManage && dateMeta && (
              <p className="text-[13px] leading-[18px] text-muted-foreground">{dateMeta}</p>
            )}
          </div>

          {/* Requirements changed — explains the board below before the user
              has to guess why their badge disappeared. */}
          {newRequirement}

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
