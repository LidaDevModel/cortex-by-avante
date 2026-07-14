import { USER } from "./user-mock";
import { setPersona } from "./demo-persona";

/**
 * Mock auth for the demo — one Avante-provisioned account (Mike), activated
 * with an org-issued one-time PIN, then secured with a personal password.
 * Session and credentials persist in localStorage; a real backend replaces
 * this module wholesale (the exported functions are the seam).
 *
 * Demo credentials: email from USER (mike.martinez@avante.security),
 * activation PIN 482913. The personal password is whatever the user sets
 * during activation.
 */

export type AuthProfile = {
  /** Data/object URL in the mock — a real backend stores an upload. */
  avatarUrl?: string;
  /** Short bio shown on the internal profile (~160 chars). */
  description?: string;
};

type AuthRecord = {
  activated: boolean;
  password?: string;
  activatedAt?: string;
  profile: AuthProfile;
};

export type Session = { email: string; signedInAt: string };

const PROVISIONED = { email: USER.email, pin: "482913" } as const;

const RECORD_KEY = "cortex-auth-record";
const SESSION_KEY = "cortex-session";
const LAST_EMAIL_KEY = "cortex-last-email";

function readRecord(): AuthRecord {
  if (typeof window === "undefined") return { activated: false, profile: {} };
  try {
    const raw = localStorage.getItem(RECORD_KEY);
    if (raw) return JSON.parse(raw) as AuthRecord;
  } catch {}
  return { activated: false, profile: {} };
}

function writeRecord(record: AuthRecord) {
  try {
    localStorage.setItem(RECORD_KEY, JSON.stringify(record));
  } catch {}
}

/* ─── Session ─── */

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function isSignedIn(): boolean {
  return getSession() !== null;
}

function startSession(email: string) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email, signedInAt: new Date().toISOString() } satisfies Session));
    localStorage.setItem(LAST_EMAIL_KEY, email);
  } catch {}
}

export function signOut() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}

/** Last email that signed in on this device — prefilled on the sign-in form. */
export function getLastEmail(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(LAST_EMAIL_KEY) ?? "";
  } catch {
    return "";
  }
}

/* ─── Sign in (returning users) ─── */

/** Presentation bypass: the sign-in screen goes straight to the app without
    validating (or requiring) credentials, so the flow can be demoed with one
    click. `signIn` below stays as the real-validation seam for later. */
export function demoSignIn() {
  // Sign-in → Mike's lived-in account (progress, certifications, history).
  setPersona("returning");
  startSession(PROVISIONED.email);
}

export function signIn(email: string, password: string): { ok: true } | { ok: false } {
  const record = readRecord();
  const match =
    record.activated &&
    email.trim().toLowerCase() === PROVISIONED.email.toLowerCase() &&
    password === record.password;
  if (!match) return { ok: false };
  setPersona("returning");
  startSession(PROVISIONED.email);
  return { ok: true };
}

/* ─── Activation (first run) ─── */

export type ActivateResult = { ok: true } | { ok: false; reason: "invalid" | "already-activated" };

export function verifyPin(email: string, pin: string): ActivateResult {
  const emailOk = email.trim().toLowerCase() === PROVISIONED.email.toLowerCase();
  if (!emailOk || pin !== PROVISIONED.pin) return { ok: false, reason: "invalid" };
  if (readRecord().activated) return { ok: false, reason: "already-activated" };
  return { ok: true };
}

/** Finishes activation: stores the personal password and signs the user in. */
export function completeActivation(password: string) {
  // Sign-up → a brand-new guard: the app opens on a blank slate.
  setPersona("new");
  writeRecord({ ...readRecord(), activated: true, password, activatedAt: new Date().toISOString() });
  startSession(PROVISIONED.email);
}

/* ─── Profile (mutable half; name/email/role stay provisioned in USER) ─── */

export function getAuthProfile(): AuthProfile {
  return readRecord().profile;
}

export function saveAuthProfile(profile: AuthProfile) {
  writeRecord({ ...readRecord(), profile });
}
