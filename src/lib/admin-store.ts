"use client";

import { useSyncExternalStore } from "react";
import { STAFF, ROLE_LABEL, type StaffMember, type Role, type StaffStatus } from "./user-mock";
import { logActivity } from "./activity-log";

/**
 * Admin overlay store for the staff directory.
 *
 * It starts from the seeded STAFF list and overlays admin edits (invite, role
 * change, status change). Edits persist in localStorage so a demo survives a
 * reload. This whole store is the seam a real backend replaces — the People
 * screens call these functions, never storage directly.
 *
 * An invited user carries a demo PIN. verifyPin (auth-mock) accepts it, so the
 * existing /activate flow works for an invited email.
 */

const KEY = "cortex-admin-users";

type StoredUser = StaffMember & { pin?: string };

const listeners = new Set<() => void>();
let cache: StoredUser[] | null = null;
let publicCache: StaffMember[] = STAFF;

function rebuild(list: StoredUser[]) {
  cache = list;
  publicCache = list.map(({ pin: _pin, ...u }) => u);
}

function load(): StoredUser[] {
  if (cache) return cache;
  if (typeof window === "undefined") {
    rebuild(STAFF as StoredUser[]);
    return cache!;
  }
  try {
    const raw = localStorage.getItem(KEY);
    rebuild(raw ? (JSON.parse(raw) as StoredUser[]) : (STAFF as StoredUser[]));
  } catch {
    rebuild(STAFF as StoredUser[]);
  }
  return cache!;
}

function save(list: StoredUser[]) {
  rebuild(list);
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch { /* no-op */ }
  listeners.forEach((l) => l());
}

function snapshot(): StaffMember[] {
  load();
  return publicCache;
}

/* ─── Read seams ─── */
export function listUsers(): StaffMember[] {
  return snapshot();
}
export function getUser(id: string): StaffMember | undefined {
  const u = load().find((x) => x.id === id);
  if (!u) return undefined;
  const { pin: _pin, ...rest } = u;
  return rest;
}

/* ─── Write seams ─── */
export function updateUserRole(id: string, role: Role) {
  const name = load().find((u) => u.id === id)?.fullName ?? "user";
  save(load().map((u) => (u.id === id ? { ...u, role } : u)));
  logActivity("edited", `Changed ${name}'s role to ${ROLE_LABEL[role]}`, `/admin/people/${id}`);
}
export function setUserStatus(id: string, status: StaffStatus) {
  const name = load().find((u) => u.id === id)?.fullName ?? "user";
  save(load().map((u) => (u.id === id ? { ...u, status } : u)));
  logActivity("edited", status === "deactivated" ? `Deactivated ${name}'s account` : status === "active" ? `Reactivated ${name}'s account` : `Set ${name}'s account to ${status}`, `/admin/people/${id}`);
}

function genPin(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
function toInitials(name: string): string {
  return name.trim().split(/\s+/).map((w) => w[0] ?? "").slice(0, 2).join("").toUpperCase();
}
function nameFromEmail(email: string): string {
  return email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function inviteUser(input: { email: string; role: Role; fullName?: string }): { id: string; pin: string } {
  const list = load();
  const fullName = input.fullName?.trim() || nameFromEmail(input.email);
  const pin = genPin();
  const id = `u-inv-${list.length}-${input.email.split("@")[0].replace(/[^a-z0-9]/gi, "").toLowerCase()}`;
  const user: StoredUser = {
    id,
    fullName,
    initials: toInitials(fullName),
    email: input.email.trim(),
    role: input.role,
    status: "invited",
    memberSince: new Date().toISOString().slice(0, 10),
    certifications: 0,
    certs: [],
    requiredTotal: 0,
    optionalTotal: 0,
    shiftReady: false,
    pin,
  };
  save([user, ...list]);
  logActivity("invited", `Invited ${user.email} as ${ROLE_LABEL[input.role]}`, `/admin/people/${id}`);
  return { id, pin };
}

/**
 * The activation PIN for an invited user, so an admin can re-read it before the
 * account is activated. Seeded invites may lack one — generate and persist it on
 * first read. Call only from an event handler (it may write), never in render.
 */
export function getUserPin(id: string): string | undefined {
  const list = load();
  const u = list.find((x) => x.id === id);
  if (!u || u.status !== "invited") return undefined;
  if (!u.pin) {
    const pin = genPin();
    save(list.map((x) => (x.id === id ? { ...x, pin } : x)));
    return pin;
  }
  return u.pin;
}

/**
 * Resend an invite: rotates the PIN (the old one stops working) and returns
 * the new one so the admin can share it. A real backend emails it instead.
 */
export function regeneratePin(id: string): string | undefined {
  const list = load();
  const u = list.find((x) => x.id === id);
  if (!u || u.status !== "invited") return undefined;
  const pin = genPin();
  save(list.map((x) => (x.id === id ? { ...x, pin } : x)));
  logActivity("invited", `Resent the invite for ${u.email}`, `/admin/people/${id}`);
  return pin;
}

/** Used by auth-mock: does this email have a pending invite with this PIN? */
export function findInvite(email: string, pin: string): StoredUser | undefined {
  const e = email.trim().toLowerCase();
  return load().find((u) => u.status === "invited" && u.email.toLowerCase() === e && u.pin === pin);
}

/* ─── Reactivity ─── */
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
export function useAdminUsers(): StaffMember[] {
  return useSyncExternalStore(subscribe, snapshot, () => STAFF);
}
