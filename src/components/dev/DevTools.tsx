"use client";

import { useEffect, useState } from "react";
import { DialRoot } from "dialkit";
import { DevPalette } from "./DevPalette";

/**
 * Gate for the DialKit dev tooling.
 *
 * - Local dev (`NODE_ENV !== "production"`): always on, as before.
 * - Deployed build: OFF by default so real users never see it — EXCEPT when the
 *   URL carries `?dials` (sticky via localStorage). This lets the palette/theme
 *   explorer be revealed on a deployed link for a demo without shipping it to
 *   everyone. Append `?dials=0` to turn it back off.
 *
 * Renders nothing on the server / first paint; reveals only after the client
 * checks the flag, so there's no hydration mismatch.
 */
export function DevTools() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let enabled = process.env.NODE_ENV !== "production";
    try {
      const p = new URLSearchParams(window.location.search);
      if (p.has("dials")) {
        if (p.get("dials") !== "0") localStorage.setItem("dk-dials", "1");
        else localStorage.removeItem("dk-dials");
      }
      enabled = enabled || localStorage.getItem("dk-dials") === "1";
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
