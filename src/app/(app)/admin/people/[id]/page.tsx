"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FilterSelect } from "@/components/ui/filter-select";
import { Segmented } from "@/components/ui/segmented";
import { NotFoundState } from "@/components/ui/not-found-state";
import { StatusPill } from "@/components/admin/status-pill";
import { BackLink } from "@/components/admin/back-link";
import { resolveBack } from "@/lib/admin-nav";
import { ExitConfirmDialog } from "@/components/ui/exit-confirm-dialog";
import { PinDialog } from "@/components/admin/PinDialog";
import { RoleChangeDialog } from "@/components/admin/RoleChangeDialog";
import { ClearedBadge, NotClearedBadge } from "@/components/dashboard/ClearedBadge";
import { TierChip } from "@/components/training/HonorCard";
import { ModuleIllustration } from "@/components/training/ModuleIllustration";
import { CATEGORY_LABELS } from "@/lib/knowledge-check-mock";
import { showToast } from "@/components/ui/toast";
import { useGlassHeader } from "@/hooks/use-glass-header";
import { useAdminUsers, updateUserRole, setUserStatus, getUserPin, regeneratePin } from "@/lib/admin-store";
import { type ModuleCategory } from "@/lib/training-mock";
import { ROLE_LABEL, type Role } from "@/lib/user-mock";

const ROLE_OPTIONS = [
  { value: "field-agent", label: ROLE_LABEL["field-agent"] },
  { value: "admin", label: ROLE_LABEL.admin },
];

/** Requirement lens for the certifications list — the same tabs as the profile. */
const REQ_TABS = [
  { value: "all", label: "All" },
  { value: "required", label: "Required" },
  { value: "optional", label: "Optional" },
] as const;
type ReqFilter = (typeof REQ_TABS)[number]["value"];

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-[12px] p-4 sm:p-6 flex flex-col gap-4 bg-surface-raised" style={{ border: "1px solid var(--border)" }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function AdminPersonPage() {
  const { headerClassName, onScroll } = useGlassHeader();
  const { id } = useParams<{ id: string }>();
  const back = resolveBack(useSearchParams().get("return"), { href: "/admin/people", label: "Back to People" });
  const user = useAdminUsers().find((u) => u.id === id);
  const [pin, setPin] = useState<string | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  // Resend rotates the PIN — show the new one in a dialog the admin dismisses.
  const [resentPin, setResentPin] = useState<string | null>(null);
  // A role change is confirmed (with its capability summary) before it commits.
  const [pendingRole, setPendingRole] = useState<Role | null>(null);
  // Requirement lens (tabs) + skill-area lens (pills) for the certifications list.
  const [reqFilter, setReqFilter] = useState<ReqFilter>("all");
  const [catFilter, setCatFilter] = useState<ModuleCategory | "all">("all");

  if (!user) {
    return (
      <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
        <PageHeader crumbs={[{ label: "Admin", href: "/admin" }, { label: "People", href: "/admin/people" }, { label: "Not found" }]} className={headerClassName} />
        <NotFoundState title="User not found" description="This person may have been removed. Return to the staff list." actionLabel="Back to people" actionHref="/admin/people" />
      </div>
    );
  }

  // Requirement lens — offered only when the person holds both kinds, so a tab
  // never lands on an empty set by itself.
  const hasRequired = user.certs.some((c) => c.required);
  const hasOptional = user.certs.some((c) => !c.required);
  const showReqTabs = hasRequired && hasOptional;

  // Skill-area lens — the categories the person holds certs in (icon · label ·
  // count), doubling as a single-select filter that combines with the tabs.
  const skillAreas = [...new Set(user.certs.map((c) => c.category))].map((category) => ({
    category,
    count: user.certs.filter((c) => c.category === category).length,
  }));

  const byReq =
    reqFilter === "all" || !showReqTabs
      ? user.certs
      : user.certs.filter((c) => (reqFilter === "required" ? c.required : !c.required));
  const shownCerts = catFilter === "all" ? byReq : byReq.filter((c) => c.category === catFilter);

  return (
    <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
      <PageHeader crumbs={[{ label: "Admin", href: "/admin" }, { label: "People", href: "/admin/people" }, { label: user.fullName }]} className={headerClassName} />

      <ScrollCanvas onScroll={onScroll}>
        <div className="max-w-[720px] mx-auto px-4 sm:px-8 pt-8 pb-12 flex flex-col gap-6">
          <BackLink href={back.href} label={back.label} />

          {/* Identity */}
          <Section title="Identity">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 rounded-full shrink-0">
                <AvatarFallback className="rounded-full bg-secondary text-primary font-semibold text-[18px]">{user.initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[16px] leading-[22px] font-semibold text-foreground truncate">{user.fullName}</span>
                  <StatusPill status={user.status} />
                  {/* Shift-readiness — only for active field agents (the on-shift
                      role); it doesn't apply to admins or to accounts that can't
                      sign in yet. */}
                  {user.role === "field-agent" && user.status === "active" && (
                    user.shiftReady ? <ClearedBadge /> : <NotClearedBadge />
                  )}
                </div>
                <span className="text-[14px] leading-[20px] text-muted-foreground truncate">{user.email}</span>
                <span className="text-[12px] leading-[16px] text-muted-foreground">Member since {formatDate(user.memberSince)}</span>
              </div>
            </div>
          </Section>

          {/* Certifications — read-only. The credentials this person holds, using
              the same tier chip + category illustration as the learner profile so
              a certification reads as one persistent object across roles. */}
          <Section
            title={`Certifications (${user.certs.length})`}
            action={
              showReqTabs ? (
                <Segmented
                  options={REQ_TABS}
                  value={reqFilter}
                  onChange={setReqFilter}
                  ariaLabel="Filter certifications by requirement"
                />
              ) : undefined
            }
          >
            {/* Skill-area pills — the categories the person is certified in,
                combining with the requirement tabs above. Only categories held
                appear, and only when there's more than one. */}
            {skillAreas.length > 1 && (
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

            {user.certs.length === 0 ? (
              <p className="text-[14px] leading-[20px] text-muted-foreground">No certifications yet.</p>
            ) : shownCerts.length > 0 ? (
              <div className="flex flex-col -my-1">
                {shownCerts.map((c, i) => (
                  <div
                    key={`${c.module}-${c.date}`}
                    className="flex items-center gap-3 py-3"
                    style={i > 0 ? { borderTop: "1px solid var(--border)" } : undefined}
                  >
                    <ModuleIllustration category={c.category} width={36} height={36} className="flex shrink-0" />
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <span className="text-[14px] leading-[20px] font-semibold text-foreground truncate">{c.module}</span>
                      <span className="text-[12px] leading-[16px] text-muted-foreground">{CATEGORY_LABELS[c.category]}</span>
                    </div>
                    <div className="shrink-0 hidden sm:flex">
                      <TierChip tier={c.score === 100 ? "ace" : "certified"} />
                    </div>
                    <div className="flex flex-col items-end gap-0.5 shrink-0 w-[88px]">
                      <span className="text-[14px] leading-[20px] font-semibold tabular-nums text-foreground">{c.score}%</span>
                      <span className="text-[12px] leading-[16px] text-muted-foreground">{formatDate(c.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[14px] leading-[20px] text-muted-foreground">No certifications match this filter.</p>
            )}
          </Section>

          {/* Manage */}
          <Section title="Manage">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex flex-col gap-0.5">
                <span className="text-[14px] leading-[20px] font-medium text-foreground">Role</span>
                <span className="text-[12px] leading-[16px] text-muted-foreground">Controls what this person can access.</span>
              </div>
              <FilterSelect
                value={user.role}
                onChange={(v) => { if (v !== user.role) setPendingRole(v as Role); }}
                options={ROLE_OPTIONS}
              />
            </div>

            <div className="h-px bg-border" />

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex flex-col gap-0.5">
                <span className="text-[14px] leading-[20px] font-medium text-foreground">Account status</span>
                <span className="text-[12px] leading-[16px] text-muted-foreground">
                  {user.status === "invited" ? "Invitation sent. Waiting for activation." : user.status === "deactivated" ? "This account cannot sign in." : "This account is active."}
                </span>
              </div>
              {user.status === "invited" ? (
                <div className="flex items-center gap-3">
                  <span className="text-[12px] leading-[16px] text-muted-foreground">Invited {formatDate(user.memberSince)}</span>
                  <button
                    onClick={() => { const next = regeneratePin(user.id); if (next) { setResentPin(next); if (pin) setPin(next); } }}
                    className="h-9 px-4 rounded-[8px] text-[13px] font-semibold border border-primary text-primary transition-opacity duration-100 hover:opacity-70"
                  >
                    Resend invite
                  </button>
                </div>
              ) : user.status === "deactivated" ? (
                <button
                  onClick={() => { setUserStatus(user.id, "active"); showToast({ title: "Account reactivated" }); }}
                  className="h-9 px-4 rounded-[8px] text-[13px] font-semibold border border-primary text-primary transition-opacity duration-100 hover:opacity-70"
                >
                  Reactivate
                </button>
              ) : (
                <button
                  onClick={() => setConfirmDeactivate(true)}
                  className="h-9 px-4 rounded-[8px] text-[13px] font-semibold border border-border text-destructive transition-opacity duration-100 hover:opacity-70"
                >
                  Deactivate
                </button>
              )}
            </div>

            {/* Activation PIN — retrievable until the account is activated. */}
            {user.status === "invited" && (
              <>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[14px] leading-[20px] font-medium text-foreground">Activation PIN</span>
                    <span className="text-[12px] leading-[16px] text-muted-foreground">Share this with {user.fullName} to activate their account.</span>
                  </div>
                  {pin ? (
                    <span className="text-[18px] leading-[24px] font-semibold tracking-[0.2em] tabular-nums text-foreground">{pin}</span>
                  ) : (
                    <button
                      onClick={() => setPin(getUserPin(user.id) ?? null)}
                      className="h-9 px-4 rounded-[8px] text-[13px] font-semibold border border-primary text-primary transition-opacity duration-100 hover:opacity-70"
                    >
                      Show activation PIN
                    </button>
                  )}
                </div>
              </>
            )}
          </Section>
        </div>
      </ScrollCanvas>

      {pendingRole && (
        <RoleChangeDialog
          name={user.fullName}
          fromRole={user.role}
          toRole={pendingRole}
          onConfirm={() => {
            updateUserRole(user.id, pendingRole);
            showToast({ title: "Role updated", description: `${user.fullName} is now ${ROLE_LABEL[pendingRole]}.` });
            setPendingRole(null);
          }}
          onClose={() => setPendingRole(null)}
        />
      )}

      {resentPin && (
        <PinDialog
          title="Invitation resent"
          description={`A new PIN was issued for ${user.email}. The old one no longer works.`}
          pin={resentPin}
          onClose={() => setResentPin(null)}
        />
      )}

      <ExitConfirmDialog
        open={confirmDeactivate}
        onOpenChange={setConfirmDeactivate}
        title="Deactivate account?"
        description={`${user.fullName} won't be able to sign in until reactivated.`}
        exitLabel="Deactivate"
        cancelLabel="Cancel"
        onExit={() => { setConfirmDeactivate(false); setUserStatus(user.id, "deactivated"); showToast({ title: "Account deactivated" }); }}
      />
    </div>
  );
}
