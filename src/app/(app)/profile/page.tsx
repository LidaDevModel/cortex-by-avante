"use client";

import Link from "next/link";
import { UserRoundPen } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ClearedBadge } from "@/components/dashboard/ClearedBadge";
import { HonorCard } from "@/components/training/HonorCard";
import { ModuleIllustration } from "@/components/training/ModuleIllustration";
import { useGlassHeader } from "@/hooks/use-glass-header";
import { useInView } from "@/hooks/use-in-view";
import { getAuthProfile } from "@/lib/auth-mock";
import { CATEGORY_LABELS } from "@/lib/knowledge-check-mock";
import {
  MODULES,
  type ModuleCategory,
  getCertifiedModules,
  getRequiredModules,
  isShiftReady,
} from "@/lib/training-mock";
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
  const { headerClassName, onScroll } = useGlassHeader();
  const profile = getAuthProfile();

  const certified = getCertifiedModules();
  const cleared = isShiftReady();
  const completedModules = MODULES.filter((m) => m.status === "completed").length;

  // Skill areas — the categories the user holds certifications in.
  const skillAreas = [...new Set(certified.map((m) => m.category))].map((category) => ({
    category: category as ModuleCategory,
    count: certified.filter((m) => m.category === category).length,
  }));

  const { ref: certsRef, inView } = useInView<HTMLElement>();

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
              member since {memberSinceLabel(USER.memberSince)}
            </p>

            <p className="text-[12px] leading-[16px] text-muted-foreground">Visible to Avante staff.</p>
          </section>

          {/* Certifications — the credentials, front and center */}
          <section
            ref={certsRef}
            className="rounded-[12px] p-6 flex flex-col gap-5 bg-surface-raised"
            style={{ border: "1px solid var(--border)" }}
          >
            <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">
              Certifications ({certified.length})
            </h2>
            {certified.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {certified.map((m, i) => (
                  <HonorCard key={m.id} module={m} carousel={false} start={inView} index={i} />
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

          {/* Skill areas — derived from certifications, never self-claimed */}
          {skillAreas.length > 0 && (
            <section
              className="rounded-[12px] p-6 flex flex-col gap-5 bg-surface-raised"
              style={{ border: "1px solid var(--border)" }}
            >
              <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">Skill areas</h2>
              <div className="flex flex-wrap gap-2">
                {skillAreas.map(({ category, count }) => (
                  <span
                    key={category}
                    className="inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-surface-chip"
                    style={{ border: "1px solid transparent" }}
                  >
                    <ModuleIllustration category={category} width={20} height={20} className="flex shrink-0" />
                    <span className="text-[13px] leading-[18px] font-medium text-foreground">
                      {CATEGORY_LABELS[category]}
                    </span>
                    <span className="text-[13px] leading-[18px] text-muted-foreground tabular-nums">{count}</span>
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </ScrollCanvas>
    </div>
  );
}
