"use client";

import { useEffect, useState } from "react";
import { useCurrentRole } from "@/lib/current-role";
import { useManageAccess } from "@/hooks/use-admin-unlocked";
import { AccessRestricted } from "@/components/admin/access-restricted";
import { usePathname } from "next/navigation";
import { ManageLocked } from "@/components/admin/manage-locked";

/* Manage screens that render their own not-cleared state: the section home and
   the five lists. Each keeps its title and description and replaces its working
   surface with the centred locked panel. Anything deeper is a single record,
   which has nothing to show while the section is locked — only a stale bookmark
   reaches one, so those keep the readiness screen. */
const LOCK_IN_PLACE = new Set([
  "/admin",
  "/admin/content",
  "/admin/content/training",
  "/admin/people",
  "/admin/reports/flagged",
  "/admin/reports/activity",
]);

/**
 * Gate for the Cortex Manage section. Two layers, both interface-only (a real
 * backend enforces them at the API):
 *  - role — only "admin" may enter; anyone else gets Access restricted.
 *  - readiness — an admin who isn't cleared for duty keeps the section: the nav
 *    stays, and each screen keeps its title and description with a centred
 *    locked panel in place of its working surface. Record routes have nothing
 *    to show, so they keep the readiness screen.
 * Renders nothing until mounted so role + readiness are read client-side (no
 * flash, no hydration mismatch).
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const role = useCurrentRole();
  const canManage = useManageAccess();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  if (role !== "admin") return <AccessRestricted />;
  if (!canManage && !LOCK_IN_PLACE.has(pathname)) return <ManageLocked />;
  return <>{children}</>;
}
