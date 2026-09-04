"use client";

import { useEffect, useState } from "react";

/**
 * Whether Home still owes this learner their welcome.
 *
 * Onboarding's one acknowledgement used to be a five-second toast — "Welcome,
 * Mike. Your account is ready." — fired on the way to Home, where it landed on
 * top of the readiness board it was congratulating him into. By the app's own
 * convention a toast confirms an ACTION; a welcome is the product greeting a
 * person for the first time, and it should not expire before they finish
 * reading it.
 *
 * So activation arms this flag instead, and Home shows a card until the
 * learner acts on it or dismisses it. Separate from `required-seen.ts`, which
 * consumes its own first-run signal the moment Home mounts and so cannot
 * answer this question by the time the card needs to render.
 *
 * localStorage, like every other learner signal in the mock; a real backend
 * would store it per user alongside the activation record.
 */

const KEY = "cortex-welcome-pending";

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

function set(pending: boolean) {
  try {
    if (pending) localStorage.setItem(KEY, "1");
    else localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable — the welcome is skipped, never a broken screen */
  }
  emit();
}

/** Called when activation finishes. */
export function armWelcome() {
  set(true);
}

/** Called when the card is dismissed, or its CTA taken. */
export function clearWelcome() {
  set(false);
}

/**
 * True while the welcome is owed. False on the server and on the first client
 * render, so there is no hydration mismatch — the card fades in a beat later,
 * which is also when the rest of Home's data arrives.
 */
export function useWelcomePending(): boolean {
  const [pending, setPending] = useState(false);

  useEffect(() => {
    function sync() {
      try {
        setPending(localStorage.getItem(KEY) === "1");
      } catch {
        setPending(false);
      }
    }
    sync();
    listeners.add(sync);
    return () => {
      listeners.delete(sync);
    };
  }, []);

  return pending;
}
