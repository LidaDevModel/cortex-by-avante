"use client";

import { useLearnerModules } from "@/lib/training-store";
import { isShiftReady } from "@/lib/training-mock";

/**
 * Admin write-actions (invite, add/publish content, manage people…) unlock only
 * once the signed-in user has completed their OWN required training — an admin
 * who isn't cleared for shift can't manage the platform. Reactive to training
 * progress, so finishing the last required module unlocks live.
 *
 * The check reads the user's field-agent training (the demo user is a guard who
 * also holds admin access) — NOT the admin access-role, which carries no
 * training of its own and would read as vacuously complete. Interface gating
 * only; a real backend enforces the same rule at the API.
 */
export function useAdminUnlocked(): boolean {
  return isShiftReady(useLearnerModules("field-agent"));
}

/** The tooltip shown on a locked admin action. */
export const ADMIN_LOCK_MESSAGE = "Complete your required training to unlock.";
