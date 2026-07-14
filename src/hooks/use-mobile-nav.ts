"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

/*
 * Mobile nav visibility — the app-shell protocol's focused-task channel.
 *
 * The floating mobile nav shows on browse screens and yields on focused-task
 * screens so content gets full height. Most focused screens are whole routes
 * (matched below); screens whose focus is phase-based within one route (the
 * Knowledge Check session) report it via useFocusedTask instead.
 */

// ── Module store: count of active focused-task claims ──
let focusCount = 0;
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
function getSnapshot() {
  return focusCount > 0;
}

/** Report a phase-based focused task (e.g. an active KC session) to the shell.
    While any claim is active the mobile nav hides. */
export function useFocusedTask(active: boolean) {
  useEffect(() => {
    if (!active) return;
    focusCount++;
    emit();
    return () => {
      focusCount--;
      emit();
    };
  }, [active]);
}

/** Route-level focused-task screens (the hiding table's whole-route rows):
    AI Chat, open document, module detail (incl. its exam). Listings stay. */
function isFocusedRoute(pathname: string): boolean {
  if (pathname === "/chat") return true;
  if (pathname.startsWith("/library/files/")) return true;
  if (/^\/training\/modules\/(?!in-progress(\/|$))[^/]+/.test(pathname)) return true;
  return false;
}

/** Whether the floating mobile nav is visible on the current screen. */
export function useMobileNavVisible(): boolean {
  const pathname = usePathname();
  const taskActive = useSyncExternalStore(subscribe, getSnapshot, () => false);
  return !isFocusedRoute(pathname) && !taskActive;
}
