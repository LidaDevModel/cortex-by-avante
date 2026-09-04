"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-context";

// App token → in-diagram CSS var. DiagramBlock reads the live values and
// injects them into the iframe (which, being sandboxed, can't inherit them).
const TOKEN_MAP: [appVar: string, diagVar: string][] = [
  ["--foreground", "--diag-text"],
  ["--muted-foreground", "--diag-muted"],
  ["--primary", "--diag-accent"],
  ["--sidebar-active", "--diag-node"],
  ["--border", "--diag-line"],
];

function readTokenVars(): string {
  if (typeof window === "undefined") return "";
  const cs = getComputedStyle(document.documentElement);
  return TOKEN_MAP.map(([app, diag]) => `${diag}:${cs.getPropertyValue(app).trim()};`).join("");
}

function aspectRatioOf(svg: string): string {
  const m = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  if (!m) return "16 / 9";
  return `${m[1]} / ${m[2]}`;
}

/**
 * Renders a diagram's SVG inside a locked, sandboxed iframe. `sandbox=""` blocks
 * scripts, same-origin access, forms and popups, so even hostile markup can't
 * reach the app — this is the seam where a real model's (untrusted) SVG output
 * plugs in unchanged.
 *
 * TODO(api): when the SVG comes from the live model, keep `sandbox=""` exactly
 * as-is — that isolation IS the safety boundary; do not relax it.
 */
export function DiagramBlock({ svg, caption }: { svg: string; caption?: string }) {
  const { isDark } = useTheme();
  const [tokenVars, setTokenVars] = useState("");
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");

  // Re-read the resolved token values whenever the theme flips.
  useEffect(() => {
    setTokenVars(readTokenVars());
  }, [isDark]);

  /* The diagram used to appear out of nothing: an empty box holding its aspect
     ratio, for as long as the frame took, with no indication anything was
     coming and nothing at all if it never arrived. A skeleton says "loading",
     and the timeout gives the failure a face — a sandboxed srcDoc rarely errors
     outright, so waiting forever was the realistic failure, not onError. */
  useEffect(() => {
    if (state !== "loading") return;
    const t = setTimeout(() => setState((s) => (s === "loading" ? "failed" : s)), 8000);
    return () => clearTimeout(t);
  }, [state]);

  // The screen-reader equivalent, pulled from the SVG's own <desc> so it can
  // never drift from the picture. The <desc> is inside a sandboxed iframe,
  // which assistive tech cannot reliably reach, so it has to be repeated here
  // in the parent document.
  const description = svg.match(/<desc[^>]*>([\s\S]*?)<\/desc>/)?.[1] ?? "";

  const srcDoc =
    `<!doctype html><html><head><meta charset="utf-8"><style>` +
    `:root{${tokenVars}}` +
    `html,body{margin:0;padding:0;background:transparent}` +
    `svg{display:block;width:100%;height:auto;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}` +
    `</style></head><body>${svg}</body></html>`;

  return (
    <figure
      className="m-0 rounded-[12px] border border-border bg-surface-raised p-3"
      style={{ animation: "msg-in 200ms ease-out both" }}
    >
      <div className="relative" style={{ aspectRatio: aspectRatioOf(svg) }}>
        {state === "loading" && (
          <div aria-hidden className="absolute inset-0 rounded-[8px] bg-foreground/10 animate-pulse" />
        )}
        {state === "failed" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center px-4">
            <p className="type-label font-medium text-foreground">
              This diagram didn&apos;t load
            </p>
            <p className="type-meta text-muted-foreground">
              The steps are written out in the answer above.
            </p>
          </div>
        ) : (
          <iframe
            title={caption || "Diagram"}
            sandbox=""
            srcDoc={srcDoc}
            /* NOT loading="lazy". A chat answer's diagram is part of the answer:
               lazy left it unloaded until scrolled into view, so an answer that
               arrived below the fold showed an empty box, and the skeleton above
               would have spun until the timeout for no reason. */
            onLoad={() => setState("ready")}
            className="block w-full h-full"
            style={{ border: 0, opacity: state === "ready" ? 1 : 0, transition: "opacity 200ms ease-out" }}
          />
        )}
      </div>
      {/* The text equivalent, in the parent document where a screen reader can
          actually reach it. */}
      {description && <p className="sr-only">{description}</p>}
      {caption && (
        <figcaption className="mt-2 type-caption text-muted-foreground">{caption}</figcaption>
      )}
    </figure>
  );
}
