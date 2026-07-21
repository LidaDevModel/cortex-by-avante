"use client";

import { useEffect, useRef, useState } from "react";
import { useDialKitController } from "dialkit";
import { CORTEX_VERSIONS, VERSION_NAMES } from "./palette-versions";
import { getCurrentRole, setCurrentRole } from "@/lib/current-role";

/**
 * DEV-ONLY colour + illustration exploration (dialkit), unified so a named
 * "version" can be loaded straight INTO the live dials.
 *
 * Three panels, all per-mode (each token has separate light/dark values, so the
 * dials edit the CURRENTLY ACTIVE mode only and write to a mode-scoped override —
 * `html:not(.dark)` vs `html.dark`, mutually exclusive so the two modes never
 * bleed). Switching theme reloads the dials with that mode's values.
 *
 *  - Versions:      pick a version + "Load version" → pushes its values into the
 *                   palette + illustration dials (still editable afterwards).
 *  - Palette · X:   ~30 brand/semantic colour dials, seeded from current tokens.
 *  - Illustrations: module + file/folder hue-rotate & brightness.
 *
 * Never shipped to production (gated in the root layout). To SHIP a look, promote
 * its values into globals.css — this tool only decides.
 */

// Dial key -> CSS custom property. Solid brand/semantic palette only (gradients,
// shadows, sizes and alpha tokens can't be a hex dial). Keys match PaletteValues.
const TOKENS: Record<string, string> = {
  // Brand
  primary: "--primary",
  onPrimary: "--primary-foreground",
  accent: "--accent-subtle",
  accentGlow: "--accent",
  ring: "--ring",
  cursorGlow: "--auth-cursor-glow",
  // Text
  ink: "--foreground",
  inkMuted: "--muted-foreground",
  // Surfaces
  background: "--background",
  surface: "--surface",
  surfaceRaised: "--surface-raised",
  surfaceLifted: "--surface-lifted",
  surfaceChip: "--surface-chip",
  muted: "--muted",
  secondary: "--secondary",
  // Borders
  border: "--border",
  cardBorder: "--card-border",
  inputBorder: "--input-border",
  controlBorder: "--control-border",
  input: "--input",
  // Nav / sidebar
  navActive: "--sidebar-active",
  sidebarAccent: "--sidebar-accent",
  sidebarBorder: "--sidebar-border",
  // Semantic
  danger: "--destructive",
  warning: "--warning",
  success: "--success",
  // Document / reading
  docPage: "--doc-page-bg",
  docText: "--doc-text",
  docTextMuted: "--doc-text-muted",
  docCalloutBg: "--doc-callout-bg",
  docCalloutBorder: "--doc-callout-border",
};

/** Normalise any CSS colour (hex / oklch / lab / rgb) to #rrggbb for the colour
 *  dial. Paints a 1px pixel and reads it back as sRGB bytes — reliable across
 *  colour spaces (Tailwind v4 serialises tokens to lab(), which fillStyle keeps
 *  rather than converting). */
function toHex(css: string): string {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "#000000";
  ctx.fillStyle = "#000000"; // fallback if `css` is invalid
  ctx.fillStyle = css;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  const h = (n: number) => n.toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

function readTokenHex(varName: string): string {
  // Resolve through a probe so color-mix()/oklch()/var() chains collapse to a
  // concrete computed colour before conversion.
  const probe = document.createElement("span");
  probe.style.color = `var(${varName})`;
  probe.style.position = "absolute";
  probe.style.opacity = "0";
  probe.style.pointerEvents = "none";
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  return toHex(resolved || "#000000");
}

function Inner({ mode }: { mode: "light" | "dark" }) {
  // Version selector — registered first so it sits at the top of the panel stack.
  // onAction is created once; it reads the live selection + apply fn via refs so
  // it always applies the latest state.
  const applyRef = useRef<(name: string) => void>(() => {});
  const selRef = useRef<string>(VERSION_NAMES[0]);
  const themes = useDialKitController(
    "Themes",
    {
      theme: { type: "select" as const, options: VERSION_NAMES, default: VERSION_NAMES[0] },
      load: { type: "action" as const, label: "Load theme" },
    },
    // persist:{presets:false} suppresses DialKit's native per-panel preset row
    // (the "Version 1 / add / copy" strip) — meaningless on this control panel,
    // and its "Version" wording collides with our own theme selector.
    { id: `themes-${mode}`, persist: { presets: false }, onAction: () => applyRef.current(selRef.current) }
  );
  selRef.current = String(themes.values.theme);

  // Palette dials — seeded once from the active mode's current token values.
  const [paletteConfig] = useState(() =>
    Object.fromEntries(
      Object.entries(TOKENS).map(([key, varName]) => [key, { type: "color" as const, default: readTokenHex(varName) }])
    )
  );
  const palette = useDialKitController(`Palette · ${mode}`, paletteConfig, { id: `palette-${mode}`, persist: true });

  // Illustration hue/brightness dials (static config).
  const illo = useDialKitController(
    `Illustrations · ${mode}`,
    {
      moduleHue: [0, -180, 180, 1],
      moduleBrightness: [1, 0.3, 2, 0.01],
      docHue: [0, -180, 180, 1],
      docBrightness: [1, 0.3, 2, 0.01],
    },
    { id: `illustrations-${mode}`, persist: true }
  );

  // Load a version. Applies BOTH modes (palette + illustration filter + ambient
  // fx) as direct mode-scoped <style> blocks, so in a demo you can switch theme
  // AND flip light/dark freely without it reverting. The current mode also flows
  // through the dials (setValues) so they reflect the loaded values + stay tunable.
  // Reassigned every render so it closes over the current controllers.
  applyRef.current = (name) => {
    const v = CORTEX_VERSIONS[name];
    if (!v) return;
    (palette.setValues as (u: Record<string, string>) => void)(v.palette[mode]);
    (illo.setValues as (u: Record<string, number>) => void)(v.illustration[mode]);

    const writeStyle = (id: string, css: string) => {
      let el = document.getElementById(id) as HTMLStyleElement | null;
      if (!el) { el = document.createElement("style"); el.id = id; document.head.appendChild(el); }
      el.textContent = css;
    };

    (["light", "dark"] as const).forEach((m) => {
      const scope = m === "dark" ? "html.dark" : "html:not(.dark)";
      // Core palette tokens.
      const pal = v.palette[m];
      const palBody = Object.entries(TOKENS).map(([key, varName]) => `${varName}: ${pal[key]};`).join(" ");
      writeStyle(`dk-palette-${m}`, `${scope}{ ${palBody} }`);
      // Illustration hue/brightness filter (only when non-identity).
      const iv = v.illustration[m];
      const irules: string[] = [];
      if (iv.moduleHue !== 0 || iv.moduleBrightness !== 1) irules.push(`${scope} [data-il-group="module"]{ filter: hue-rotate(${iv.moduleHue}deg) brightness(${iv.moduleBrightness}); }`);
      if (iv.docHue !== 0 || iv.docBrightness !== 1) irules.push(`${scope} [data-il-group="doc"]{ filter: hue-rotate(${iv.docHue}deg) brightness(${iv.docBrightness}); }`);
      writeStyle(`dk-illustrations-${m}`, irules.join(" "));
      // Ambient fx (blobs, canvas glow, card halo, illustration blooms).
      const fx = v.fx[m], b = fx.illBloom, e = fx.illBloomEdge;
      const ill = [
        `--illustration-glow: radial-gradient(ellipse 85% 80% at 50% 40%, ${b} 0%, ${e} 100%);`,
        `--illustration-glow-side: radial-gradient(ellipse 95% 75% at 50% 50%, ${b} 0%, ${e} 100%);`,
        `--illustration-glow-card: radial-gradient(ellipse 85% 80% at 50% 10.4%, ${b} 0%, transparent 100%);`,
        `--illustration-glow-side-card: radial-gradient(ellipse 95% 75% at 15% 50%, ${b} 0%, transparent 100%);`,
      ].join(" ");
      writeStyle(`dk-fx-${m}`, `${scope}{ --blob-1: ${fx.blob1}; --blob-2: ${fx.blob2}; --canvas-glow: ${fx.canvasGlow}; --card-glow-shadow: ${fx.cardGlowShadow}; ${ill} }`);
    });
  };

  // Write palette edits into a mode-scoped <style> (mutually exclusive selectors
  // → light and dark never bleed into each other).
  useEffect(() => {
    const id = `dk-palette-${mode}`;
    let style = document.getElementById(id) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = id;
      document.head.appendChild(style);
    }
    const selector = mode === "dark" ? "html.dark" : "html:not(.dark)";
    const vals = palette.values as Record<string, string>;
    const body = Object.entries(TOKENS)
      .map(([key, varName]) => `${varName}: ${vals[key]};`)
      .join(" ");
    style.textContent = `${selector}{ ${body} }`;
  }, [palette.values, mode]);

  // Write illustration filter — only when non-identity (an identity filter still
  // creates a filter region that can re-clip the folder-fan hover).
  useEffect(() => {
    const id = `dk-illustrations-${mode}`;
    let style = document.getElementById(id) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = id;
      document.head.appendChild(style);
    }
    const v = illo.values as { moduleHue: number; moduleBrightness: number; docHue: number; docBrightness: number };
    const scope = mode === "dark" ? "html.dark" : "html:not(.dark)";
    const rules: string[] = [];
    if (v.moduleHue !== 0 || v.moduleBrightness !== 1) {
      rules.push(`${scope} [data-il-group="module"]{ filter: hue-rotate(${v.moduleHue}deg) brightness(${v.moduleBrightness}); }`);
    }
    if (v.docHue !== 0 || v.docBrightness !== 1) {
      rules.push(`${scope} [data-il-group="doc"]{ filter: hue-rotate(${v.docHue}deg) brightness(${v.docBrightness}); }`);
    }
    style.textContent = rules.join(" ");
  }, [illo.values, mode]);

  return null;
}

/** Mount gate + mode source. Lives in the root layout (above the app's
 *  ThemeProvider), so it reads the mode straight from the `.dark` class on
 *  <html> and watches it — remounting the dials (re-seeded from that mode's
 *  values) whenever the theme flips. */
export function DevPalette() {
  const [mode, setMode] = useState<"light" | "dark" | null>(null);
  useEffect(() => {
    const read = () => setMode(document.documentElement.classList.contains("dark") ? "dark" : "light");
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  // Hide DialKit's native per-panel preset row ("Version N / add / copy"). It
  // duplicates the concept our Themes panel owns and its "Version" wording
  // collides with it — one version system, not two. Dev-only, injected once.
  useEffect(() => {
    const id = "dk-hide-native-presets";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = ".dialkit-panel-section-toolbar{ display: none !important; }";
    document.head.appendChild(style);
  }, []);

  // "Display" panel (outside the per-mode Inner so it persists): a single
  // light/dark toggle next to the version switcher.
  const toggleThemeRef = useRef<() => void>(() => {});
  toggleThemeRef.current = () => {
    const next = document.documentElement.classList.contains("dark") ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try { localStorage.setItem("cortex-theme", next); } catch { /* no-op */ }
  };
  useDialKitController(
    "Display",
    {
      toggleMode: { type: "action" as const, label: "Toggle light / dark" },
      toggleRole: { type: "action" as const, label: "Toggle role (agent / admin)" },
    },
    {
      id: "display",
      onAction: (a: string) => {
        if (/role/i.test(a)) {
          setCurrentRole(getCurrentRole() === "admin" ? "field-agent" : "admin");
        } else {
          toggleThemeRef.current();
        }
      },
    }
  );

  // Hide the Palette + Illustration colour dials, leaving only Display (mode) +
  // Themes (version) — a clean switcher panel. The controllers stay registered
  // (the theme loader still needs them); only the UI is hidden. Re-applied
  // across route changes via a MutationObserver.
  useEffect(() => {
    const apply = () => {
      document.querySelectorAll<HTMLElement>(".dialkit-folder").forEach((f) => {
        const t = f.querySelector(".dialkit-folder-title")?.textContent || "";
        if (t.includes("Palette") || t.includes("Illustration")) f.style.display = "none";
      });
    };
    apply();
    const obs = new MutationObserver(apply);
    obs.observe(document.body, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, []);

  if (!mode) return null;
  return <Inner key={mode} mode={mode} />;
}
