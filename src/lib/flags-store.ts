"use client";

import { useSyncExternalStore } from "react";
import { USER } from "./user-mock";
import { logActivity } from "./activity-log";

/**
 * Flagged AI responses. The learner side writes (a thumbs-down + reason in the
 * chat feedback modal files a flag); the admin Reports screen reads and
 * resolves. Persists to localStorage — the same backend seam as the other
 * admin stores.
 */

export type FlagStatus = "open" | "resolved";

export type FlaggedResponse = {
  id: string;
  /** The question the user asked. */
  question: string;
  /** The answer that was flagged (plain text). */
  answer: string;
  /** Reason chip from the feedback modal: Incomplete / Wrong info / Other. */
  reason: string;
  /** Free-text detail when the reason is Other. */
  note?: string;
  flaggedBy: string;
  date: string;
  status: FlagStatus;
  /** The Library section the answer was grounded in (first citation), if any. */
  source?: { docId: string; label: string };
  resolvedBy?: string;
  resolvedDate?: string;
};

const KEY = "cortex-admin-flags";

// Seeded history so the Reports screen demos meaningfully on first open.
const SEED: FlaggedResponse[] = [
  {
    id: "flag-1",
    question: "How long do I have to file an incident report?",
    answer: "All incidents must be logged in the incident register within 30 minutes of occurrence. Shift reports are to be completed before handover.",
    reason: "Incomplete",
    flaggedBy: "Amara Diallo",
    date: "2026-07-18",
    status: "open",
    source: { docId: "1", label: "Incident Response · Reporting Requirements" },
  },
  {
    id: "flag-2",
    question: "Which radio channel is for emergencies?",
    answer: "Channel 1 is the primary operations channel. Channel 2 is reserved for emergencies only.",
    reason: "Wrong info",
    note: "Site B swapped the channels last month.",
    flaggedBy: "David Chen",
    date: "2026-07-15",
    status: "open",
    source: { docId: "3", label: "Security Protocols · Communication Protocols" },
  },
  {
    id: "flag-3",
    question: "Do contractors need an escort on site?",
    answer: "Contractors must be pre-approved by site management and hold a current contractor access pass.",
    reason: "Incomplete",
    flaggedBy: "Lena Novak",
    date: "2026-07-02",
    status: "resolved",
    resolvedBy: "Mike Martinez",
    resolvedDate: "2026-07-05",
  },
];

const listeners = new Set<() => void>();
let cache: FlaggedResponse[] | null = null;

function load(): FlaggedResponse[] {
  if (cache) return cache;
  if (typeof window === "undefined") return SEED;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as FlaggedResponse[]) : JSON.parse(JSON.stringify(SEED));
  } catch {
    cache = JSON.parse(JSON.stringify(SEED));
  }
  return cache ?? SEED;
}

function save(next: FlaggedResponse[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch { /* no-op */ }
  listeners.forEach((l) => l());
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/* ─── Read seams ─── */
export function listFlags(): FlaggedResponse[] {
  return load();
}
export function openFlagCount(): number {
  return load().filter((f) => f.status === "open").length;
}

/* ─── Write seams ─── */
export function addFlag(input: { question: string; answer: string; reason: string; note?: string; source?: { docId: string; label: string } }) {
  const flag: FlaggedResponse = {
    id: `flag-${Math.random().toString(36).slice(2, 8)}`,
    question: input.question,
    answer: input.answer,
    reason: input.reason,
    note: input.note?.trim() || undefined,
    flaggedBy: USER.fullName,
    date: today(),
    status: "open",
    source: input.source,
  };
  save([flag, ...load()]);
}
export function resolveFlag(id: string) {
  const flag = load().find((f) => f.id === id);
  save(load().map((f) => (f.id === id ? { ...f, status: "resolved" as const, resolvedBy: USER.fullName, resolvedDate: today() } : f)));
  if (flag) logActivity(`Resolved a flagged response: “${flag.question.slice(0, 60)}${flag.question.length > 60 ? "…" : ""}”`);
}

/* ─── Reactivity ─── */
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
export function useFlags(): FlaggedResponse[] {
  return useSyncExternalStore(subscribe, load, () => SEED);
}
