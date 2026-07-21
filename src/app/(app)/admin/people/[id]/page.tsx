"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FilterSelect } from "@/components/ui/filter-select";
import { NotFoundState } from "@/components/ui/not-found-state";
import { StatusPill } from "@/components/admin/status-pill";
import { BackLink } from "@/components/admin/back-link";
import { ExitConfirmDialog } from "@/components/ui/exit-confirm-dialog";
import { showToast } from "@/components/ui/toast";
import { useGlassHeader } from "@/hooks/use-glass-header";
import { useAdminUsers, updateUserRole, setUserStatus, getUserPin } from "@/lib/admin-store";
import { ROLE_LABEL, type Role } from "@/lib/user-mock";

const ROLE_OPTIONS = [
  { value: "field-agent", label: ROLE_LABEL["field-agent"] },
  { value: "admin", label: ROLE_LABEL.admin },
];

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[12px] p-4 sm:p-6 flex flex-col gap-4 bg-surface-raised" style={{ border: "1px solid var(--border)" }}>
      <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

export default function AdminPersonPage() {
  const { headerClassName, onScroll } = useGlassHeader();
  const { id } = useParams<{ id: string }>();
  const user = useAdminUsers().find((u) => u.id === id);
  const [pin, setPin] = useState<string | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  if (!user) {
    return (
      <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
        <PageHeader crumbs={[{ label: "Admin", href: "/admin" }, { label: "People", href: "/admin/people" }, { label: "Not found" }]} className={headerClassName} />
        <NotFoundState title="User not found" description="This person may have been removed. Return to the staff list." actionLabel="Back to people" actionHref="/admin/people" />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
      <PageHeader crumbs={[{ label: "Admin", href: "/admin" }, { label: "People", href: "/admin/people" }, { label: user.fullName }]} className={headerClassName} />

      <ScrollCanvas onScroll={onScroll}>
        <div className="max-w-[720px] mx-auto px-4 sm:px-8 pt-8 pb-12 flex flex-col gap-6">
          <BackLink href="/admin/people" label="Back to People" />

          {/* Identity */}
          <Section title="Identity">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 rounded-full shrink-0">
                <AvatarFallback className="rounded-full bg-secondary text-primary font-semibold text-[18px]">{user.initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[16px] leading-[22px] font-semibold text-foreground truncate">{user.fullName}</span>
                  <StatusPill status={user.status} />
                </div>
                <span className="text-[14px] leading-[20px] text-muted-foreground truncate">{user.email}</span>
                <span className="text-[12px] leading-[16px] text-muted-foreground">Member since {formatDate(user.memberSince)} · {user.certifications} certifications</span>
              </div>
            </div>
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
                onChange={(v) => { updateUserRole(user.id, v as Role); showToast({ title: "Role updated", description: `${user.fullName} is now ${ROLE_LABEL[v as Role]}.` }); }}
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
                    onClick={() => showToast({ title: "Invitation resent", description: `A new PIN was issued for ${user.email}.` })}
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
