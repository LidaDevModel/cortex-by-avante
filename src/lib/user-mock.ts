import { type ModuleCategory } from "./training-mock";

/**
 * The signed-in demo user — single source of truth for name, initials, and role.
 * VISION requires the active role to be visible near the avatar; every screen
 * that greets the user or shows identity reads from here.
 */
export const USER = {
  firstName: "Mike",
  fullName: "Mike Martinez",
  initials: "MM",
  email: "mike.martinez@avante.security",
  role: "Field Agent",
  /** Provisioned by Avante — the hire date shown on the internal profile. */
  memberSince: "2026-03-02",
} as const;

/**
 * Access roles. "field-agent" is the learner (the primary user). "admin" is the
 * super-user who manages people and content. "manager" is reserved for a later
 * analytics-only role — declared here so the type is ready, not yet built.
 */
export type Role = "field-agent" | "admin"; // reserved: "manager"

export const ROLE_LABEL: Record<Role, string> = {
  "field-agent": "Field Agent",
  admin: "Admin",
};

export type StaffStatus = "active" | "invited" | "deactivated";

/**
 * One certification a staff member holds — the same shape a learner earns
 * (module, category, exam score, issue date). Admins view these read-only on
 * the person-detail page; the score's tier (Ace at 100) derives in the UI.
 */
export type StaffCert = {
  module: string;
  category: ModuleCategory;
  /** Whether this was a required module (counts toward shift-readiness) or an
      optional one. Mirrors the module's `required` flag in training-mock. */
  required: boolean;
  /** Exam score, 0–100. A score of 100 earns the "ace" tier. */
  score: number;
  /** ISO issue date. */
  date: string;
};

/** A person in the Avante staff directory (admin People screens). */
export type StaffMember = {
  id: string;
  fullName: string;
  initials: string;
  email: string;
  role: Role;
  status: StaffStatus;
  memberSince: string;
  /** Count of certifications the person holds — DERIVED from `certs.length`
      (single source of truth, never hand-set). Kept as a field so the People
      list and admin Home read a summary without walking the array. */
  certifications: number;
  /** The certifications this person holds. A real backend replaces the seed. */
  certs: StaffCert[];
  /** How many required / optional modules are assigned to this person — the
      denominators for the "N of M done" progress. Done counts derive from
      `certs` (see `certProgress`). */
  requiredTotal: number;
  optionalTotal: number;
  /** True when every required module is certified — cleared for duty. DERIVED
      from the required progress (never hand-set), so it can't drift from the
      certifications list. */
  shiftReady: boolean;
  /** ISO date of last activity, or undefined for an invited/never-active user. */
  lastActive?: string;
};

/** Completion split for a staff member — how many required vs optional modules
 *  they've certified, against the totals assigned to them. */
export function certProgress(u: Pick<StaffMember, "certs" | "requiredTotal" | "optionalTotal">) {
  const requiredDone = u.certs.filter((c) => c.required).length;
  const optionalDone = u.certs.length - requiredDone;
  return { requiredDone, requiredTotal: u.requiredTotal, optionalDone, optionalTotal: u.optionalTotal };
}

/**
 * Seeded staff directory. Mike (the demo user) is one of these — his certs
 * mirror the modules he's certified in on his own profile, so the admin's view
 * and the learner's view agree. `certifications` and `shiftReady` are derived
 * below (never hand-set). A real backend replaces this list; the admin overlay
 * store edits it for the demo.
 */
const STAFF_SEED: Omit<StaffMember, "certifications" | "shiftReady">[] = [
  {
    id: "u-mike", fullName: "Mike Martinez", initials: "MM", email: "mike.martinez@avante.security", role: "field-agent", status: "active", memberSince: "2026-03-02", requiredTotal: 5, optionalTotal: 4, lastActive: "2026-07-20",
    certs: [
      { module: "Incident Response 1", category: "incidents", required: true, score: 92, date: "2026-06-22" },
      { module: "First Aid Awareness 2", category: "first-aid", required: true, score: 100, date: "2026-06-10" },
      { module: "Client Protocols 2", category: "clients", required: false, score: 88, date: "2026-05-28" },
      { module: "Radio Communications", category: "incidents", required: false, score: 95, date: "2026-05-20" },
      { module: "Workplace Safety Basics", category: "first-aid", required: false, score: 100, date: "2026-05-12" },
    ],
  },
  {
    id: "u-sara", fullName: "Sara Okafor", initials: "SO", email: "sara.okafor@avante.security", role: "admin", status: "active", memberSince: "2025-11-14", requiredTotal: 5, optionalTotal: 5, lastActive: "2026-07-21",
    certs: [
      { module: "Guard Duty Fundamentals", category: "clients", required: true, score: 96, date: "2026-07-10" },
      { module: "Client Protocols 1", category: "clients", required: true, score: 91, date: "2026-06-15" },
      { module: "Client Protocols 2", category: "clients", required: false, score: 100, date: "2026-05-30" },
      { module: "Incident Response 1", category: "incidents", required: true, score: 89, date: "2026-05-02" },
      { module: "Security Protocols 1", category: "incidents", required: true, score: 94, date: "2026-04-18" },
      { module: "Radio Communications", category: "incidents", required: false, score: 100, date: "2026-03-22" },
      { module: "Escalation Procedures 1", category: "escalations", required: true, score: 90, date: "2026-02-14" },
      { module: "First Aid Awareness 1", category: "first-aid", required: false, score: 87, date: "2026-01-20" },
      { module: "Workplace Safety Basics", category: "first-aid", required: false, score: 93, date: "2025-12-11" },
    ],
  },
  {
    id: "u-david", fullName: "David Chen", initials: "DC", email: "david.chen@avante.security", role: "field-agent", status: "active", memberSince: "2026-01-08", requiredTotal: 3, optionalTotal: 3, lastActive: "2026-07-19",
    certs: [
      { module: "Client Protocols 1", category: "clients", required: true, score: 90, date: "2026-06-30" },
      { module: "Guard Duty Fundamentals", category: "clients", required: true, score: 85, date: "2026-05-22" },
      { module: "First Aid Awareness 1", category: "first-aid", required: false, score: 100, date: "2026-04-08" },
      { module: "Incident Response 1", category: "incidents", required: true, score: 88, date: "2026-02-15" },
    ],
  },
  {
    id: "u-amara", fullName: "Amara Diallo", initials: "AD", email: "amara.diallo@avante.security", role: "field-agent", status: "active", memberSince: "2026-05-20", requiredTotal: 5, optionalTotal: 3, lastActive: "2026-07-18",
    certs: [
      { module: "First Aid Awareness 1", category: "first-aid", required: false, score: 92, date: "2026-07-02" },
      { module: "Workplace Safety Basics", category: "first-aid", required: false, score: 100, date: "2026-06-12" },
    ],
  },
  {
    id: "u-tom", fullName: "Tom Whitfield", initials: "TW", email: "tom.whitfield@avante.security", role: "field-agent", status: "invited", memberSince: "2026-07-19", requiredTotal: 0, optionalTotal: 0,
    certs: [],
  },
  {
    id: "u-lena", fullName: "Lena Novak", initials: "LN", email: "lena.novak@avante.security", role: "field-agent", status: "active", memberSince: "2025-09-02", requiredTotal: 5, optionalTotal: 4, lastActive: "2026-07-15",
    certs: [
      { module: "Escalation Procedures 1", category: "escalations", required: true, score: 100, date: "2026-05-12" },
      { module: "Emergency Procedures 1", category: "escalations", required: false, score: 94, date: "2026-04-20" },
      { module: "Incident Response 1", category: "incidents", required: true, score: 91, date: "2026-03-15" },
      { module: "Security Protocols 1", category: "incidents", required: true, score: 88, date: "2026-02-10" },
      { module: "Client Protocols 1", category: "clients", required: true, score: 96, date: "2026-01-18" },
      { module: "Client Protocols 2", category: "clients", required: false, score: 100, date: "2025-12-05" },
      { module: "First Aid Awareness 1", category: "first-aid", required: false, score: 90, date: "2025-11-14" },
      { module: "First Aid Awareness 2", category: "first-aid", required: true, score: 93, date: "2025-10-02" },
    ],
  },
  {
    id: "u-raj", fullName: "Raj Patel", initials: "RP", email: "raj.patel@avante.security", role: "field-agent", status: "deactivated", memberSince: "2025-06-11", requiredTotal: 5, optionalTotal: 3, lastActive: "2026-04-30",
    certs: [
      { module: "Guard Duty Fundamentals", category: "clients", required: true, score: 82, date: "2026-03-30" },
      { module: "Client Protocols 1", category: "clients", required: true, score: 88, date: "2026-02-12" },
      { module: "Incident Response 1", category: "incidents", required: true, score: 90, date: "2026-01-20" },
      { module: "First Aid Awareness 1", category: "first-aid", required: false, score: 100, date: "2025-12-08" },
      { module: "Workplace Safety Basics", category: "first-aid", required: false, score: 95, date: "2025-10-15" },
    ],
  },
];

/**
 * `certifications` derives from `certs.length`; `shiftReady` derives from the
 * required progress (all required modules certified) — both single sources of
 * truth so the count, the readiness badge, and the certifications list can
 * never disagree. `requiredTotal > 0` guards a not-yet-assigned invitee from
 * reading as ready (0 of 0).
 */
export const STAFF: StaffMember[] = STAFF_SEED.map((s) => {
  const { requiredDone, requiredTotal } = certProgress({ ...s });
  return { ...s, certifications: s.certs.length, shiftReady: requiredTotal > 0 && requiredDone === requiredTotal };
});
