"use client";

import { useSyncExternalStore } from "react";
import { FOLDERS, TOP_LEVEL_DOCS, type LibraryFolder, type LibraryDoc, type TocSection } from "./library-mock";
import type { Role } from "./user-mock";
import { logActivity } from "./activity-log";

/**
 * Admin content overlay for the library (authoring). It starts from the seeded
 * library and overlays admin edits — new folders/documents, renames, deletes,
 * and section edits. Persists to localStorage so a demo survives a reload.
 *
 * Scope note: this drives the ADMIN screens. The learner library still reads the
 * seed directly. Wiring the learner getters to read this overlay (so edits show
 * up for guards and in the recency feed) is the next step — the same backend
 * seam, done later.
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

export function createFolder(name: string) {
  const lib = load();
  const folder: LibraryFolder = { id: uid("fld"), name: name.trim(), lastModified: today(), documents: [] };
  save({ ...lib, folders: [folder, ...lib.folders] });
  logActivity(`Created folder “${folder.name}”`);
}
export function createDoc(name: string, folderId?: string): string {
  const lib = load();
  const doc: LibraryDoc = { id: uid("doc"), name: name.trim(), kind: "document", content: "", lastModified: today(), roles: ["field-agent"], published: false, toc: [] };
  if (folderId) {
    save({ ...lib, folders: lib.folders.map((f) => (f.id === folderId ? { ...f, documents: [doc, ...f.documents], lastModified: today() } : f)) });
  } else {
    save({ ...lib, topLevel: [doc, ...lib.topLevel] });
  }
  logActivity(`Created document “${doc.name}”`);
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
  logActivity(`Renamed “${was}” to “${n}”`);
}
export function deleteItem(id: string) {
  const was = itemName(id);
  const lib = load();
  save({
    folders: lib.folders.filter((f) => f.id !== id).map((f) => ({ ...f, documents: f.documents.filter((d) => d.id !== id) })),
    topLevel: lib.topLevel.filter((d) => d.id !== id),
  });
  logActivity(`Deleted “${was}”`);
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
  logActivity(`${published ? "Published" : "Unpublished"} document “${name}”`);
}
export function updateDoc(id: string, patch: { name?: string; roles?: Role[]; toc?: TocSection[] }) {
  const lib = load();
  const apply = (d: LibraryDoc): LibraryDoc => ({ ...d, ...patch, lastModified: today() });
  save({
    folders: lib.folders.map((f) => ({ ...f, documents: f.documents.map((d) => (d.id === id ? apply(d) : d)) })),
    topLevel: lib.topLevel.map((d) => (d.id === id ? apply(d) : d)),
  });
  logActivity(`Updated document “${itemName(id)}”`);
}

/* ─── Reactivity ─── */
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
export function useLibrary(): Library {
  return useSyncExternalStore(subscribe, load, () => SERVER_SEED);
}
