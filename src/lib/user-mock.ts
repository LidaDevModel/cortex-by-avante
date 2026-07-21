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

/** A person in the Avante staff directory (admin People screens). */
export type StaffMember = {
  id: string;
  fullName: string;
  initials: string;
  email: string;
  role: Role;
  status: StaffStatus;
  memberSince: string;
  /** Count of certifications the person holds (summary for the People list). */
  certifications: number;
  /** ISO date of last activity, or undefined for an invited/never-active user. */
  lastActive?: string;
};

/**
 * Seeded staff directory. Mike (the demo user) is one of these. A real backend
 * replaces this list; the admin overlay store edits it for the demo.
 */
export const STAFF: StaffMember[] = [
  { id: "u-mike", fullName: "Mike Martinez", initials: "MM", email: "mike.martinez@avante.security", role: "field-agent", status: "active", memberSince: "2026-03-02", certifications: 6, lastActive: "2026-07-20" },
  { id: "u-sara", fullName: "Sara Okafor", initials: "SO", email: "sara.okafor@avante.security", role: "admin", status: "active", memberSince: "2025-11-14", certifications: 9, lastActive: "2026-07-21" },
  { id: "u-david", fullName: "David Chen", initials: "DC", email: "david.chen@avante.security", role: "field-agent", status: "active", memberSince: "2026-01-08", certifications: 4, lastActive: "2026-07-19" },
  { id: "u-amara", fullName: "Amara Diallo", initials: "AD", email: "amara.diallo@avante.security", role: "field-agent", status: "active", memberSince: "2026-05-20", certifications: 2, lastActive: "2026-07-18" },
  { id: "u-tom", fullName: "Tom Whitfield", initials: "TW", email: "tom.whitfield@avante.security", role: "field-agent", status: "invited", memberSince: "2026-07-19", certifications: 0 },
  { id: "u-lena", fullName: "Lena Novak", initials: "LN", email: "lena.novak@avante.security", role: "field-agent", status: "active", memberSince: "2025-09-02", certifications: 8, lastActive: "2026-07-15" },
  { id: "u-raj", fullName: "Raj Patel", initials: "RP", email: "raj.patel@avante.security", role: "field-agent", status: "deactivated", memberSince: "2025-06-11", certifications: 5, lastActive: "2026-04-30" },
];
