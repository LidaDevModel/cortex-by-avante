"use client";

import { useEffect, useState } from "react";
import { isCertified, type Module } from "./training-mock";
import { learnerModules } from "./training-store";
import { toLearnerRole } from "./learner-role";
import type { Role } from "./user-mock";

/**
 * Which required modules the learner has already been told about.
 *
 * Readiness is a pure boolean recomputed every render, so the app cannot tell
 * "never cleared" apart from "was cleared until a requirement was added". This
 * store is that missing memory: the set of required module ids the learner has
 * acknowledged. Anything required-but-unseen is a CHANGE, and Home explains it
 * once instead of silently reshaping into the onboarding layout.
 *
 * First run seeds silently — an established account should not be told its
 * existing requirements are "new". Persists to localStorage; a real backend
 * would store this per user alongside their assignments.
 */

const KEY = "cortex-seen-required";

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** Acknowledged ids, or `null` when this device has never seen the set. */
function read(): string[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : null;
  } catch {
    return null;
  }
}

function write(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...new Set(ids)]));
  } catch {
    /* storage unavailable — non-fatal, the card just shows again next time */
  }
  emit();
}

/** Mark every currently-required module as acknowledged ("Not now", or done). */
export function acknowledgeRequired(role: Role) {
  write(requiredIds(role));
}

function requiredIds(role: Role): string[] {
  return learnerModules(toLearnerRole(role))
    .filter((m) => m.required)
    .map((m) => m.id);
}

/**
 * Required modules the learner has not been told about and has not certified.
 * Pure — never writes. `null` marker means "never seen", so nothing is new yet.
 */
function computeNew(role: Role): Module[] {
  const seen = read();
  if (seen === null) return [];
  const seenSet = new Set(seen);
  return learnerModules(toLearnerRole(role)).filter(
    (m) => m.required && !seenSet.has(m.id) && !isCertified(m)
  );
}

/**
 * Whether the learner was cleared before these modules arrived — i.e. every
 * OTHER required module is certified. Drives the copy: only a previously
 * cleared agent is told they will be "cleared again".
 */
export function wasClearedBefore(role: Role, incoming: Module[]): boolean {
  const incomingIds = new Set(incoming.map((m) => m.id));
  const others = learnerModules(toLearnerRole(role)).filter(
    (m) => m.required && !incomingIds.has(m.id)
  );
  return others.length > 0 && others.every(isCertified);
}

/**
 * The newly-required modules to explain on Home.
 *
 * Client-only by design: the store's first read happens after mount, so
 * seeding must not run during render — doing so would capture the server's
 * module set and mis-report the difference. Empty on the server and on the
 * first client render, so there is no hydration mismatch.
 */
export function useNewRequirements(role: Role): Module[] {
  const [items, setItems] = useState<Module[]>([]);

  useEffect(() => {
    function sync() {
      if (read() === null) {
        // First run on this device: adopt the current set silently. An
        // established account is never told its own requirements are new.
        write(requiredIds(role));
        setItems([]);
        return;
      }
      setItems(computeNew(role));
    }
    sync();
    return subscribe(sync);
  }, [role]);

  return items;
}
