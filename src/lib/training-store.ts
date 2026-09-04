"use client";

import { useSyncExternalStore } from "react";
import { MODULES, MODULE_CHAPTERS, isCertified, type Module, type ModuleCategory, type Chapter, type Certification } from "./training-mock";
import { getPersona } from "./demo-persona";
import { daysSince } from "./utils";
import type { Role } from "./user-mock";
import { toLearnerRole } from "./learner-role";
import { logActivity } from "./activity-log";

/**
 * Training overlay. Starts from the seeded modules and overlays admin edits —
 * new modules, metadata (category, required, roles), chapters, publish state.
 * Persists to localStorage. Single source of truth a real backend replaces.
 *
 * Two views over the same overlay:
 *   - ADMIN authoring reads everything (useModules / listModules / getAdminModule).
 *   - The LEARNER reads only published, role-visible modules (the learner*
 *     helpers below), with the same new-hire persona blanking getModules() does,
 *     so an admin's publish/edit reaches field agents and drafts stay hidden.
 */

export type AdminModule = Module & { roles: Role[]; published?: boolean; lastModified?: string; authoredChapters?: Chapter[] };

const KEY = "cortex-admin-training";

/* Seed: every existing module is guard training → Field Agent.
   `lastModified` is NOT seeded from `assignedDate`. It used to be, which made
   the admin list's "Last modified" column a restatement of the assignment
   date for every module — two different facts under one heading, and the
   reason that column is now "Updated" with an explicit "Never modified" for
   anything nobody has edited. A few modules carry a real edit date so both
   states appear in the list; the rest have genuinely never been touched. */
const EDITED: Record<string, string> = {
  "1": "2026-06-02",
  "3": "2026-07-14",
  "8": "2026-05-28",
  "11": "2026-07-21",
};
const SEED: AdminModule[] = MODULES.map((m) => ({
  ...m,
  roles: ["field-agent"],
  published: true,
  ...(EDITED[m.id] ? { lastModified: EDITED[m.id] } : {}),
}));

const listeners = new Set<() => void>();
let cache: AdminModule[] | null = null;

function load(): AdminModule[] {
  if (cache) return cache;
  if (typeof window === "undefined") return SEED;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as AdminModule[]) : JSON.parse(JSON.stringify(SEED));
  } catch {
    cache = JSON.parse(JSON.stringify(SEED));
  }
  return cache ?? SEED;
}

function save(next: AdminModule[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch { /* no-op */ }
  listeners.forEach((l) => l());
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
function uid(): string {
  return `m-${Math.random().toString(36).slice(2, 8)}`;
}

/* ─── Read seams (admin: everything) ─── */
export function listModules(): AdminModule[] {
  return load();
}
export function getAdminModule(id: string): AdminModule | undefined {
  return load().find((m) => m.id === id);
}

/* ─── Chapters: the one read seam ─── */

/**
 * The chapters a module actually has — the admin's authored chapters when they
 * exist, otherwise the shared canonical set.
 *
 * **One seam, two consumers.** The learner reader and the admin preview both
 * read through here, so they can never diverge again. Before this, the preview
 * read `authoredChapters` while the reader used a hardcoded `MODULE_CHAPTERS`
 * constant — so an admin authored "Mounting and battery checks", the preview
 * promised "This is the content learners see", and the guard opened the module
 * and read six chapters about escalation procedures. Nothing the admin wrote
 * ever reached a learner, and neither side had any signal.
 *
 * `includeFinalQuiz` covers the one real difference between the two: the reader
 * needs the closing exam step, the preview shows content only. An authored set
 * carries no final quiz of its own (the editor does not author one), so the
 * canonical entry is appended — otherwise authoring a module would remove its
 * route to certification.
 */
export function moduleChapters(
  m: { authoredChapters?: Chapter[]; chapters?: number } | undefined,
  { includeFinalQuiz = false }: { includeFinalQuiz?: boolean } = {}
): Chapter[] {
  const authored = m?.authoredChapters;
  if (!authored || authored.length === 0) {
    // The module's own `chapters` count governs how much of the canonical set
    // it has. Returning the whole set regardless was the second half of P1-01:
    // a card said "4 chapters", the reader opened the same module and listed
    // six, and its first chapter scored 1 of 6 — 17% — on a module the rest of
    // the product counted in quarters. Five of the twelve seeded modules were
    // affected; only the three that happen to be authored at six agreed.
    //
    // Slicing rather than renaming the count keeps the seeded variety real:
    // the data says how long a module is, and the derived list obeys it.
    const content = MODULE_CHAPTERS.filter((c) => !c.isFinalQuiz);
    const n =
      typeof m?.chapters === "number" && m.chapters > 0
        ? Math.min(m.chapters, content.length)
        : content.length;
    const sliced = content.slice(0, n);
    if (!includeFinalQuiz) return sliced;
    const quiz = MODULE_CHAPTERS.find((c) => c.isFinalQuiz);
    return quiz ? [...sliced, { ...quiz, num: n + 1 }] : sliced;
  }
  if (!includeFinalQuiz) return authored;
  const finalQuiz = MODULE_CHAPTERS.find((c) => c.isFinalQuiz);
  return finalQuiz
    ? [...authored, { ...finalQuiz, num: authored.length + 1 }]
    : authored;
}

/* ─── Certification earned by passing an exam ─── */

/** Modules certified during this session. Read by `personaAdjust` so the
    new-hire persona does not blank a certification the user just earned. */
const sessionCertified = new Set<string>();

/**
 * Record a passed certification exam.
 *
 * Deliberately **session-only**: this mutates the in-memory overlay and
 * notifies subscribers, but never writes localStorage. Progress in this build
 * does not survive a reload (owner's call, for demo stability), and a
 * certification must behave the same way — otherwise one demo run would leave
 * a certificate behind for the next. A real backend replaces this with a POST.
 *
 * `cache` is reassigned rather than mutated so `useSyncExternalStore`'s
 * snapshot changes identity and subscribers actually re-render.
 *
 * The simulation must never call this — see VISION's exam-simulation rules.
 */
export function certifyModule(id: string, cert: Certification) {
  sessionCertified.add(id);
  cache = load().map((m) =>
    m.id === id ? { ...m, status: "completed" as const, progress: 100, certification: cert } : m
  );
  listeners.forEach((l) => l());
}

/* ─── Learner reads: published + role-visible view of the overlay ───
   Mirrors training-mock's getters but sources the overlay (so publishes/edits
   reach guards) and keeps the new-hire persona blanking. Pure helpers
   (isCertified, getTier, isShiftReady, getRequirementState) still come from
   training-mock — they operate on a Module, not the data source. */
function visibleToLearner(m: AdminModule, role: Role): boolean {
  return m.published !== false && (!m.roles || m.roles.includes(role));
}
function personaAdjust(m: AdminModule): Module {
  const persona = getPersona();
  // A certification earned in THIS session survives the new-hire blanking —
  // otherwise a new hire could pass an exam and never see the result, which is
  // the one story the demo most needs to tell.
  if (persona === "new" && !sessionCertified.has(m.id)) {
    return { ...m, status: "not-started", progress: 0, certification: undefined };
  }
  /* "certifying": the returning account, minus the certificate on ONE required
     module. Read to the end, exam still to sit — which is exactly
     `getRequirementState`'s `ready-to-certify`, the readiness-board row nobody
     had ever seen. Only the certificate is removed; progress stays at 100, so
     the module reader also shows its "ready for the final quiz" panel.
     Session certifications win here too, so passing that exam in the demo
     moves the row to certified instead of being overwritten back. */
  if (
    persona === "certifying" &&
    m.id === CERTIFYING_PENDING_ID &&
    m.required &&
    !sessionCertified.has(m.id)
  ) {
    return { ...m, status: "completed", progress: 100, certification: undefined };
  }
  return m;
}

/** The one required module the "certifying" guard has read but not passed.
    Module 1 — the first required module, so its row sorts to the top of the
    readiness board where the state is unmissable. */
const CERTIFYING_PENDING_ID = "1";
/**
 * Chapters for a module as the LEARNER sees it — role- and publish-gated, then
 * through the one `moduleChapters` seam. A module the learner may not see
 * yields the canonical set rather than leaking authored content.
 */
export function getLearnerChapters(
  id: string,
  role: Role,
  opts?: { includeFinalQuiz?: boolean }
): Chapter[] {
  const r = toLearnerRole(role);
  const m = load().find((x) => x.id === id);
  return moduleChapters(m && visibleToLearner(m, r) ? m : undefined, opts);
}
/** Published, role-visible modules for the learner, persona-adjusted. Admins
 *  learn as field agents (see toLearnerRole), so their training isn't empty. */
export function learnerModules(role: Role): Module[] {
  const r = toLearnerRole(role);
  return load().filter((m) => visibleToLearner(m, r)).map(personaAdjust);
}
export function getLearnerModule(id: string, role: Role): Module | undefined {
  const r = toLearnerRole(role);
  const m = load().find((x) => x.id === id);
  return m && visibleToLearner(m, r) ? personaAdjust(m) : undefined;
}
export function getLearnerRequired(role: Role): Module[] {
  return learnerModules(role).filter((m) => m.required);
}
export function getLearnerCertified(role: Role): Module[] {
  return learnerModules(role).filter(isCertified).sort((a, b) => b.certification!.date.localeCompare(a.certification!.date));
}
export function getLearnerRecentModules(role: Role, days = 14): Module[] {
  return learnerModules(role)
    .filter((m) => { const d = daysSince(m.assignedDate); return d >= 0 && d <= days; })
    .sort((a, b) => daysSince(a.assignedDate) - daysSince(b.assignedDate));
}

/* ─── Write seams ─── */
export function createModule(title: string): string {
  const id = uid();
  const m: AdminModule = {
    id,
    title: title.trim(),
    chapters: 0,
    hours: 1,
    progress: 0,
    status: "not-started",
    required: false,
    category: "incidents",
    assignedDate: today(),
    roles: ["field-agent"],
    published: false,
    lastModified: today(),
    authoredChapters: [],
  };
  save([m, ...load()]);
  logActivity("created", `Created module “${m.title}”`, `/admin/content/training/${id}`);
  return id;
}
function moduleTitle(id: string): string {
  return load().find((m) => m.id === id)?.title ?? "module";
}
export function updateModule(id: string, patch: Partial<Pick<AdminModule, "title" | "category" | "required" | "roles" | "hours">>) {
  save(load().map((m) => (m.id === id ? { ...m, ...patch, lastModified: today() } : m)));
}
/** Toggle whether a module is live for learners. */
export function setModulePublished(id: string, published: boolean) {
  const title = moduleTitle(id);
  save(
    load().map((m) => {
      if (m.id !== id) return m;
      /* Publishing is the moment learners can first see it, so for a REQUIRED
         module it is also the moment they owe it — and `assignedDate` is what
         the 14-day clearance window counts from (D11). Without this a module
         published today would inherit a seed date months old and be overdue
         the instant it appeared. Unpublishing leaves the date alone: it is
         history, not a toggle. */
      const assigned = published && m.required ? { assignedDate: today() } : {};
      return { ...m, published, lastModified: today(), ...assigned };
    })
  );
  logActivity("edited", `${published ? "Published" : "Unpublished"} module “${title}”`, `/admin/content/training/${id}`);
}
// updateModule + updateChapters always fire together on a save — log once here.
export function updateChapters(id: string, chapters: Chapter[]) {
  save(load().map((m) => (m.id === id ? { ...m, authoredChapters: chapters, chapters: chapters.length, lastModified: today() } : m)));
  logActivity("edited", `Updated module “${moduleTitle(id)}”`, `/admin/content/training/${id}`);
}
export function deleteModule(id: string) {
  const title = moduleTitle(id);
  save(load().filter((m) => m.id !== id));
  logActivity("deleted", `Deleted module “${title}”`);
}

/* ─── Reactivity ─── */
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
export function useModules(): AdminModule[] {
  return useSyncExternalStore(subscribe, load, () => SEED);
}
/** Subscribe to the learner module view so publishes/edits re-render the guard. */
export function useLearnerModules(role: Role): Module[] {
  useSyncExternalStore(subscribe, load, () => SEED);
  return learnerModules(role);
}

export const CATEGORY_OPTIONS: { value: ModuleCategory; label: string }[] = [
  { value: "first-aid", label: "First aid" },
  { value: "escalations", label: "Escalations" },
  { value: "clients", label: "Clients" },
  { value: "incidents", label: "Incidents" },
];
