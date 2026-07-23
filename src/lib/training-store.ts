"use client";

import { useSyncExternalStore } from "react";
import { MODULES, isCertified, type Module, type ModuleCategory, type Chapter } from "./training-mock";
import { getPersona } from "./demo-persona";
import { daysSince } from "./utils";
import type { Role } from "./user-mock";
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

// Seed: every existing module is guard training → Field Agent.
const SEED: AdminModule[] = MODULES.map((m) => ({ ...m, roles: ["field-agent"], published: true, lastModified: m.assignedDate }));

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

/* ─── Learner reads: published + role-visible view of the overlay ───
   Mirrors training-mock's getters but sources the overlay (so publishes/edits
   reach guards) and keeps the new-hire persona blanking. Pure helpers
   (isCertified, getTier, isShiftReady, getRequirementState) still come from
   training-mock — they operate on a Module, not the data source. */
function visibleToLearner(m: AdminModule, role: Role): boolean {
  return m.published !== false && (!m.roles || m.roles.includes(role));
}
function personaAdjust(m: AdminModule): Module {
  if (getPersona() === "new") return { ...m, status: "not-started", progress: 0, certification: undefined };
  return m;
}
/** Published, role-visible modules for the learner, persona-adjusted. */
export function learnerModules(role: Role): Module[] {
  return load().filter((m) => visibleToLearner(m, role)).map(personaAdjust);
}
export function getLearnerModule(id: string, role: Role): Module | undefined {
  const m = load().find((x) => x.id === id);
  return m && visibleToLearner(m, role) ? personaAdjust(m) : undefined;
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
  save(load().map((m) => (m.id === id ? { ...m, published, lastModified: today() } : m)));
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
