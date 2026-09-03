"use client";

import * as React from "react";
import { useManageAccess } from "@/hooks/use-admin-unlocked";

/*
 * Nav shape — which of the three primary-nav forms the current viewport and
 * role get. This is the single source of truth; every consumer (the sidebar
 * drawer boundary, the header's trigger/burger, the floating pill, and the
 * scroll canvas's footprint reservation) reads it rather than re-deriving a
 * breakpoint of its own.
 *
 * WHY 1024 AND NOT 768. The desktop sidebar is 256px. On a 768px portrait
 * tablet that leaves 512px of canvas — a third of the screen spent on nav —
 * and Home clipped five elements at that width. So below 1024 the sidebar
 * yields and each role adopts the nav it already has on a phone:
 *
 *   admin   → drawer  (burger in the header; their IA is two groups deep,
 *                      which a drawer holds and four thumb tabs cannot)
 *   learner → pill    (the floating cluster; four flat destinations)
 *
 * That split is not new — it is exactly what the two roles already get below
 * 768 (see MobileTabBar's `inManage` guard and PageHeader's `canManage`
 * burger). Only the boundary moves.
 *
 * NOTE: this is deliberately NOT `useIsMobile`. That hook stays at 768 and
 * keeps deciding sheet-vs-popover for the bell, citation chips and dialogs —
 * touch-ergonomics questions, not nav-shape ones. Widening it would have
 * turned every tablet popover into a bottom sheet as a side effect.
 */

/** Below this width the sidebar yields to a drawer or the floating pill. */
export const NAV_SIDEBAR_BREAKPOINT = 1024;

/**
 * True below `NAV_SIDEBAR_BREAKPOINT`. Starts false so the first paint matches
 * the server's desktop render; the CSS `lg:` classes carry the real switch, so
 * this only drives behaviour (which element renders), never layout.
 */
export function useIsCompactNav(): boolean {
  const [compact, setCompact] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${NAV_SIDEBAR_BREAKPOINT - 1}px)`);
    const onChange = () => setCompact(window.innerWidth < NAV_SIDEBAR_BREAKPOINT);
    mql.addEventListener("change", onChange);
    onChange();
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return compact;
}

export type NavShape = "sidebar" | "drawer" | "pill";

/** Which primary nav the current viewport + role get. */
export function useNavShape(): NavShape {
  const compact = useIsCompactNav();
  const canManage = useManageAccess();
  if (!compact) return "sidebar";
  return canManage ? "drawer" : "pill";
}
