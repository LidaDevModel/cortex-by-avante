"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, UserRoundPen } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ClearedBadge } from "@/components/dashboard/ClearedBadge";
import { HonorCard } from "@/components/training/HonorCard";
import { ModuleIllustration } from "@/components/training/ModuleIllustration";
import { useGlassHeader } from "@/hooks/use-glass-header";
import { useInView } from "@/hooks/use-in-view";
import { getAuthProfile, signOut } from "@/lib/auth-mock";
import { CATEGORY_LABELS } from "@/lib/knowledge-check-mock";
import {
  getModules,
  type ModuleCategory,
  getCertifiedModules,
  getRequiredModules,
  isShiftReady,
} from "@/lib/training-mock";
import { getPersona } from "@/lib/demo-persona";
import { USER } from "@/lib/user-mock";

function memberSinceLabel(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

/**
 * The internal profile ("how colleagues see you"): provisioned identity +
 * self-set photo/description, and the earned credentials front and center.
 * Skills are derived from certifications — evidence-backed, never self-claimed.
 * Rendered from the single mock user today; shaped so a future /profile/[id]
 * is a route addition, not a redesign.
 */
export default function ProfilePage() {
  const router = useRouter();
  const { headerClassName, onScroll } = useGlassHeader();
  const profile = getAuthProfile();

  const certified = getCertifiedModules();
  const cleared = isShiftReady();
  const completedModules = getModules().filter((m) => m.status === "completed").length;
  // A brand-new guard joined just now; Mike carries his provisioned start date.
  const memberSince = getPersona() === "new" ? new Date().toISOString() : USER.memberSince;

  // Skill areas — the categories the user holds certifications in.
  const skillAreas = [...new Set(certified.map((m) => m.category))].map((category) => ({
    category: category as ModuleCategory,
    count: certified.filter((m) => m.category === category).length,
  }));

  const { ref: certsRef, inView } = useInView<HTMLElement>();

  // Category filter for the certifications grid — the pills double as the
  // skill-area summary (the categories the user holds certs in) and a
  // single-select filter, defaulting to "all".
  const [catFilter, setCatFilter] = useState<ModuleCategory | "all">("all");
  const shownCerts = catFilter === "all" ? certified : certified.filter((m) => m.category === catFilter);

  // Deep link from the dashboard's "View all" (/profile#certifications) — bring
  // the certifications section to the top of the scroll canvas after paint.
  useEffect(() => {
    if (window.location.hash !== "#certifications") return;
    const raf = requestAnimationFrame(() => {
      document.getElementById("certifications")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
      <PageHeader crumbs={[{ label: "Profile" }]} className={headerClassName} />

      <ScrollCanvas onScroll={onScroll}>
        <div className="max-w-[920px] mx-auto px-4 sm:px-8 pt-8 pb-12 flex flex-col gap-8">
          {/* Identity */}
          <section
            className="rounded-[12px] p-6 flex flex-col gap-5 bg-surface-raised"
            style={{ border: "1px solid var(--border)" }}
          >
            <div className="flex flex-wrap items-start gap-4">
              <Avatar className="h-16 w-16 rounded-full shrink-0">
                {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt="" />}
                <AvatarFallback className="rounded-full bg-secondary text-primary font-semibold text-[18px]">
                  {USER.initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-[22px] leading-[30px] sm:text-[28px] sm:leading-[36px] font-bold text-foreground">
                    {USER.fullName}
                  </h1>
                  {cleared && <ClearedBadge requiredCount={getRequiredModules().length} />}
                </div>
                <p className="text-[14px] leading-[20px] text-muted-foreground">{USER.role}</p>
                {profile.description && (
                  <p className="text-[14px] leading-[20px] text-foreground pt-1">{profile.description}</p>
                )}
              </div>

              <Link
                href="/profile/edit"
                className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 h-[36px] px-4 rounded-[8px] text-[13px] font-semibold border transition-colors duration-100 hover:bg-[var(--surface-lifted)]"
                style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
              >
                <UserRoundPen size={15} strokeWidth={1.5} />
                Edit profile
              </Link>
            </div>

            {/* Quiet stats row */}
            <p className="text-[13px] leading-[18px] text-muted-foreground tabular-nums">
              <span className="font-semibold text-foreground">{completedModules}</span> modules completed ·{" "}
              <span className="font-semibold text-foreground">{certified.length}</span> certification
              {certified.length !== 1 ? "s" : ""} ·{" "}
              member since {memberSinceLabel(memberSince)}
            </p>

            <p className="text-[12px] leading-[16px] text-muted-foreground">Visible to Avante staff.</p>

            {/* Full-bleed divider, then sign out — the account exit lives on
                the profile card (not tucked in settings). */}
            <div className="-mx-6 h-px bg-border" />
            <button
              type="button"
              onClick={() => {
                signOut();
                router.push("/sign-in");
              }}
              className="flex items-center gap-1.5 w-fit text-[13px] leading-[20px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-100"
            >
              <LogOut size={14} strokeWidth={1.5} />
              Sign out
            </button>
          </section>

          {/* Certifications — the credentials, front and center. id + scroll-mt
              are the deep-link target for the dashboard's "View all". */}
          <section
            id="certifications"
            ref={certsRef}
            className="scroll-mt-8 rounded-[12px] p-6 flex flex-col gap-5 bg-surface-raised"
            style={{ border: "1px solid var(--border)" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">
                Certifications ({certified.length})
              </h2>
              {/* Category pills — same row as the title, right-aligned. The skill
                  areas the user is certified in (icon · label · count), doubling
                  as a single-select filter over the grid below. Only categories
                  the user holds appear, so a filter never empties. */}
              {certified.length > 0 && skillAreas.length > 1 && (
                <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      aria-pressed={catFilter === "all"}
                      onClick={() => setCatFilter("all")}
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-[13px] leading-[18px] font-medium transition-colors duration-100 ${
                        catFilter === "all"
                          ? "bg-[var(--sidebar-active)] text-primary"
                          : "bg-surface-chip text-foreground hover:opacity-80"
                      }`}
                      style={{ border: "1px solid transparent" }}
                    >
                      All
                    </button>
                    {skillAreas.map(({ category, count }) => {
                      const active = catFilter === category;
                      return (
                        <button
                          key={category}
                          type="button"
                          aria-pressed={active}
                          onClick={() => setCatFilter(category)}
                          className={`inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full text-[13px] leading-[18px] font-medium transition-colors duration-100 ${
                            active
                              ? "bg-[var(--sidebar-active)] text-primary"
                              : "bg-surface-chip text-foreground hover:opacity-80"
                          }`}
                          style={{ border: "1px solid transparent" }}
                        >
                          <ModuleIllustration category={category} width={20} height={20} className="flex shrink-0" />
                          {CATEGORY_LABELS[category]}
                          <span className={`tabular-nums ${active ? "text-primary" : "text-muted-foreground"}`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                </div>
              )}
            </div>

            {certified.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {shownCerts.map((m, i) => (
                  <HonorCard key={m.id} module={m} carousel={false} start={inView} index={i} returnTo="/profile#certifications" />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-start gap-2 py-4">
                <p className="text-[14px] leading-[20px] text-muted-foreground">
                  Certifications you earn will appear here.
                </p>
                <Link
                  href="/training/modules"
                  className="text-[13px] leading-[20px] font-medium transition-opacity duration-100 hover:opacity-70"
                  style={{ color: "var(--primary)" }}
                >
                  Start training
                </Link>
              </div>
            )}
          </section>
        </div>
      </ScrollCanvas>
    </div>
  );
}
