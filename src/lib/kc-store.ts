import type { KCAttempt, KCCategory, KCFormat } from "./knowledge-check-mock";
import { MOCK_ATTEMPTS, scoreQuestion, countAvailable, CATEGORY_LABELS } from "./knowledge-check-mock";
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

/**
 * The subjects a "Weak areas" run should actually cover.
 *
 * Starts from the weakest and adds the next weakest until there are enough
 * questions for a worthwhile session. The bank is uneven -- first aid has one
 * question, incidents has five -- so targeting the single weakest subject can
 * yield a one-question "check", which reads as broken even though it is honest.
 * Widening is better than padding with subjects the learner is already good at.
 *
 * Returns the subjects in weakest-first order, so a caller can name them.
 */
export function getWeakAreaTargets(formats: KCFormat[], minQuestions = 4): KCCategory[] {
  const ranked = getWeakestCategories(4);
  const picked: KCCategory[] = [];
  for (const cat of ranked) {
    picked.push(cat);
    if (countAvailable(formats, picked) >= minQuestions) break;
  }
  return picked;
}

/**
 * The "Weak areas" tile's subtitle, built in ONE place.
 *
 * Home and the Knowledge Check screen both show this tile, and both used to
 * build the sentence themselves from `getWeakestCategories(1)` — so once the
 * run widened to two subjects, the two screens would have disagreed about what
 * it targets. Same reasoning as the shared chapter seam: one function, two
 * consumers, no way to drift.
 *
 * Returns null when there is no history yet, which is also the tile's disabled
 * condition.
 */
export function getWeakAreaMeta(formats: KCFormat[]): string | null {
  const targets = getWeakAreaTargets(formats);
  if (targets.length === 0) return null;
  const names = targets.map((c) => CATEGORY_LABELS[c]);
  const joined =
    names.length === 1
      ? names[0]
      : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  return names.length === 1
    ? `Targets your weakest area: ${joined}`
    : `Targets your weakest areas: ${joined}`;
}

/**
 * The learner's weakest subjects, scored PER QUESTION.
 *
 * This used to credit a whole attempt's score to every category the attempt was
 * tagged with -- so one 0/11 attempt tagged "escalations, first aid" pushed both
 * to the bottom, and an 11/11 attempt tagged four categories lifted all four,
 * regardless of what the questions were actually about. Nothing was attributed
 * to the subject it belonged to, because questions had no subject.
 *
 * Now each question's own result counts toward its own category.
 */
export function getWeakestCategories(count = 1): KCCategory[] {
  const totals = new Map<KCCategory, { score: number; total: number }>();
  for (const attempt of getAllAttempts()) {
    for (const q of attempt.questions) {
      const { correct, total } = scoreQuestion(q, attempt.answers[q.id]);
      const acc = totals.get(q.category) ?? { score: 0, total: 0 };
      acc.score += correct;
      acc.total += total;
      totals.set(q.category, acc);
    }
  }
  return [...totals.entries()]
    .filter(([, v]) => v.total > 0)
    .sort((a, b) => a[1].score / a[1].total - b[1].score / b[1].total)
    .slice(0, count)
    .map(([cat]) => cat);
}
