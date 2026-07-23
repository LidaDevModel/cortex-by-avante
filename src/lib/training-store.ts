"use client";

import { useSyncExternalStore } from "react";
import { MODULES, type Module, type ModuleCategory, type Chapter } from "./training-mock";
import type { Role } from "./user-mock";
import { logActivity } from "./activity-log";

/**
 * Admin training overlay. Starts from the seeded modules and overlays admin
 * edits — new modules, metadata (category, required, roles), chapters, and each
 * chapter's quiz. Persists to localStorage.
 *
 * Two authoring additions on top of the base Module:
 *   - roles: which roles the module is for (no role targeting existed before).
 *   - authoredChapters: per-module chapters (the seed shares one chapter set and
 *     stores only a count). The learner reader still uses the seed until wired.
 *
 * Drives the ADMIN screens. Same backend seam as the other stores.
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

/* ─── Read seams ─── */
export function listModules(): AdminModule[] {
  return load();
}
export function getAdminModule(id: string): AdminModule | undefined {
  return load().find((m) => m.id === id);
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

export const CATEGORY_OPTIONS: { value: ModuleCategory; label: string }[] = [
  { value: "first-aid", label: "First aid" },
  { value: "escalations", label: "Escalations" },
  { value: "clients", label: "Clients" },
  { value: "incidents", label: "Incidents" },
];
