"use client";

import { useSyncExternalStore } from "react";

/*
 * Demo persona — which door the session came through, and how far along that
 * person is.
 *
 * Sign-up (activation) → "new": a brand-new guard on day one. Sign-in →
 * "returning": Mike's lived-in, fully-certified account. "certifying" is the
 * third state, reachable only from the dev panel: a guard who has READ every
 * required module but has one exam still to sit.
 *
 * That third one exists because `getRequirementState`'s `ready-to-certify` row
 * — the readiness board row that says "Get certified" — had never been seen by
 * anyone. Showing it needs a REQUIRED module read but uncertified, and by the
 * clearance rule that guard is not cleared, which would also lock Cortex
 * Manage for the returning admin and unpick the rest of the demo. So it is its
 * own person rather than a change to an existing one.
 *
 * Presentation-only: a real backend would key everything off the actual signed-
 * in user instead.
 */

export type DemoPersona = "new" | "returning" | "certifying";

const KEY = "cortex-demo-persona";
const ORDER: DemoPersona[] = ["returning", "certifying", "new"];

const listeners = new Set<() => void>();

export function getPersona(): DemoPersona {
  if (typeof window === "undefined") return "returning";
  try {
    const raw = localStorage.getItem(KEY);
    return ORDER.includes(raw as DemoPersona) ? (raw as DemoPersona) : "returning";
  } catch {
    return "returning";
  }
}

export function setPersona(p: DemoPersona) {
  try {
    localStorage.setItem(KEY, p);
  } catch {
    /* no-op */
  }
  // Reactive, like the role store: the dev panel switches persona and the
  // screen updates without a reload.
  listeners.forEach((l) => l());
}

/** Dev-panel action: step to the next persona. */
export function cyclePersona(): DemoPersona {
  const next = ORDER[(ORDER.indexOf(getPersona()) + 1) % ORDER.length];
  setPersona(next);
  return next;
}

export const PERSONA_LABEL: Record<DemoPersona, string> = {
  returning: "Returning — fully certified",
  certifying: "Certifying — one exam left",
  new: "New hire — day one",
};

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function usePersona(): DemoPersona {
  return useSyncExternalStore(subscribe, getPersona, () => "returning" as DemoPersona);
}
