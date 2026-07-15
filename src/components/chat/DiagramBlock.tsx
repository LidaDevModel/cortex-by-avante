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

  // Re-read the resolved token values whenever the theme flips.
  useEffect(() => {
    setTokenVars(readTokenVars());
  }, [isDark]);

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
      <iframe
        title={caption || "Diagram"}
        sandbox=""
        srcDoc={srcDoc}
        loading="lazy"
        className="block w-full"
        style={{ border: 0, aspectRatio: aspectRatioOf(svg) }}
      />
      {caption && (
        <figcaption className="mt-2 text-[12px] leading-[16px] text-muted-foreground">{caption}</figcaption>
      )}
    </figure>
  );
}
