"use client";

import { useCurrentRole } from "@/lib/current-role";
import { useLearnerModules } from "@/lib/training-store";
import { hasManageAccess } from "@/lib/manage-access";

/**
 * Whether the signed-in user may enter Cortex Manage right now — the reactive
 * hook twin of `hasManageAccess`. Access is gated on shift-readiness, exactly
 * like a field agent going on duty: an admin who hasn't certified in every
 * required module can't manage the platform, and is treated as a learner
 * everywhere (learner nav, no Manage entry, no operational notifications) until
 * they finish. Interface gating only — a real backend enforces it at the API.
 */
export function useManageAccess(): boolean {
  // Subscribe to role + training so the decision re-runs live; the decision
  // itself is the single imperative source of truth.
  useCurrentRole();
  useLearnerModules("field-agent");
  return hasManageAccess();
}
