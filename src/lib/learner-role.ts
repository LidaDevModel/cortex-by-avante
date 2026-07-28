import type { Role } from "@/lib/user-mock";

/**
 * The role whose LEARNING a user sees.
 *
 * The demo's admin is a guard who also holds admin access, so they learn as a
 * field agent — the admin access-role carries no training or library content of
 * its own. Every learner read (modules, library, recency, certifications) routes
 * the role through here so an admin's learner surfaces show the field-agent
 * track instead of an empty admin-role set. Access and nav still key off the
 * real role (that's what gates Cortex Manage); only the learner *content* is
 * remapped.
 */
export function toLearnerRole(role: Role): Role {
  return role === "admin" ? "field-agent" : role;
}
