"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isCrashArmed } from "@/lib/dev-crash";

/**
 * Dev-only: throws during render so `(app)/error.tsx` catches it, making the
 * error screen reachable without a code edit. Reached only from the DialKit
 * "Trigger a render error" action, which arms the flag first — nothing in the
 * product links here, and an unarmed visit returns to Home.
 *
 * The error screen clears the flag once it is displayed, so its "Try again"
 * (which re-renders this segment) recovers instead of crashing again.
 */
export default function DevCrashPage() {
  const router = useRouter();
  // Server render and an unarmed visit both fall through to the redirect.
  const armed = typeof window !== "undefined" && isCrashArmed();

  useEffect(() => {
    if (!armed) router.replace("/dashboard");
  }, [armed, router]);

  if (armed) {
    throw new Error("Deliberate render error from the dev panel (dev-crash).");
  }
  return null;
}
