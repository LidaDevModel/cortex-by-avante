import type { KCAttempt, KCCategory } from "./knowledge-check-mock";
import { MOCK_ATTEMPTS } from "./knowledge-check-mock";
import { getPersona } from "./demo-persona";

// Module-level store so attempts created during the session survive navigation
const sessionAttempts: KCAttempt[] = [];

export function addAttempt(attempt: KCAttempt) {
  sessionAttempts.unshift(attempt);
}

export function getAllAttempts(): KCAttempt[] {
  // A new guard has no seeded history — only whatever they complete live in the
  // demo. Mike (returning) keeps the seeded MOCK_ATTEMPTS.
  if (getPersona() === "new") return [...sessionAttempts];
  return [...sessionAttempts, ...MOCK_ATTEMPTS];
}

export function findAttempt(id: string): KCAttempt | undefined {
  return getAllAttempts().find((a) => a.id === id);
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
/**
 * Today's completed "Daily 5" attempt, if one exists — powers the dashboard's
 * "Done for today" state on the Quick practice widget. Compares calendar days
 * in local time. Returns undefined when the daily hasn't been done today.
 */
export function getTodaysDailyAttempt(now: Date = new Date()): KCAttempt | undefined {
  const isSameDay = (iso: string) => {
    const d = new Date(iso);
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };
  return getAllAttempts().find((a) => a.preset === "daily5" && isSameDay(a.date));
}

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
