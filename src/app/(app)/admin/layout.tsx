"use client";

import { useEffect, useState } from "react";
import { useCurrentRole } from "@/lib/current-role";
import { useManageAccess } from "@/hooks/use-admin-unlocked";
import { usePathname } from "next/navigation";
import { AccessRestricted } from "@/components/admin/access-restricted";
import { ManageLocked } from "@/components/admin/manage-locked";
import { ManageLockBanner } from "@/components/admin/manage-lock";

/* Manage screens that render their own not-cleared state: the section home and
   the five lists. They keep their chrome, show no records, and disable writes.
   Anything deeper is a single record, which has nothing to show once the lists
   are empty — only a stale bookmark reaches one, so those fall back to the
   readiness screen. */
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
 *  - readiness — an admin who isn't cleared for duty keeps the section but sees
 *    no records: lists render their chrome with a locked notice in place of the
 *    rows, and writes are disabled. Hiding it instead reads as a fault to an
 *    admin who was cleared yesterday and lost it to a newly-required module.
 *    Record routes have nothing to show once the lists are empty, so they keep
 *    the readiness screen.
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
  return (
    <div className="flex flex-col h-full min-h-0">
      <ManageLockBanner />
      <div className="flex-1 min-h-0 flex flex-col">{children}</div>
    </div>
  );
}
