"use client";

import { useSyncExternalStore } from "react";
import { FOLDERS, TOP_LEVEL_DOCS, type LibraryFolder, type LibraryDoc, type TocSection } from "./library-mock";
import type { Role } from "./user-mock";
import { isWithinDays, daysSince } from "./utils";
import { logActivity } from "./activity-log";

/**
 * Content overlay for the library. It starts from the seeded library and
 * overlays admin edits — new folders/documents, renames, deletes, section
 * edits, and publish state. Persists to localStorage so a demo survives a
 * reload. This is the single source of truth a real backend replaces.
 *
 * Two views over the same overlay:
 *  - ADMIN authoring reads everything (useLibrary / getContentDoc / getContentFolder).
 *  - The LEARNER reads only published, role-visible content (the learner*
 *    helpers below), so an admin's publish/edit reaches field agents and drafts
 *    stay hidden.
 */

const KEY = "cortex-admin-library";

export type Library = { folders: LibraryFolder[]; topLevel: LibraryDoc[] };

// Stable reference for the server render; the client rehydrates from the cache.
const SERVER_SEED: Library = { folders: FOLDERS, topLevel: TOP_LEVEL_DOCS };

const listeners = new Set<() => void>();
let cache: Library | null = null;

function clone(): Library {
  return JSON.parse(JSON.stringify({ folders: FOLDERS, topLevel: TOP_LEVEL_DOCS })) as Library;
}

function load(): Library {
  if (cache) return cache;
  if (typeof window === "undefined") return SERVER_SEED;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as Library) : clone();
  } catch {
    cache = clone();
  }
  return cache;
}

function save(next: Library) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch { /* no-op */ }
  listeners.forEach((l) => l());
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ─── Read seams ─── */
export function getContentDoc(id: string): { doc: LibraryDoc; folderId?: string } | undefined {
  const lib = load();
  for (const f of lib.folders) {
    const d = f.documents.find((x) => x.id === id);
    if (d) return { doc: d, folderId: f.id };
  }
  const t = lib.topLevel.find((x) => x.id === id);
  return t ? { doc: t } : undefined;
}
export function getContentFolder(id: string): LibraryFolder | undefined {
  return load().folders.find((f) => f.id === id);
}

/* ─── Write seams ─── */
function itemName(id: string): string {
  const lib = load();
  const doc = [...lib.folders.flatMap((f) => f.documents), ...lib.topLevel].find((d) => d.id === id);
  if (doc) return doc.name;
  return lib.folders.find((f) => f.id === id)?.name ?? "item";
}
/** Route to the item's editor (document) or folder view — for the activity log. */
function itemHref(id: string): string {
  const lib = load();
  const isDoc = [...lib.folders.flatMap((f) => f.documents), ...lib.topLevel].some((d) => d.id === id);
  return isDoc ? `/admin/content/${id}` : `/admin/content?folder=${id}`;
}

export function createFolder(name: string) {
  const lib = load();
  const folder: LibraryFolder = { id: uid("fld"), name: name.trim(), lastModified: today(), published: false, documents: [] };
  save({ ...lib, folders: [folder, ...lib.folders] });
  logActivity("created", `Created folder “${folder.name}”`, `/admin/content?folder=${folder.id}`);
}
export function createDoc(name: string, folderId?: string): string {
  const lib = load();
  const doc: LibraryDoc = { id: uid("doc"), name: name.trim(), kind: "document", content: "", lastModified: today(), roles: ["field-agent"], published: false, toc: [] };
  if (folderId) {
    save({ ...lib, folders: lib.folders.map((f) => (f.id === folderId ? { ...f, documents: [doc, ...f.documents], lastModified: today() } : f)) });
  } else {
    save({ ...lib, topLevel: [doc, ...lib.topLevel] });
  }
  logActivity("created", `Created document “${doc.name}”`, `/admin/content/${doc.id}`);
  return doc.id;
}
export function renameItem(id: string, name: string) {
  const was = itemName(id);
  const lib = load();
  const n = name.trim();
  save({
    folders: lib.folders.map((f) =>
      f.id === id ? { ...f, name: n, lastModified: today() } : { ...f, documents: f.documents.map((d) => (d.id === id ? { ...d, name: n, lastModified: today() } : d)) }
    ),
    topLevel: lib.topLevel.map((d) => (d.id === id ? { ...d, name: n, lastModified: today() } : d)),
  });
  logActivity("edited", `Renamed “${was}” to “${n}”`, itemHref(id));
}
export function deleteItem(id: string) {
  const was = itemName(id);
  const lib = load();
  save({
    folders: lib.folders.filter((f) => f.id !== id).map((f) => ({ ...f, documents: f.documents.filter((d) => d.id !== id) })),
    topLevel: lib.topLevel.filter((d) => d.id !== id),
  });
  logActivity("deleted", `Deleted “${was}”`);
}
/** Toggle whether a document is live for learners. */
export function setDocPublished(id: string, published: boolean) {
  const name = itemName(id);
  const lib = load();
  const apply = (d: LibraryDoc): LibraryDoc => (d.id === id ? { ...d, published, lastModified: today() } : d);
  save({
    folders: lib.folders.map((f) => ({ ...f, documents: f.documents.map(apply) })),
    topLevel: lib.topLevel.map(apply),
  });
  logActivity("edited", `${published ? "Published" : "Unpublished"} document “${name}”`, `/admin/content/${id}`);
}
/** Toggle whether a folder is live for learners. */
export function setFolderPublished(id: string, published: boolean) {
  const lib = load();
  const name = lib.folders.find((f) => f.id === id)?.name ?? "folder";
  save({
    ...lib,
    folders: lib.folders.map((f) => (f.id === id ? { ...f, published, lastModified: today() } : f)),
  });
  logActivity("edited", `${published ? "Published" : "Unpublished"} folder “${name}”`, `/admin/content?folder=${id}`);
}
export function updateDoc(id: string, patch: { name?: string; roles?: Role[]; toc?: TocSection[] }) {
  const lib = load();
  const apply = (d: LibraryDoc): LibraryDoc => ({ ...d, ...patch, lastModified: today() });
  save({
    folders: lib.folders.map((f) => ({ ...f, documents: f.documents.map((d) => (d.id === id ? apply(d) : d)) })),
    topLevel: lib.topLevel.map((d) => (d.id === id ? apply(d) : d)),
  });
  logActivity("edited", `Updated document “${itemName(id)}”`, `/admin/content/${id}`);
}

/* ─── Learner reads: published + role-visible view of the overlay ───
   A doc is visible to a learner when it is published and either carries no role
   restriction or lists the learner's role. Seed docs set neither field, so they
   are visible to everyone — the learner sees the same content as before, now
   overlay-backed so admin edits reach them. */
function visibleToLearner(d: LibraryDoc, role: Role): boolean {
  return d.published !== false && (!d.roles || d.roles.includes(role));
}

/** The learner's library: published, role-visible docs; empty folders dropped. */
export function learnerLibrary(role: Role): Library {
  const lib = load();
  return {
    folders: lib.folders
      .filter((f) => f.published !== false)
      .map((f) => ({ ...f, documents: f.documents.filter((d) => visibleToLearner(d, role)) }))
      .filter((f) => f.documents.length > 0),
    topLevel: lib.topLevel.filter((d) => visibleToLearner(d, role)),
  };
}

/** A single document for the learner viewer — undefined if unpublished/hidden. */
export function getLearnerDoc(id: string, role: Role): { doc: LibraryDoc; folder?: LibraryFolder } | undefined {
  const lib = load();
  for (const f of lib.folders) {
    const doc = f.documents.find((d) => d.id === id);
    if (doc) return f.published !== false && visibleToLearner(doc, role) ? { doc, folder: f } : undefined;
  }
  const t = lib.topLevel.find((d) => d.id === id);
  return t && visibleToLearner(t, role) ? { doc: t } : undefined;
}

/** A folder for the learner, with its docs filtered to what they can see. */
export function getLearnerFolder(id: string, role: Role): LibraryFolder | undefined {
  const f = load().folders.find((x) => x.id === id);
  if (!f || f.published === false) return undefined;
  return { ...f, documents: f.documents.filter((d) => visibleToLearner(d, role)) };
}

/** Recent published docs for the dashboard recency feed / notifications. */
export function getLearnerRecent(role: Role, days = 14): LibraryDoc[] {
  const lib = load();
  const inPublishedFolders = lib.folders.filter((f) => f.published !== false).flatMap((f) => f.documents);
  return [...lib.topLevel, ...inPublishedFolders]
    .filter((d) => visibleToLearner(d, role) && isWithinDays(d.lastModified, days))
    .sort((a, b) => daysSince(a.lastModified) - daysSince(b.lastModified));
}

/* ─── Reactivity ─── */
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
export function useLibrary(): Library {
  return useSyncExternalStore(subscribe, load, () => SERVER_SEED);
}
/** Subscribe to the learner library so edits/publishes re-render the guard view. */
export function useLearnerLibrary(role: Role): Library {
  useSyncExternalStore(subscribe, load, () => SERVER_SEED);
  return learnerLibrary(role);
}
