"use client";

/*
 * Demo persona — which door the session came through.
 *
 * Sign-up (activation) → "new": a brand-new guard on day one. Sign-in →
 * "returning": Mike's lived-in account. The data layer (training-mock,
 * kc-store) reads this to decide whether to show a blank slate or Mike's real
 * progress. Defaults to "returning" so any direct visit shows the full account.
 *
 * Presentation-only: a real backend would key everything off the actual signed-
 * in user instead.
 */

export type DemoPersona = "new" | "returning";

const KEY = "cortex-demo-persona";

export function getPersona(): DemoPersona {
  if (typeof window === "undefined") return "returning";
  try {
    return localStorage.getItem(KEY) === "new" ? "new" : "returning";
  } catch {
    return "returning";
  }
}

export function setPersona(p: DemoPersona) {
  try {
    localStorage.setItem(KEY, p);
  } catch {}
}
