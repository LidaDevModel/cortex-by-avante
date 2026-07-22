"use client";

import { useSyncExternalStore } from "react";
import { getRecentDocuments } from "@/lib/library-mock";
import { getRecentModules } from "@/lib/training-mock";
import { getTodaysDailyAttempt } from "@/lib/kc-store";
import { getCurrentRole } from "@/lib/current-role";
import { listFlags } from "@/lib/flags-store";
import { listUsers } from "@/lib/admin-store";
import { ROLE_LABEL } from "@/lib/user-mock";

/*
 * Notifications — the time-sensitive layer over each role's events. Field
 * agents get the learner feed (new assignments + the Daily 5 nudge); admins
 * get that same learner feed (they have a Learning group too) plus the
 * operational feed — a response flagged for review, a staff invite still
 * awaiting activation. Mock seam: a real backend replaces the builders below;
 * the store shape (items · unread · prefs) is the contract the UI consumes.
 * Everything derives from role-gated sources, so the list inherits the role
 * boundary.
 */

export type NotificationCategory = "assignment" | "practice" | "flag" | "invite";

export type CortexNotification = {
  id: string;
  category: NotificationCategory;
  title: string;
  meta: string;
  /** ISO date — drives Today/Earlier grouping and relative time. */
  date: string;
  href: string;
};

export type NotificationPrefs = {
  assignments: boolean;
  practice: boolean;
  /** Admin-only: a guard flagged an AI answer for review. */
  flags: boolean;
  /** Admin-only: an invited user hasn't activated their account yet. */
  invites: boolean;
};

const PREFS_KEY = "cortex-notification-prefs";
const READ_KEY = "cortex-notifications-read";
const DEFAULT_PREFS: NotificationPrefs = {
  assignments: true,
  practice: true,
  flags: true,
  invites: true,
};

/* ── Reactivity: version counter store (same idiom as the toast store) ── */
let version = 0;
const listeners = new Set<() => void>();
function emit() {
  version++;
  listeners.forEach((l) => l());
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** Re-render trigger for anything reading notification state. */
export function useNotificationsVersion(): number {
  return useSyncExternalStore(subscribe, () => version, () => 0);
}

/* ── Prefs ── */
export function getNotificationPrefs(): NotificationPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

export function setNotificationPref(key: keyof NotificationPrefs, value: boolean) {
  const next = { ...getNotificationPrefs(), [key]: value };
  localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  emit();
}

/* ── Read state ── */
function getReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(READ_KEY) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

export function markRead(id: string) {
  const ids = getReadIds();
  if (ids.has(id)) return;
  ids.add(id);
  localStorage.setItem(READ_KEY, JSON.stringify([...ids]));
  emit();
}

export function markAllRead() {
  const ids = getReadIds();
  getNotifications().forEach((n) => ids.add(n.id));
  localStorage.setItem(READ_KEY, JSON.stringify([...ids]));
  emit();
}

/* ── Items ── */
const RECENCY_DAYS = 14;

/** Trim a flagged question to a single-line notification meta. */
function trimQuestion(q: string): string {
  return q.length > 64 ? `${q.slice(0, 63).trimEnd()}…` : q;
}

export function getNotifications(): (CortexNotification & { unread: boolean })[] {
  const prefs = getNotificationPrefs();
  const read = getReadIds();
  const items: CortexNotification[] = [];

  /* ── Learner feed — field agents and admins alike (admins have a Learning group too) ── */
  if (prefs.assignments) {
    for (const m of getRecentModules(RECENCY_DAYS)) {
      items.push({
        id: `mod-${m.id}`,
        category: "assignment",
        title: `New module assigned: ${m.title}`,
        meta: `${m.chapters} chapters · ${m.hours}h`,
        date: m.assignedDate,
        href: `/training/modules/${m.id}`,
      });
    }
    for (const d of getRecentDocuments(RECENCY_DAYS)) {
      items.push({
        id: `doc-${d.id}`,
        category: "assignment",
        title: `Document updated: ${d.name}`,
        meta: `Library · ${d.content}`,
        date: d.lastModified,
        href: `/library/files/${d.id}`,
      });
    }
  }

  if (prefs.practice && !getTodaysDailyAttempt()) {
    items.push({
      id: `daily-${new Date().toDateString()}`,
      category: "practice",
      title: "Your Daily 5 is ready",
      meta: "5 questions · mixed · ~4 min",
      date: new Date().toISOString(),
      href: "/training/quick-check?start=daily5",
    });
  }

  /* ── Operational feed — admins only ── */
  if (getCurrentRole() === "admin") {
    if (prefs.flags) {
      for (const f of listFlags()) {
        if (f.status !== "open") continue;
        items.push({
          id: `flagged-${f.id}`,
          category: "flag",
          title: "Response flagged for review",
          meta: trimQuestion(f.question),
          date: f.date,
          href: `/admin/reports/flagged/${f.id}`,
        });
      }
    }
    if (prefs.invites) {
      for (const u of listUsers()) {
        if (u.status !== "invited") continue;
        items.push({
          id: `invite-${u.id}`,
          category: "invite",
          title: "Invite awaiting activation",
          meta: `${u.fullName} · ${ROLE_LABEL[u.role]}`,
          date: u.memberSince,
          href: "/admin/people",
        });
      }
    }
  }

  return items
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((n) => ({ ...n, unread: !read.has(n.id) }));
}

export function getUnreadCount(): number {
  return getNotifications().filter((n) => n.unread).length;
}
