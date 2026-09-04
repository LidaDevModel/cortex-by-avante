import Link from "next/link";
import { NotFoundState } from "@/components/ui/not-found-state";

/**
 * Unmatched URL. Next resolves an unmatched path to the ROOT not-found, which
 * sits outside the app shell — so this screen carries its own brand mark and
 * its own way back in. Before it existed, a mistyped URL rendered a bare "404"
 * with no shell at all, and on a phone the only exit was the browser's back
 * button.
 *
 * The wording follows VISION's error tone: plain, no blame, no exclamation.
 */
export default function RootNotFound() {
  return (
    <main className="relative flex-1 flex flex-col overflow-hidden canvas-glow">
      <div className="flex items-center gap-2 px-4 h-14 shrink-0">
        <Link href="/dashboard" className="flex flex-col">
          <span
            className="type-label font-semibold tracking-tight"
            style={{ color: "var(--primary)" }}
          >
            Cortex
          </span>
          <span className="type-caption text-muted-foreground">Avante Security</span>
        </Link>
      </div>
      <NotFoundState
        title="Page not found"
        description="That link doesn't lead anywhere. It may have been moved or removed."
        actionLabel="Back to home"
        actionHref="/dashboard"
      />
    </main>
  );
}
