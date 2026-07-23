import { NotFoundState } from "@/components/ui/not-found-state";

/**
 * Shown when a signed-in non-admin opens an /admin route directly. The admin
 * nav never appears for them, so this is the only way they reach it. Copy
 * follows the error phrasing table (plain, no blame). Reuses the shared
 * full-height state component — no new pattern.
 */
export function AccessRestricted() {
  return (
    <NotFoundState
      title="Access restricted"
      description="This content isn't available for your role. Contact your manager if you think this is a mistake."
      actionLabel="Back to home"
      actionHref="/dashboard"
    />
  );
}
