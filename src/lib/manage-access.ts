import { getCurrentRole } from "@/lib/current-role";
import { learnerModules } from "@/lib/training-store";
import { isShiftReady } from "@/lib/training-mock";

/**
 * Whether the signed-in user may access Cortex Manage — an admin who is cleared
 * for duty (certified in every required module). This is the imperative twin of
 * the `useManageAccess` hook, for non-hook call sites like the notifications
 * mock. Manage screens, the Manage nav, its operational notifications, and their
 * settings all gate on this: a not-cleared admin is treated as a learner until
 * they finish their required training.
 *
 * Readiness reads the field-agent training (the demo user is a guard who also
 * holds admin access) — the admin access-role carries no training of its own.
 */
export function hasManageAccess(): boolean {
  return getCurrentRole() === "admin" && isShiftReady(learnerModules("field-agent"));
}
