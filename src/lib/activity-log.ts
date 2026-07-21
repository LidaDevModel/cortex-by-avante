"use client";

import { useSyncExternalStore } from "react";
import { USER } from "./user-mock";

/**
 * Admin action log. Every admin write seam (content, modules, people, flags)
 * records what happened and who did it. The Reports → Activity log screen
 * reads it. Persists to localStorage — the same backend seam as the other
 * admin stores. Actor is always the signed-in user (single-session mock).
 */

export type ActivityEntry = {
  id: string;
  /** Full ISO timestamp — the log is ordered by it, newest first. */
  ts: string;
  actor: string;
  /** Human sentence fragment, e.g. `Published "Security Protocols"`. */
  action: string;
};

const KEY = "cortex-admin-activity";

// Seeded history so the log demos meaningfully on first open.
const SEED: ActivityEntry[] = [
  { id: "act-3", ts: "2026-07-19T10:24:00Z", actor: "Mike Martinez", action: "Invited tom.whitfield@avante.security as Field Agent" },
  { id: "act-2", ts: "2026-07-05T15:02:00Z", actor: "Mike Martinez", action: "Resolved a flagged response about contractor escorts" },
  { id: "act-1", ts: "2026-06-28T09:41:00Z", actor: "Sara Okafor", action: "Updated document “Incident Response”" },
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

/** Record an admin action. Call from store write seams, never from render. */
export function logActivity(action: string) {
  if (typeof window === "undefined") return;
  const entry: ActivityEntry = {
    id: `act-${Math.random().toString(36).slice(2, 8)}`,
    ts: new Date().toISOString(),
    actor: USER.fullName,
    action,
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
