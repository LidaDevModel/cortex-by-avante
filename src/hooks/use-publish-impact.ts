"use client";

import { useMemo } from "react";
import { listUsers, useAdminUsers } from "@/lib/admin-store";
import { ROLE_LABEL, type Role } from "@/lib/user-mock";

/**
 * Who a required module's publication actually lands on.
 *
 * Publishing required training assigns it to every guard in its roles, each of
 * whom then has a deadline to certify or lose clearance (D11). This counts
 * them, so the confirm can state the size of the action instead of leaving the
 * admin to guess.
 */
export function usePublishImpact(roles: Role[] | undefined) {
  // Subscribe so a newly invited person is counted.
  useAdminUsers();

  return useMemo(() => {
    const scope = roles && roles.length ? roles : (["field-agent", "admin"] as Role[]);
    // Only ACTIVE staff are affected — an invited person who has never
    // activated has no clearance to lose.
    const people = listUsers().filter((u) => u.status === "active" && scope.includes(u.role));
    return {
      affected: people.length,
      clearedNow: people.filter((u) => u.shiftReady).length,
      roleLabel: scope.map((r) => ROLE_LABEL[r]).join(" and "),
    };
  }, [roles]);
}
