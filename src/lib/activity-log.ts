"use client";

import { useSyncExternalStore } from "react";
import { USER } from "./user-mock";

/**
 * Admin action log. Every admin write seam (content, modules, people, flags)
 * records what happened and who did it. The Reports → Activity log screen
 * reads it. Persists to localStorage — the same backend seam as the other
 * admin stores. Actor is always the signed-in user (single-session mock).
 */

/** Coarse action type — powers the Activity log's action filter. */
export type ActivityKind = "created" | "edited" | "invited" | "resolved" | "deleted";

/** Filter labels, in menu order. */
export const ACTIVITY_KIND_OPTIONS: { value: ActivityKind; label: string }[] = [
  { value: "created", label: "Created" },
  { value: "edited", label: "Edited" },
  { value: "invited", label: "Invited" },
  { value: "resolved", label: "Resolved" },
  { value: "deleted", label: "Deleted" },
];

export type ActivityEntry = {
  id: string;
  /** Full ISO timestamp — the log is ordered by it, newest first. */
  ts: string;
  actor: string;
  kind: ActivityKind;
  /** Human sentence fragment, e.g. `Published "Security Protocols"`. */
  action: string;
  /** Internal route to the target (file, module, account, flag). Absent when
   *  the target no longer exists — e.g. a delete — so the row isn't clickable. */
  href?: string;
};

const KEY = "cortex-admin-activity";

// Seeded history so the log — and the Home trends — demo meaningfully. Spread
// across ~90 days with a mix of kinds and actors.
const SEED: ActivityEntry[] = [
  { id: "act-13", ts: "2026-07-21T09:12:00Z", actor: "Sara Okafor", kind: "edited", action: "Updated document “Incident Response”", href: "/admin/content/1" },
  { id: "act-12", ts: "2026-07-20T14:38:00Z", actor: "Mike Martinez", kind: "created", action: "Created module “Guard Duty Fundamentals”", href: "/admin/content/training/6" },
  { id: "act-11", ts: "2026-07-19T10:24:00Z", actor: "Mike Martinez", kind: "invited", action: "Invited tom.whitfield@avante.security as Field Agent", href: "/admin/people/u-tom" },
  { id: "act-10", ts: "2026-07-18T16:05:00Z", actor: "Mike Martinez", kind: "resolved", action: "Resolved a flagged response about incident reporting", href: "/admin/reports/flagged/flag-1" },
  { id: "act-9", ts: "2026-07-16T11:47:00Z", actor: "Sara Okafor", kind: "edited", action: "Published document “Door Access Policy”", href: "/admin/content/ac-1" },
  { id: "act-8", ts: "2026-07-12T08:53:00Z", actor: "Mike Martinez", kind: "created", action: "Created document “Contractor Access Form”", href: "/admin/content/ac-5" },
  { id: "act-7", ts: "2026-07-05T15:02:00Z", actor: "Mike Martinez", kind: "resolved", action: "Resolved a flagged response about contractor escorts", href: "/admin/reports/flagged/flag-3" },
  { id: "act-6", ts: "2026-07-02T13:20:00Z", actor: "Sara Okafor", kind: "edited", action: "Unpublished module “Radio Communications”", href: "/admin/content/training/10" },
  { id: "act-5", ts: "2026-06-28T09:41:00Z", actor: "Sara Okafor", kind: "edited", action: "Updated document “Security Protocols”", href: "/admin/content/3" },
  { id: "act-4", ts: "2026-06-20T17:14:00Z", actor: "Mike Martinez", kind: "created", action: "Created folder “Site Briefings”", href: "/admin/content?folder=12" },
  { id: "act-3", ts: "2026-06-10T10:08:00Z", actor: "Mike Martinez", kind: "deleted", action: "Deleted document “Old Visitor Policy”" },
  { id: "act-2", ts: "2026-05-30T12:36:00Z", actor: "Sara Okafor", kind: "invited", action: "Invited raj.patel@avante.security as Field Agent", href: "/admin/people/u-raj" },
  { id: "act-1", ts: "2026-05-18T14:50:00Z", actor: "Mike Martinez", kind: "edited", action: "Changed Lena Novak’s role to Field Agent", href: "/admin/people/u-lena" },
];

const listeners = new Set<() => void>();
let cache: ActivityEntry[] | null = null;

function load(): ActivityEntry[] {
  if (cache) return cache;
  if (typeof window === "undefined") return SEED;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as ActivityEntry[]) : JSON.parse(JSON.stringify(SEED));
  } catch {
    cache = JSON.parse(JSON.stringify(SEED));
  }
  return cache ?? SEED;
}

function save(next: ActivityEntry[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch { /* no-op */ }
  listeners.forEach((l) => l());
}

/** Record an admin action. Call from store write seams, never from render.
 *  `href` is the internal route to the target — omit for a vanished target
 *  (a delete), so the log row won't offer a dead link. */
export function logActivity(kind: ActivityKind, action: string, href?: string) {
  if (typeof window === "undefined") return;
  const entry: ActivityEntry = {
    id: `act-${Math.random().toString(36).slice(2, 8)}`,
    ts: new Date().toISOString(),
    actor: USER.fullName,
    kind,
    action,
    href,
  };
  save([entry, ...load()]);
}

export function listActivity(): ActivityEntry[] {
  return load();
}

/* ─── Reactivity ─── */
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
export function useActivity(): ActivityEntry[] {
  return useSyncExternalStore(subscribe, load, () => SEED);
}
