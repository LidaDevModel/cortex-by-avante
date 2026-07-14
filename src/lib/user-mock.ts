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
