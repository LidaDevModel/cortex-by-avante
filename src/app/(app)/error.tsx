"use client";

import { useEffect } from "react";
import { NotFoundState } from "@/components/ui/not-found-state";
import { clearCrash } from "@/lib/dev-crash";

/**
 * Error boundary for every app route. Renders inside the shell, so a crash
 * leaves the user somewhere they can navigate out of.
 *
 * Before this existed, any render error fell through to Next's own generic
 * page — outside the shell, unbranded, with no route back into the product.
 * Commit 7968bba shows this class of crash has already happened once.
 *
 * Copy is VISION's phrasing-table entry for a failed load, verbatim, because
 * that is what this looks like to the person reading it. `reset()` re-renders
 * the segment, which is the retry the wording promises.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // A real build sends this to the error reporter. Logged for now so a crash
    // is never silent in dev.
    console.error("[cortex] route error:", error);
    // Dev only: /dev/crash throws while its flag is armed, and React replays
    // that render, so the flag cannot clear itself. Reaching this screen means
    // the crash was delivered — clearing here is what makes "Try again" below
    // a real recovery. A no-op for every real error.
    clearCrash();
  }, [error]);

  return (
    <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
      <NotFoundState
        icon="offline"
        title="Content unavailable"
        description="We couldn't load this. Check your connection and try again."
        actionLabel="Try again"
        onAction={reset}
        secondaryLabel="Back to home"
        // A HARD navigation on purpose. Two softer versions were tried and
        // both left the user stuck, which is the whole thing this screen is
        // supposed to prevent:
        //   - a plain <Link>: reached /dashboard, but the boundary stays in
        //     its error state, so the error screen stayed on top of it
        //   - router.push() then reset(): reset re-rendered the errored
        //     segment and cancelled the navigation, so the URL never changed
        // A full load clears every boundary and any module-level cache the
        // crash poisoned. After a crash, a clean slate is the right price.
        onSecondaryAction={() => {
          window.location.assign("/dashboard");
        }}
      />
    </div>
  );
}
