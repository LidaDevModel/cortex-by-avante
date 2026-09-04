import { USER } from "./user-mock";
import { setPersona } from "./demo-persona";
import { setCurrentRole } from "./current-role";
import { findInvite } from "./admin-store";

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

const EMPTY_RECORD: AuthRecord = { activated: false, profile: {} };

function readRecord(): AuthRecord {
  if (typeof window === "undefined") return EMPTY_RECORD;
  try {
    const raw = localStorage.getItem(RECORD_KEY);
    // Merged over the defaults, not returned raw: a stored record written by an
    // older shape (or a partial write) can be missing `profile`, and every
    // caller of getAuthProfile() reads a field off it — `.avatarUrl` on
    // undefined took the whole app down with an unhandled TypeError, sidebar
    // included, on every route. The JSON.parse was already guarded; the shape
    // was not.
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AuthRecord> | null;
      if (parsed && typeof parsed === "object") {
        return { ...EMPTY_RECORD, ...parsed, profile: parsed.profile ?? {} };
      }
    }
  } catch {}
  return EMPTY_RECORD;
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

/* ─── Expiry ───────────────────────────────────────────────────────────────
   VISION's phrasing table has always carried a row for this — "Your session
   has ended" / "Sign in again to continue." — and nothing implemented it.
   `signedInAt` was written on every sign-in and never read once, so the
   session simply never ended; `signOut` was the only thing that cleared it.

   It matters most in this product's real context: a handset passed between
   shifts. Without expiry the next guard inherits the previous guard's
   session, their progress, their certifications — and if that person was an
   admin, Cortex Manage.

   A client cannot ENFORCE a session lifetime; a real backend must. This makes
   the designed state real and testable, and is the seam that backend
   replaces. Twelve hours covers the longest single shift without ending a
   session in the middle of one. */
export const SESSION_HOURS = 12;

/** True when the stored session is older than the window. */
export function isSessionExpired(): boolean {
  const s = getSession();
  if (!s) return false;
  const started = new Date(s.signedInAt).getTime();
  if (Number.isNaN(started)) return true;
  return Date.now() - started > SESSION_HOURS * 3_600_000;
}

export function isSignedIn(): boolean {
  // An expired session is not a session. Clearing it here means every caller
  // — the gate, the sign-in redirect, the shell — agrees without each having
  // to remember to ask.
  if (isSessionExpired()) {
    signOut();
    return false;
  }
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
  // For the demo, signing in lands on the established, cleared ADMIN — the
  // returning persona (all required certs complete) + the admin access role, so
  // Cortex Manage is unlocked out of the box. The DialKit toggle still switches
  // to the field-agent view afterward.
  setPersona("returning");
  setCurrentRole("admin");
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
  setCurrentRole("admin");
  startSession(PROVISIONED.email);
  return { ok: true };
}

/* ─── Activation (first run) ─── */

export type ActivateResult = { ok: true } | { ok: false; reason: "invalid" | "already-activated" };

export function verifyPin(email: string, pin: string): ActivateResult {
  // Provisioned demo account (Mike).
  if (email.trim().toLowerCase() === PROVISIONED.email.toLowerCase() && pin === PROVISIONED.pin) {
    if (readRecord().activated) return { ok: false, reason: "already-activated" };
    return { ok: true };
  }
  // A user invited through the admin People screen carries a per-invite PIN.
  if (findInvite(email, pin)) return { ok: true };
  return { ok: false, reason: "invalid" };
}

/** Finishes activation: stores the personal password and signs the user in. */
export function completeActivation(password: string) {
  // Sign-up → a brand-new guard: blank slate + field-agent role, so the app
  // opens on the not-cleared onboarding state (the only place it should show,
  // for the demo). The DialKit toggle can still switch views afterward.
  setPersona("new");
  setCurrentRole("field-agent");
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
