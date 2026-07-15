/**
 * Hand-authored SVG diagram templates — the mock's fixed set (a flow, a step
 * sequence, a simple tree). They live in the mock layer, NOT in the chat
 * components. Colours are CSS variables (with light-mode fallbacks) that
 * DiagramBlock injects per theme, so the diagrams are on-brand in both modes.
 * A future API would emit its own SVG into the same block shape; the renderer
 * never changes.
 */

// Tokens injected by DiagramBlock (fallbacks = light-mode literals, so the
// first paint before injection still reads correctly).
const TEXT = "var(--diag-text,#111827)";
const MUTED = "var(--diag-muted,#6b7280)";
const ACCENT = "var(--diag-accent,#1a4a2e)";
const NODE = "var(--diag-node,#E0EEBA)";
const LINE = "var(--diag-line,#e5e7eb)";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const wrap = (w: number, h: number, body: string) =>
  `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" preserveAspectRatio="xMidYMid meet">${body}</svg>`;

/** Vertical numbered step sequence with a connector rail. */
export function stepsSvg(steps: { title: string; detail?: string }[]): string {
  const W = 560, padX = 18, padY = 16, rowH = 60, r = 15;
  const cx = padX + r;
  const H = padY * 2 + (steps.length - 1) * rowH + r * 2 + 8;
  const parts: string[] = [];
  steps.forEach((s, i) => {
    const cy = padY + i * rowH + r;
    if (i < steps.length - 1) {
      parts.push(`<line x1="${cx}" y1="${cy + r + 3}" x2="${cx}" y2="${cy + rowH - r - 3}" stroke="${LINE}" stroke-width="2"/>`);
    }
    parts.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${NODE}"/>`);
    parts.push(`<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="700" fill="${ACCENT}">${i + 1}</text>`);
    const tx = cx + r + 14;
    parts.push(`<text x="${tx}" y="${cy - (s.detail ? 5 : 0)}" dominant-baseline="central" font-size="15" font-weight="600" fill="${TEXT}">${esc(s.title)}</text>`);
    if (s.detail) parts.push(`<text x="${tx}" y="${cy + 13}" dominant-baseline="central" font-size="13" fill="${MUTED}">${esc(s.detail)}</text>`);
  });
  return wrap(W, H, parts.join(""));
}

/** Horizontal boxes connected left-to-right by arrows. */
export function flowSvg(nodes: string[]): string {
  const W = 560, H = 92, padX = 10, gap = 30, boxH = 50;
  const n = nodes.length;
  const boxW = (W - padX * 2 - gap * (n - 1)) / n;
  const y = (H - boxH) / 2;
  const parts: string[] = [
    `<defs><marker id="arr" markerWidth="8" markerHeight="8" refX="5.5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="${LINE}"/></marker></defs>`,
  ];
  nodes.forEach((label, i) => {
    const x = padX + i * (boxW + gap);
    parts.push(`<rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" rx="10" fill="${NODE}" stroke="${LINE}" stroke-width="1"/>`);
    parts.push(`<text x="${x + boxW / 2}" y="${H / 2}" text-anchor="middle" dominant-baseline="central" font-size="13" font-weight="600" fill="${TEXT}">${esc(label)}</text>`);
    if (i < n - 1) {
      parts.push(`<line x1="${x + boxW + 5}" y1="${H / 2}" x2="${x + boxW + gap - 5}" y2="${H / 2}" stroke="${LINE}" stroke-width="2" marker-end="url(#arr)"/>`);
    }
  });
  return wrap(W, H, parts.join(""));
}

/** A root box with lines fanning down to a row of child boxes. */
export function treeSvg(root: string, children: string[]): string {
  const W = 560, H = 168, boxH = 46, rootW = 220, y0 = 14, y1 = 104, gap = 16, padX = 10;
  const n = children.length;
  const childW = (W - padX * 2 - gap * (n - 1)) / n;
  const rootX = (W - rootW) / 2;
  const mid = (y0 + boxH + y1) / 2;
  const parts: string[] = [
    `<rect x="${rootX}" y="${y0}" width="${rootW}" height="${boxH}" rx="10" fill="${NODE}" stroke="${LINE}"/>`,
    `<text x="${W / 2}" y="${y0 + boxH / 2}" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="700" fill="${TEXT}">${esc(root)}</text>`,
  ];
  children.forEach((c, i) => {
    const x = padX + i * (childW + gap);
    parts.push(`<path d="M ${W / 2} ${y0 + boxH} V ${mid} H ${x + childW / 2} V ${y1}" fill="none" stroke="${LINE}" stroke-width="2"/>`);
    parts.push(`<rect x="${x}" y="${y1}" width="${childW}" height="${boxH}" rx="10" fill="none" stroke="${LINE}"/>`);
    parts.push(`<text x="${x + childW / 2}" y="${y1 + boxH / 2}" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="600" fill="${TEXT}">${esc(c)}</text>`);
  });
  return wrap(W, H, parts.join(""));
}

/** The mock's pre-authored diagrams, keyed by topic. */
export type SampleDiagram = { svg: string; caption: string };
export const SAMPLE_DIAGRAMS: Record<string, SampleDiagram> = {
  escalation: {
    svg: flowSvg(["Log it", "Tell supervisor", "Notify duty manager"]),
    caption: "Incident escalation — the tier decides who to tell, and how fast.",
  },
  patrol: {
    svg: stepsSvg([
      { title: "Internal patrol", detail: "Every 2 hours, on the hour" },
      { title: "Perimeter patrol", detail: "Every 4 hours" },
      { title: "Log anomalies", detail: "Scan the wand at each checkpoint" },
    ]),
    caption: "Patrol routine.",
  },
  incident: {
    svg: stepsSvg([
      { title: "Log within 30 minutes", detail: "In the incident register" },
      { title: "Written report", detail: "Tier 2–3, within 2 hours of shift end" },
      { title: "Keep it factual", detail: "What you saw and did" },
    ]),
    caption: "Reporting an incident.",
  },
  emergency: {
    svg: stepsSvg([
      { title: "Follow the evacuation plan" },
      { title: "Notify the control room" },
      { title: "Direct people to assembly" },
      { title: "Don't investigate the source" },
    ]),
    caption: "Fire alarm response.",
  },
};

const capFirst = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const truncate = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);

/**
 * Synthesize a step diagram from an answer's text when no template is authored.
 * Splits the (concise) answer into clause-sized fragments and lays them out as
 * numbered steps — so a diagram can always be drawn. A real model would compose
 * a better one; this keeps the mock always-capable rather than declining.
 */
export function autoStepsDiagram(text: string, caption = "Step by step"): SampleDiagram {
  const clauses = text
    .split(/\s*[—–]\s*|[,.;:]\s+/)
    .map((c) => c.trim().replace(/^(and|or|then|plus|but)\s+/i, "").replace(/[.,;:]+$/, ""))
    .filter((c) => c.length > 2)
    .slice(0, 6);
  const steps = (clauses.length ? clauses : [text]).map((c) => ({ title: capFirst(truncate(c, 62)) }));
  return { svg: stepsSvg(steps), caption };
}
