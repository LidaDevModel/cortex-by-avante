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

function categoryKey(cats: string[]) {
  return [...cats].sort().join(",");
}

export function getAttemptOrdinal(id: string): number {
  const all = getAllAttempts();
  const attempt = all.find((a) => a.id === id);
  if (!attempt) return 1;
  const key = categoryKey(attempt.categories);
  const group = all
    .filter((a) => categoryKey(a.categories) === key)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return group.findIndex((a) => a.id === id) + 1;
}

export function getPendingOrdinal(categories: string[]): number {
  const key = categoryKey(categories);
  return getAllAttempts().filter((a) => categoryKey(a.categories) === key).length + 1;
}
