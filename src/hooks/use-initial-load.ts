"use client";

import { useEffect, useState } from "react";

// Screens already loaded this session (module-level, survives client-side
// navigation, resets on full reload). Keeps the loading pattern honest: a fresh
// open of a screen shows skeletons; bouncing back to it stays instant — the mock
// has no real latency, and a real backend's actual load time drives this later.
const loaded = new Set<string>();

/**
 * Returns `true` while a screen's first load of the session is "in flight",
 * then `false`. Server + first client render agree (empty set → true), so no
 * hydration flash; the timer clears it and marks the screen loaded.
 */
export function useInitialLoad(key: string, ms = 500): boolean {
  const [loading, setLoading] = useState(() => !loaded.has(key));

  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => {
      loaded.add(key);
      setLoading(false);
    }, ms);
    return () => clearTimeout(t);
  }, [key, loading, ms]);

  return loading;
}
