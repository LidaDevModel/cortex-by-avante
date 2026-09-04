/**
 * Arming for the dev-only crash route (`/dev/crash`), which exists so the app
 * error boundary can be checked without editing code.
 *
 * Next's error boundary wraps the PAGE, not the layout above it, so a throw
 * fired from a floating dev panel escapes past `(app)/error.tsx` to Next's own
 * generic screen — the opposite of what needs testing. A page is the only
 * thing inside that boundary, so the trigger has to be one.
 *
 * The flag makes a stray visit harmless: unarmed, the route just returns to
 * Home rather than presenting a crash to whoever typed the URL. It is
 * sessionStorage, so it dies with the tab.
 *
 * It is NOT cleared on read. React re-renders a throwing component more than
 * once (it replays the render to recover a better stack), so clearing on the
 * first read made the replay succeed — the boundary never settled and the
 * page redirected to Home instead of showing the error screen. The error
 * screen clears it once it is actually on screen (see `(app)/error.tsx`),
 * which is the only moment that means "the crash has been delivered". That
 * keeps "Try again" a real recovery rather than a second crash.
 */
const KEY = "cortex-dev-crash";

export function armCrash(): void {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    /* no-op */
  }
}

/** Stays true across React's render replays. Cleared by `clearCrash()`. */
export function isCrashArmed(): boolean {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

/** Called by the error screen once it is displayed, so retry recovers. */
export function clearCrash(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* no-op */
  }
}
