"use client";

import { useEffect, useState } from "react";
import { DialRoot } from "dialkit";
import { DevPalette } from "./DevPalette";

/**
 * Gate for the DialKit demo tooling (the deployed build shows only the trimmed
 * Display + Themes panel — palette/illustration dials are hidden in DevPalette).
 *
 * - ON by default, everywhere — the shared demo needs its light/dark, role, and
 *   theme switchers visible without a special link.
 * - `?dials=0` turns it OFF (sticky via localStorage) for clean screenshots;
 *   `?dials` / `?dials=1` turns it back on.
 *
 * Renders nothing on the server / first paint; reveals only after the client
 * checks the flag, so there's no hydration mismatch.
 */
export function DevTools() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let enabled = true;
    try {
      const p = new URLSearchParams(window.location.search);
      if (p.has("dials")) localStorage.setItem("dk-dials", p.get("dials") === "0" ? "0" : "1");
      if (localStorage.getItem("dk-dials") === "0") enabled = false;
    } catch { /* no-op */ }
    setShow(enabled);
  }, []);

  if (!show) return null;
  // productionEnabled lets DialKit render in a production build (our own flag
  // above already decides whether it should show at all).
  return (
    <>
      <DialRoot productionEnabled />
      <DevPalette />
    </>
  );
}
