/*
 * Drawer-navigation marker.
 *
 * When you pick a destination in the nav drawer, two things used to move at
 * once: the drawer sliding off its edge and the new screen running its own
 * `screen-in` fade. Two motions in different directions over the same 200ms,
 * which is most of why the close felt wrong.
 *
 * Suppressing the screen fade for drawer selections gives the effect of "the
 * page is already there, the drawer slides away to reveal it" — the ordering
 * the drawer should appear to have — without the dead time of actually waiting
 * for the route before closing (which would leave a tap looking ignored, and
 * would hang the drawer open on a slow route once there is a real backend).
 *
 * A timestamp rather than a boolean flag on purpose: reading it is idempotent,
 * so there is nothing to consume and nothing to reset. A render-phase read
 * cannot mis-fire under StrictMode's double render, and a marker that is never
 * followed by a navigation simply expires.
 */

/** How long after a drawer selection a mount still counts as "from the drawer". */
const WINDOW_MS = 400;

let lastDrawerNav = -Infinity;

/** Call when a drawer selection has committed to a destination. */
export function markDrawerNav() {
  lastDrawerNav = performance.now();
}

/** True if the current mount is the screen a drawer selection just opened. */
export function isDrawerNav(): boolean {
  return performance.now() - lastDrawerNav < WINDOW_MS;
}
