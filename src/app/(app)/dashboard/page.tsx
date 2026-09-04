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
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { clearWelcome, useWelcomePending } from "@/lib/first-visit";
import { useGlassHeader } from "@/hooks/use-glass-header";
import { useInitialLoad } from "@/hooks/use-initial-load";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonCard } from "@/components/ui/skeleton-blocks";
import {
  acknowledgeRequired,
  useNewRequirements,
  wasClearedBefore,
} from "@/lib/required-seen";
import { daysUntilDue, getDueSoon, isShiftReady } from "@/lib/training-mock";
import { useLearnerModules, getLearnerRecentModules } from "@/lib/training-store";
import { getLearnerRecent, useLibrary } from "@/lib/content-store";
import { USER, ROLE_LABEL } from "@/lib/user-mock";
import { toLearnerRole } from "@/lib/learner-role";
import { useCurrentRole } from "@/lib/current-role";
import { useManageAccess } from "@/hooks/use-admin-unlocked";
import { useLearnerNav } from "@/lib/learner-crumbs";
import { PageTitle } from "@/components/ui/page-title";

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
  // An admin reaches this screen through their sidebar's "Learning" group, and
  // their sidebar calls it "Overview"; a field agent's calls it "Home".
  const { group, isAdmin } = useLearnerNav();
  useLibrary(); // reflect published docs in the recency feed
  // Learner's published module set — readiness gates shift eligibility.
  const modules = useLearnerModules(role);
  const requiredModules = modules.filter((m) => m.required);
  const cleared = isShiftReady(modules);
  // Required modules still inside their 14-day window (D11): clearance holds,
  // but the guard owes them, so the deadline has to be on screen.
  const dueSoon = getDueSoon(requiredModules);
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
  // Home is the screen a guard opens first on a phone with poor signal, and it
  // was the one data screen with no loading shape at all.
  const loading = useInitialLoad("dashboard");

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
  // Day one. The app already KNEW this — activation arms the flag — but Home
  // rendered identically to any other day, and its three lower widgets all
  // said "you have nothing yet", so the first screen's whole tone was absence.
  const welcomePending = useWelcomePending();
  const newlyRequired = useNewRequirements(role);
  const welcome = welcomePending && (
    <WelcomeCard
      requiredModules={requiredModules}
      role={ROLE_LABEL[toLearnerRole(role)]}
      onDismiss={clearWelcome}
    />
  );

  // Both cards are one-time news above the board. They cannot both be day one:
  // a first visit has nothing it was not told about, since required-seen seeds
  // silently on its first read. Welcome wins if they ever coincide.
  const newRequirement = !welcomePending && newlyRequired.length > 0 && (
    <NewRequirementCard
      modules={newlyRequired}
      requiredModules={requiredModules}
      role={ROLE_LABEL[toLearnerRole(role)]}
      wasCleared={wasClearedBefore(role, newlyRequired)}
      onDismiss={() => acknowledgeRequired(role)}
    />
  );

  return (
    <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
      <PageHeader crumbs={[...group, { label: isAdmin ? "Overview" : "Home" }]} className={headerClassName} />

      <ScrollCanvas onScroll={onScroll}>
        <div className="container-wide pt-8 pb-12 flex flex-col gap-8">
          <PageTitle
            title={canManage ? "Learning" : welcomePending ? `Welcome to Cortex, ${USER.firstName}` : `${greeting}, ${USER.firstName}`}
            badge={
              loading ? (
                <Skeleton className="h-7 w-32 rounded-full" />
              ) : (
                cleared && (
                  <ClearedBadge
                    requiredCount={requiredModules.length}
                    dueCount={dueSoon.length}
                    daysLeft={dueSoon.length ? daysUntilDue(dueSoon[0]) : undefined}
                  />
                )
              )
            }
            /* A date, not a description — the separate slot. A cleared admin
               is on their Learning sub-section, and gets no date line. */
            meta={!canManage && dateMeta ? dateMeta : undefined}
          />

          {/* Requirements changed — explains the board below before the user
              has to guess why their badge disappeared. */}
          {!loading && (welcome || newRequirement)}

          {loading ? (
            /* Mirrors both states' shape: one hero card, a pair, then a card.
               Which state it turns out to be does not change the silhouette. */
            <>
              <SkeletonCard lines={2} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <SkeletonCard />
                <SkeletonCard />
              </div>
              <SkeletonCard lines={2} />
            </>
          ) : cleared ? (
            /* ── State B — cleared for shift: Ask Cortex is the hero ── */
            <>
              {askCortex}
              {/* A guard can now be cleared AND owe a module inside its 14-day
                  window (D11). The badge above says "1 module due in 9 days";
                  this is the surface that answers WHICH module and what to do
                  about it, so it has to be here. Before the grace window
                  existed, a cleared guard never had an outstanding
                  requirement, so the board was State A only. */}
              {dueSoon.length > 0 && (
                <ReadinessBoard requiredModules={requiredModules} role={ROLE_LABEL[toLearnerRole(role)]} />
              )}
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
              <ReadinessBoard requiredModules={requiredModules} role={ROLE_LABEL[toLearnerRole(role)]} />
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
