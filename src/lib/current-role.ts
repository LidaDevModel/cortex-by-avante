"use client";

import { useSyncExternalStore } from "react";
import type { Role } from "./user-mock";

/**
 * The active user's access role for the demo.
 *
 * This gates the interface only (nav + admin routes). It is NOT security — a
 * real backend enforces roles at the API. A dev/demo control flips it so you
 * can present the admin view. Defaults to "field-agent" (the learner).
 *
 * Reactive: setRole() notifies subscribers, so the sidebar and admin gate
 * update live without a reload.
 */
const KEY = "cortex-demo-role";

const listeners = new Set<() => void>();

export function getCurrentRole(): Role {
  if (typeof window === "undefined") return "field-agent";
  try {
    return localStorage.getItem(KEY) === "admin" ? "admin" : "field-agent";
  } catch {
    return "field-agent";
  }
}

export function setCurrentRole(role: Role) {
  try {
    localStorage.setItem(KEY, role);
  } catch { /* no-op */ }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useCurrentRole(): Role {
  return useSyncExternalStore(subscribe, getCurrentRole, () => "field-agent" as Role);
}
