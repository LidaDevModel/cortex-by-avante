"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { useManageAccess } from "@/hooks/use-admin-unlocked";
import { useLearnerModules } from "@/lib/training-store";
import { isCertified } from "@/lib/training-mock";

/*
 * Manage's not-cleared state.
 *
 * An admin who isn't cleared for duty keeps Cortex Manage VISIBLE — the screens,
 * their filters and their table chrome all render — but with no records, every
 * write control disabled, and the reason stated in the place the person is
 * looking. Hiding the section instead reads as "it broke" or "I was demoted" to
 * an admin who was cleared yesterday and lost it to a newly-required module.
 *
 * The rule that makes this safe: the reason travels WITH the emptiness. An empty
 * table on its own is a factual claim ("there are no flagged responses") and
 * would be a lie. `LockedEmpty` replaces that claim with the cause.
 */

/**
 * The empty record list handed to a locked screen. A module-level constant, not
 * a fresh `[]` per render — a new array identity each render would invalidate
 * every downstream useMemo that depends on the list.
 */
export const NO_RECORDS: never[] = [];

/** Whether Manage is locked, and how much training is left to unlock it. */
export function useManageLock(): { locked: boolean; remaining: number } {
  const canManage = useManageAccess();
  const modules = useLearnerModules("field-agent");
  const remaining = modules.filter((m) => m.required && !isCertified(m)).length;
  return { locked: !canManage, remaining };
}

/** "1 more required module" / "2 more required modules". */
export function remainingPhrase(remaining: number): string {
  return `${remaining} more required ${remaining === 1 ? "module" : "modules"}`;
}

/** Tooltip for a control that is disabled only because Manage is locked. */
export const LOCKED_HINT = "Locked until you're cleared for duty";

/**
 * Shell-level notice above every Manage screen while locked. Neutral surface,
 * never an alarm bar — matches the offline banner's tone.
 */
export function ManageLockBanner() {
  const { locked, remaining } = useManageLock();
  if (!locked) return null;

  return (
    <div
      role="status"
      className="shrink-0 flex flex-wrap items-center gap-x-2 gap-y-1 px-4 py-2.5 bg-surface-raised"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <Lock size={14} strokeWidth={1.75} className="shrink-0 text-muted-foreground" />
      <span className="text-[13px] leading-[18px] font-medium text-foreground">
        Manage is read-only until you&apos;re cleared for duty.
      </span>
      <span className="text-[13px] leading-[18px] text-muted-foreground">
        {`Certify in ${remainingPhrase(remaining)} to unlock it.`}
      </span>
      <Link
        href="/training/modules"
        className="text-[13px] leading-[18px] font-semibold text-primary hover:underline"
      >
        Go to training
      </Link>
    </div>
  );
}

/**
 * Replaces a list's rows while locked. `what` names the records in lower case
 * and plural — "flagged responses", "people", "documents".
 */
export function LockedEmpty({ what }: { what: string }) {
  const { remaining } = useManageLock();
  return (
    <div
      className="rounded-[12px] p-10 flex flex-col items-center gap-2 text-center bg-surface-raised"
      style={{ border: "1px solid var(--border)" }}
    >
      <Lock size={20} strokeWidth={1.5} className="text-muted-foreground" />
      <p className="text-[14px] leading-[20px] font-medium text-foreground">
        {`${what[0].toUpperCase()}${what.slice(1)} are hidden until you're cleared for duty`}
      </p>
      <p className="text-[14px] leading-[20px] text-muted-foreground max-w-[46ch]">
        {`This isn't empty — you just can't see it yet. Certify in ${remainingPhrase(remaining)} to open Manage.`}
      </p>
      <Link
        href="/training/modules"
        className="mt-1 text-[14px] leading-[20px] font-semibold text-primary hover:underline"
      >
        Go to training
      </Link>
    </div>
  );
}
