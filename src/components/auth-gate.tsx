"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isSignedIn } from "@/lib/auth-mock";

/**
 * Client-side auth gate for the app shell — the mock counterpart of real
 * middleware. Renders nothing until the session check passes so protected
 * content never flashes; signed-out visitors are bounced to /sign-in.
 * (Fills VISION's role-gated-route slot at the authentication level; role
 * scoping within the app stays with the shell per the app-shell protocol.)
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isSignedIn()) {
      router.replace("/sign-in");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) return null;
  return <>{children}</>;
}
