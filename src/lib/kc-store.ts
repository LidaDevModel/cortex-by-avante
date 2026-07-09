import type { KCAttempt, KCCategory } from "./knowledge-check-mock";
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

/**
 * The user's weakest categories by average score, lowest first — powers the
 * "Weak areas" preset. Averages score/total across every attempt that includes
 * a category (a multi-category attempt counts toward each of its categories).
 * Returns [] when there's no history to judge, so the preset can disable itself.
 */
export function getWeakestCategories(count = 1): KCCategory[] {
  const totals = new Map<KCCategory, { score: number; total: number }>();
  for (const a of getAllAttempts()) {
    for (const cat of a.categories) {
      const acc = totals.get(cat) ?? { score: 0, total: 0 };
      acc.score += a.score;
      acc.total += a.total;
      totals.set(cat, acc);
    }
  }
  return [...totals.entries()]
    .filter(([, v]) => v.total > 0)
    .sort((a, b) => a[1].score / a[1].total - b[1].score / b[1].total)
    .slice(0, count)
    .map(([cat]) => cat);
}
