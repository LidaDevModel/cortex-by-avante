"use client";

import { useEffect, useState, type CSSProperties } from "react";

// Keys whose entrance has already played this session (module-level, survives
// client-side navigation, resets on a full reload). Same idiom as
// `useInitialLoad` — so first-load motion plays once and repeat navigation
// stays instant.
const shown = new Set<string>();

/**
 * Returns `true` only on the first mount of `key` this session, then `false`
 * for the rest of the session. Server + first client render agree (empty set →
 * true), so no hydration flash. Use it to gate first-load entrance motion
 * (row stagger, count-up) so it never replays on repeat navigation.
 */
export function useEntranceOnce(key: string): boolean {
  const [first] = useState(() => !shown.has(key));
  useEffect(() => {
    if (first) shown.add(key);
  }, [first, key]);
  return first;
}

/**
 * First-load row cascade. Returns a `(index) => style` builder that staggers a
 * gentle `msg-in` entrance across rows — but only on the screen's first mount
 * this session, and only for ~700ms, so pagination, filtering, and repeat
 * navigation never re-trigger it. Collapses to no motion under the global
 * reduced-motion guard (it's the `msg-in` keyframe). Delay is capped so a full
 * page's worth of rows finishes quickly.
 */
export function useRowStagger(key: string): (index: number) => CSSProperties | undefined {
  const first = useEntranceOnce(key);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!first) return;
    const t = setTimeout(() => setDone(true), 700);
    return () => clearTimeout(t);
  }, [first]);
  const active = first && !done;
  return (index: number) =>
    active ? { animation: "msg-in 200ms ease-out both", animationDelay: `${Math.min(index, 8) * 45}ms` } : undefined;
}
