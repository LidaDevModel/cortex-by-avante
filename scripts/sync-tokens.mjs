#!/usr/bin/env node
/**
 * VISION's token tables are GENERATED from globals.css.
 *
 * Decision D3: the code is the master, because the code is what the app
 * renders. Before this the two were written by hand and drifted — the audit
 * found the dark page background documented as #1a1a1a while the code
 * rendered #0f0f0f, and `--primary` documented as #6baa99 while the code said
 * something else. Each of those cost real time to chase.
 *
 * Run `npm run tokens` to rewrite the two tables in VISION.md, and
 * `npm run tokens:check` in CI to fail when they no longer match.
 *
 * It also CHECKS CONTRAST. Text pairs must clear WCAG AA (4.5:1) and
 * component outlines 3:1, measured from the resolved colours rather than
 * asserted in prose.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const CSS = resolve(here, "../src/app/globals.css");

/* VISION.md is found by walking UP from the working directory, not by a fixed
   relative path. `cortex/` is a symlink in every git worktree, so resolving
   "../../VISION.md" from this file follows the link and lands in whichever
   checkout the symlink points at — which is not the one being worked in. */
function findVision() {
  // Explicit path wins: `node scripts/sync-tokens.mjs --vision ../VISION.md`.
  // Needed when the app directory is a symlink (git worktrees do this), where
  // walking up resolves the PHYSICAL path and leaves the worktree entirely.
  const i = process.argv.indexOf("--vision");
  if (i > -1 && process.argv[i + 1]) return resolve(process.argv[i + 1]);
  let dir = process.cwd();
  for (let i = 0; i < 6; i++) {
    const candidate = join(dir, "VISION.md");
    if (existsSync(candidate)) return candidate;
    const up = dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  console.error("Could not find VISION.md above " + process.cwd());
  process.exit(2);
}
const VISION = findVision();

/* ─── colour maths ─────────────────────────────────────────────────────────
   oklch → oklab → linear sRGB → sRGB. Written out rather than pulled from a
   package: one file, no dependency, and VISION forbids adding one without
   asking. */
const clamp01 = (n) => Math.min(1, Math.max(0, n));

function oklchToRgb(L, C, hDeg) {
  const h = (hDeg * Math.PI) / 180;
  const a = Math.cos(h) * C;
  const b = Math.sin(h) * C;
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  const lin = [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  const enc = (c) => {
    const v = clamp01(c);
    return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
  };
  return lin.map((c) => Math.round(enc(c) * 255));
}

function parseColor(value) {
  const v = value.trim();
  let m = v.match(/^#([0-9a-f]{6})$/i);
  if (m) {
    const n = parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  m = v.match(/^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/i);
  if (m) return oklchToRgb(+m[1], +m[2], +m[3]);
  return null;
}

const hex = (rgb) => "#" + rgb.map((c) => c.toString(16).padStart(2, "0")).join("");

function relLuminance([r, g, b]) {
  const f = (c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrast(a, b) {
  const la = relLuminance(a), lb = relLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/* ─── read the tokens ───────────────────────────────────────────────────── */
function block(css, selector) {
  // The LAST matching block wins, mirroring the cascade.
  const re = new RegExp(`${selector}\\s*\\{([^}]*)\\}`, "g");
  let out = null, m;
  while ((m = re.exec(css))) out = m[1];
  if (!out) throw new Error(`no ${selector} block in globals.css`);
  const vars = {};
  for (const line of out.split("\n")) {
    const d = line.match(/^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/i);
    if (d) vars[d[1]] = d[2].trim();
  }
  return vars;
}

/** Follow `var(--x)` one hop at a time so mirrored tokens resolve. */
function resolveVar(vars, name, seen = new Set()) {
  let v = vars[name];
  while (v && /^var\(\s*(--[a-z0-9-]+)\s*\)$/i.test(v)) {
    const next = v.match(/^var\(\s*(--[a-z0-9-]+)\s*\)$/i)[1];
    if (seen.has(next)) return null;
    seen.add(next);
    v = vars[next];
    name = next;
  }
  return v ?? null;
}

/** VISION's row name → the CSS variable it documents. */
const ROWS = [
  ["color.primary", "--primary", "Brand color: active nav, primary CTAs, selected ring"],
  ["color.onPrimary", "--primary-foreground", "Text on primary surfaces"],
  ["color.ink", "--foreground", "Default body text"],
  ["color.inkMuted", "--muted-foreground", "Secondary text, hints, timestamps"],
  ["color.background", "--background", "Page background"],
  ["color.surface", "--surface", "Cards, inputs, modals"],
  ["color.surfaceRaised", "--surface-raised", "Elevated cards, raised surfaces"],
  ["color.navActive", "--sidebar-accent", "Nav pill active background"],
  ["color.glow", "--accent", "Radial glow center — main canvas only"],
  ["color.border", "--border", "Default borders, dividers"],
  ["color.cardBorder", "--card-border", "Outer card inset border"],
  ["color.ring", "--ring", "Focus ring"],
  ["color.inputBorder", "--input", "Field outlines — WCAG 1.4.11, ≥3:1"],
  ["color.danger", "--destructive", "Error states, destructive actions"],
  ["color.warning", "--warning", "Amber caution — medium password strength"],
];

/* Text and outline pairs that must hold, measured not asserted. */
const CONTRAST = [
  ["--foreground", "--background", 4.5, "body text on the page"],
  ["--foreground", "--surface", 4.5, "body text on a card"],
  ["--muted-foreground", "--background", 4.5, "secondary text on the page"],
  ["--muted-foreground", "--surface", 4.5, "secondary text on a card"],
  ["--primary-foreground", "--primary", 4.5, "label on a primary CTA"],
  ["--input", "--background", 3, "field outline on the page"],
  ["--input", "--surface", 3, "field outline on a card"],
  ["--input", "--surface-raised", 3, "field outline on a raised card"],
];

const css = readFileSync(CSS, "utf8");
const light = block(css, ":root");
const dark = block(css, "\\.dark");

function valueFor(vars, cssVar, fallback) {
  const raw = resolveVar(vars, cssVar) ?? (fallback ? resolveVar(fallback, cssVar) : null);
  if (!raw) return { text: "—", rgb: null };
  const rgb = parseColor(raw);
  // A color-mix() or a gradient cannot be reduced to one swatch; print the
  // declaration rather than a wrong hex.
  return { text: rgb ? `\`${hex(rgb)}\`` : `\`${raw}\``, rgb };
}

/* ─── contrast report ───────────────────────────────────────────────────── */
let failures = 0;
const report = [];
for (const [mode, vars] of [["light", light], ["dark", dark]]) {
  for (const [fg, bg, min, what] of CONTRAST) {
    const a = valueFor(vars, fg, light).rgb;
    const b = valueFor(vars, bg, light).rgb;
    if (!a || !b) {
      report.push(`  ?  ${mode.padEnd(5)} ${what}: not a flat colour, skipped`);
      continue;
    }
    const ratio = contrast(a, b);
    const ok = ratio >= min;
    if (!ok) failures++;
    report.push(`  ${ok ? "ok" : "FAIL"} ${mode.padEnd(5)} ${what}: ${ratio.toFixed(2)}:1 (needs ${min}:1)`);
  }
}

/* ─── write the tables ──────────────────────────────────────────────────── */
const lightRows = ROWS.map(([name, cssVar, use]) => `| \`${name}\` | ${valueFor(light, cssVar).text} | ${use} |`);
const darkRows = ROWS.map(([name, cssVar]) => `| \`${name}\` | ${valueFor(dark, cssVar, light).text} |`);

const GEN_START = "<!-- TOKENS:START — generated by `npm run tokens`; edit globals.css, not this table -->";
const GEN_END = "<!-- TOKENS:END -->";

const table = [
  GEN_START,
  "",
  "| Token | Value | Use |",
  "|---|---|---|",
  ...lightRows,
  "",
  "**Dark mode** — same tokens, from the `.dark` block. A value shown as a",
  "declaration rather than a hex is not a flat colour (a `color-mix`, a",
  "gradient, or `none`).",
  "",
  "| Token | Dark value |",
  "|---|---|",
  ...darkRows,
  "",
  GEN_END,
].join("\n");

const check = process.argv.includes("--check");
const vision = readFileSync(VISION, "utf8");

let next;
if (vision.includes(GEN_START)) {
  next = vision.replace(
    new RegExp(`${GEN_START.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&")}[\\s\\S]*?${GEN_END}`),
    table
  );
} else {
  console.error("VISION.md has no TOKENS:START/END markers — add them around the token table first.");
  process.exit(2);
}

console.log("Contrast:");
console.log(report.join("\n"));

if (check) {
  const drifted = next !== vision;
  if (drifted) console.error("\nVISION.md token tables are out of date. Run: npm run tokens");
  if (failures) console.error(`\n${failures} contrast pair(s) below the minimum.`);
  process.exit(drifted || failures ? 1 : 0);
}

writeFileSync(VISION, next);
console.log(`\nWrote ${ROWS.length} tokens × 2 modes to VISION.md`);
if (failures) {
  console.error(`\n${failures} contrast pair(s) below the minimum — fix globals.css.`);
  process.exit(1);
}
