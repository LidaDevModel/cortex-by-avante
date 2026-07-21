"use client";

import { useEffect, useState } from "react";
import { useCurrentRole } from "@/lib/current-role";
import { AccessRestricted } from "@/components/admin/access-restricted";

/**
 * Role gate for the admin section. Only "admin" may enter; anyone else gets the
 * Access restricted state. This gates the interface, not the data — a real
 * backend enforces the role at the API. Renders nothing until mounted so the
 * role is read client-side (no flash, no hydration mismatch).
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const role = useCurrentRole();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  if (role !== "admin") return <AccessRestricted />;
  return <>{children}</>;
}
