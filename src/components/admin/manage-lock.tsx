"use client";

import { Lock } from "lucide-react";
import { StatePanel } from "@/components/ui/state-panel";
import { useManageAccess } from "@/hooks/use-admin-unlocked";
import { useLearnerModules } from "@/lib/training-store";
import { isCertified } from "@/lib/training-mock";

/*
 * Manage's not-cleared state.
 *
 * An admin who isn't cleared for duty keeps Cortex Manage in the nav and keeps
 * each screen's identity — its title and description — so the section stays
 * where they left it. Hiding it instead reads as "it broke" or "I was demoted"
 * to an admin who was cleared yesterday and lost it to a newly-required module.
 *
 * Below the title the screen's working surface is replaced by ONE centred panel:
 * the reason, and a primary CTA that does the only thing that helps. No table
 * chrome, no filters over nothing, and no row of disabled buttons for the person
 * to interrogate — a single statement and a single way forward.
 */

/** Whether Manage is locked, and how much training is left to unlock it. */
export function useManageLock(): { locked: boolean; remaining: number; started: boolean } {
  const canManage = useManageAccess();
  const modules = useLearnerModules("field-agent");
  const required = modules.filter((m) => m.required);
  return {
    locked: !canManage,
    remaining: required.filter((m) => !isCertified(m)).length,
    // Any progress at all decides "Continue" vs "Start" on the CTA.
    started: modules.some((m) => m.status !== "not-started"),
  };
}

/** "1 more required module" / "2 more required modules". */
export function remainingPhrase(remaining: number): string {
  return `${remaining} more required ${remaining === 1 ? "module" : "modules"}`;
}

/**
 * The centred not-cleared panel. `task` names what this screen is for, in the
 * gerund — "managing people", "reviewing flagged responses" — so the headline
 * says what needs clearance rather than repeating the page title.
 */
export function ManageLockedPanel({ task }: { task: string }) {
  const { remaining, started } = useManageLock();

  return (
    <StatePanel
      icon={Lock}
      tone="invite"
      title={`${task[0].toUpperCase()}${task.slice(1)} needs clearance`}
      description={`Cortex Manage unlocks once you're cleared for duty. Certify in ${remainingPhrase(
        remaining
      )} to open it.`}
      action={{ label: started ? "Continue training" : "Start training", href: "/training/modules" }}
    />
  );
}
