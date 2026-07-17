"use client";

import { useEffect, useState } from "react";

/**
 * Tracks browser connectivity. Starts `true` (matches the server render so the
 * banner never flashes on hydration), then reflects `navigator.onLine` after
 * mount and on every online/offline event. A real field client would layer
 * request-failure detection on top; this is the connectivity signal the offline
 * banner and cached-content states read.
 */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return online;
}
