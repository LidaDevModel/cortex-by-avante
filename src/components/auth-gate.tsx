"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isSessionExpired, isSignedIn } from "@/lib/auth-mock";
import { withReturn } from "@/lib/admin-nav";

/**
 * Client-side auth gate for the app shell — the mock counterpart of real
 * middleware. Renders nothing until the session check passes so protected
 * content never flashes; signed-out visitors are bounced to /sign-in.
 * (Fills VISION's role-gated-route slot at the authentication level; role
 * scoping within the app stays with the shell per the app-shell protocol.)
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    /* Carry the destination. This used to `router.replace("/sign-in")` and
       discard the intended path, so signing in always landed on Home. Every
       notification in the product links to a document or a module, so a guard
       tapping one on a handset whose session had lapsed lost the destination
       and had to navigate there by hand — the opposite of "fewest possible
       steps" at the moment they have least patience.

       The `expired` flag is what lets sign-in show VISION's "Your session has
       ended" copy instead of a bare form. */
    // Asked BEFORE isSignedIn, which clears an expired session as a side
    // effect — after that call the answer is always false.
    const expired = isSessionExpired();
    if (!isSignedIn()) {
      /* `window.location.search`, not `useSearchParams()`. This gate wraps the
         whole app shell, and `useSearchParams` opts every page inside it out
         of static prerendering unless the tree is wrapped in Suspense — the
         build fails outright ("should be wrapped in a suspense boundary").
         The read happens in an effect, so the browser is always there. */
      const q = window.location.search;
      const target = q ? `${pathname}${q}` : pathname;
      const next = withReturn("/sign-in", target);
      router.replace(expired ? `${next}&expired=1` : next);
      return;
    }
    setReady(true);
  }, [router, pathname]);

  if (!ready) return null;
  return <>{children}</>;
}
