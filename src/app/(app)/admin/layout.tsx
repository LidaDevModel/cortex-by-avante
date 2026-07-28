"use client";

import { useEffect, useState } from "react";
import { useCurrentRole } from "@/lib/current-role";
import { useManageAccess } from "@/hooks/use-admin-unlocked";
import { AccessRestricted } from "@/components/admin/access-restricted";
import { ManageLocked } from "@/components/admin/manage-locked";

/**
 * Gate for the Cortex Manage section. Two layers, both interface-only (a real
 * backend enforces them at the API):
 *  - role — only "admin" may enter; anyone else gets Access restricted.
 *  - readiness — an admin who isn't cleared for duty gets the not-cleared
 *    readiness screen, exactly like a field agent who can't yet take a shift.
 * The Manage nav is hidden until cleared, so the readiness screen is mainly a
 * safety net for a direct URL. Renders nothing until mounted so role + readiness
 * are read client-side (no flash, no hydration mismatch).
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const role = useCurrentRole();
  const canManage = useManageAccess();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  if (role !== "admin") return <AccessRestricted />;
  if (!canManage) return <ManageLocked />;
  return <>{children}</>;
}
