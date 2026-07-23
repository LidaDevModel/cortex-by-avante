/**
 * Back-navigation helpers for admin targets reached from a list (activity log,
 * flagged responses, People). A target page carries a validated `return` path
 * so its back affordance drives you to where you came from — not its own
 * default parent. Mirrors the exam simulation's `return` param.
 */

/** Known admin list pages → their "Back to …" label. Longest match wins. */
const BACK_LABELS: { prefix: string; label: string }[] = [
  { prefix: "/admin/reports/activity", label: "Back to activity log" },
  { prefix: "/admin/reports/flagged", label: "Back to flagged responses" },
  { prefix: "/admin/people", label: "Back to People" },
  { prefix: "/admin/content", label: "Back to content" },
  // Least specific — must stay last so the routes above win the prefix match.
  { prefix: "/admin", label: "Back to home" },
];

/** A safe internal path — leading single slash, never protocol-relative. */
export function isInternalPath(p: string | null | undefined): p is string {
  return !!p && p.startsWith("/") && !p.startsWith("//");
}

/**
 * Resolve a back affordance: honor a validated `return` path (with a label
 * matched to the known list pages), otherwise the page's own default.
 */
export function resolveBack(
  returnParam: string | null | undefined,
  fallback: { href: string; label: string }
): { href: string; label: string } {
  if (!isInternalPath(returnParam)) return fallback;
  const match = BACK_LABELS.find((b) => returnParam.startsWith(b.prefix));
  return { href: returnParam, label: match?.label ?? fallback.label };
}

/** Append a `return` path to an internal href, so the target can drive back. */
export function withReturn(href: string, returnPath: string): string {
  const sep = href.includes("?") ? "&" : "?";
  return `${href}${sep}return=${encodeURIComponent(returnPath)}`;
}
