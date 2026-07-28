"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasManageAccess } from "@/lib/manage-access";

/**
 * Bare-root landing. A cleared admin's home is Cortex Manage (`/admin`);
 * everyone else (field agents, not-cleared admins, and signed-out visitors —
 * whose default role reads as a learner) goes to the learner home, where the
 * app-shell AuthGate bounces the signed-out on to /sign-in. Client-side because
 * the decision reads the role + training from the browser.
 */
export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace(hasManageAccess() ? "/admin" : "/dashboard");
  }, [router]);
  return null;
}
