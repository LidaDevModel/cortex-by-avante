"use client";

import { useManageAccess } from "@/hooks/use-admin-unlocked";

/**
 * The group crumb in front of a learner screen's own name, per role.
 *
 * WHY THIS EXISTS. A cleared admin's sidebar contains "Library" and "Modules"
 * TWICE: once under "Content" (authoring — /admin/content and
 * /admin/content/training) and once under "Learning" (their own training —
 * /library and /training/modules). So for an admin, a breadcrumb reading just
 * "Library" cannot say which of the two screens they are on, and the two do
 * opposite jobs. A field agent has one of each, so they need no group there.
 *
 * It also fixes a mismatch that predates the request: /training/modules said
 * "Training > Modules" to everyone, and an admin's sidebar has no "Training"
 * group — theirs is called "Learning".
 *
 * The group is NEVER a link. Both "Learning" and "Training" are collapse
 * groups in the sidebar with no page of their own, and linking a group to one
 * of its children is what used to send an admin from Modules to Library.
 *
 * Keyed on `useManageAccess`, the same condition the sidebar itself branches
 * on — so a not-cleared admin, who is shown the learner nav, is treated as a
 * learner here too.
 */
export function useLearnerNav(inTraining = false): {
  /** Prepend to the page's own crumbs. */
  group: { label: string }[];
  /** True when the admin sidebar (Content + Learning groups) is the one shown. */
  isAdmin: boolean;
} {
  const isAdmin = useManageAccess();
  return {
    group: isAdmin ? [{ label: "Learning" }] : inTraining ? [{ label: "Training" }] : [],
    isAdmin,
  };
}
