"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/components/theme-context";

/**
 * Cursor-following brand glow for the auth brand panel. A soft radial in the
 * primary hue fades in when the pointer enters the panel and trails the cursor
 * with a small easing delay (transform transition). Lives inside the panel
 * (`overflow-hidden` clips it), sits above the drifting BlobField but below the
 * z-10 content, and is `pointer-events-none` so it never blocks the form links.
 * Desktop-only for free — the panel it mounts in is `hidden lg:flex`.
 *
 * Reduced motion: the global guard removes the transition, so it snaps to the
 * cursor with no trail (still calm) rather than animating.
 */
const SIZE = 560; // diameter; the blob is translated so its centre sits on the cursor

export function AuthCursorGlow() {
  const { isDark } = useTheme();
  // Dark reads brighter, so the glow is dialled down there (mode-aware strength
  // in JS — a `.dark` CSS custom-property override doesn't survive the build).
  const strength = isDark ? 11 : 16;
  const overlayRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const blob = blobRef.current;
    const panel = overlay?.parentElement;
    if (!overlay || !blob || !panel) return;

    let raf = 0;
    let nextX = 0;
    let nextY = 0;

    const apply = () => {
      raf = 0;
      blob.style.transform = `translate3d(${nextX - SIZE / 2}px, ${nextY - SIZE / 2}px, 0)`;
    };
    const onMove = (e: PointerEvent) => {
      const r = panel.getBoundingClientRect();
      nextX = e.clientX - r.left;
      nextY = e.clientY - r.top;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onEnter = (e: PointerEvent) => {
      // Seat the blob under the cursor before revealing it, so it fades in in
      // place rather than sliding from a stale corner.
      const r = panel.getBoundingClientRect();
      blob.style.transform = `translate3d(${e.clientX - r.left - SIZE / 2}px, ${e.clientY - r.top - SIZE / 2}px, 0)`;
      blob.style.opacity = "1";
    };
    const onLeave = () => {
      blob.style.opacity = "0";
    };

    panel.addEventListener("pointermove", onMove);
    panel.addEventListener("pointerenter", onEnter);
    panel.addEventListener("pointerleave", onLeave);
    return () => {
      panel.removeEventListener("pointermove", onMove);
      panel.removeEventListener("pointerenter", onEnter);
      panel.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={overlayRef} aria-hidden className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div
        ref={blobRef}
        className="absolute top-0 left-0 opacity-0"
        style={{
          width: SIZE,
          height: SIZE,
          background: `radial-gradient(circle, color-mix(in srgb, var(--auth-cursor-glow) ${strength}%, transparent) 0%, transparent 60%)`,
          // transform → the trailing follow; opacity → the enter/leave fade.
          transition: "transform 220ms ease-out, opacity 300ms ease-out",
          willChange: "transform, opacity",
        }}
      />
    </div>
  );
}
