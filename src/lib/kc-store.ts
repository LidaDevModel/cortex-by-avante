import type { KCAttempt } from "./knowledge-check-mock";
import { MOCK_ATTEMPTS } from "./knowledge-check-mock";

// Module-level store so attempts created during the session survive navigation
const sessionAttempts: KCAttempt[] = [];

export function addAttempt(attempt: KCAttempt) {
  sessionAttempts.unshift(attempt);
}

export function getAllAttempts(): KCAttempt[] {
  return [...sessionAttempts, ...MOCK_ATTEMPTS];
}

export function findAttempt(id: string): KCAttempt | undefined {
  return sessionAttempts.find((a) => a.id === id) ?? MOCK_ATTEMPTS.find((a) => a.id === id);
}
