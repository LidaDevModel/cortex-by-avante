"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserPlus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { FilterSelect } from "@/components/ui/filter-select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell, type SortDir } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { useGlassHeader } from "@/hooks/use-glass-header";
import { useRowStagger } from "@/hooks/use-entrance";
import { useAdminUsers } from "@/lib/admin-store";
import { ROLE_LABEL } from "@/lib/user-mock";
import { InviteUserModal } from "@/components/admin/InviteUserModal";
import { StatusPill } from "@/components/admin/status-pill";

const PER_PAGE = 8;

const ROLE_FILTER = [
  { value: "field-agent", label: "Field Agent" },
  { value: "admin", label: "Admin" },
];
const STATUS_FILTER = [
  { value: "active", label: "Active" },
  { value: "invited", label: "Invited" },
  { value: "deactivated", label: "Deactivated" },
];

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminPeoplePage() {
  const { headerClassName, onScroll } = useGlassHeader();
  const router = useRouter();
  const users = useAdminUsers();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [page, setPage] = useState(1);
  const rowStyle = useRowStagger("admin-people");

  // Deep link from the Home quick actions: /admin/people?invite=1 opens the modal.
  const inviteParam = useSearchParams().get("invite");
  useEffect(() => { if (inviteParam === "1") setInviteOpen(true); }, [inviteParam]);

  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Any filter/search/sort change resets to the first page so results stay in view.
  function resetPage<T>(set: (v: T) => void) {
    return (v: T) => { set(v); setPage(1); };
  }

  const q = query.trim().toLowerCase();
  const rows = useMemo(() => {
    const list = users.filter((u) => {
      if (roleFilter && u.role !== roleFilter) return false;
      if (statusFilter && u.status !== statusFilter) return false;
      if (q && !u.fullName.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
      return true;
    });
    const mul = sortDir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => mul * a.fullName.localeCompare(b.fullName));
  }, [users, roleFilter, statusFilter, q, sortDir]);

  const totalPages = Math.ceil(rows.length / PER_PAGE);
  const safePage = Math.min(page, totalPages || 1);
  const paginated = rows.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  return (
    <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
      <PageHeader crumbs={[{ label: "Admin", href: "/admin" }, { label: "People" }]} className={headerClassName} />

      <ScrollCanvas onScroll={onScroll}>
        <div className="max-w-[920px] mx-auto px-4 sm:px-8 pt-8 pb-12 flex flex-col gap-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h1 className="text-[22px] leading-[30px] sm:text-[28px] sm:leading-[36px] font-bold text-foreground">People</h1>
            <Button size="cta" onClick={() => setInviteOpen(true)}>
              <UserPlus size={16} strokeWidth={1.5} /> Invite user
            </Button>
          </div>

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <SearchInput value={query} onChange={resetPage(setQuery)} placeholder="Search name or email" className="w-full sm:w-[280px]" />
            <div className="flex items-center gap-2 flex-wrap">
              <FilterSelect value={roleFilter} onChange={resetPage(setRoleFilter)} options={ROLE_FILTER} placeholder="All roles" />
              <FilterSelect value={statusFilter} onChange={resetPage(setStatusFilter)} options={STATUS_FILTER} placeholder="All statuses" />
            </div>
          </div>

          {rows.length === 0 ? (
            <div className="rounded-[12px] p-10 text-center bg-surface-raised" style={{ border: "1px solid var(--border)" }}>
              <p className="text-[14px] leading-[20px] text-muted-foreground">No staff match these filters.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableHead className="flex-1" sortDir={sortDir} onSort={() => { setSortDir((d) => (d === "asc" ? "desc" : "asc")); setPage(1); }}>Name</TableHead>
                <TableHead className="w-[104px]">Role</TableHead>
                <TableHead className="w-[104px]">Status</TableHead>
                <TableHead className="w-[88px]">Certs</TableHead>
                <TableHead className="w-[116px]">Last active</TableHead>
              </TableHeader>
              <TableBody>
                {paginated.map((u, i) => (
                  <TableRow key={u.id} onClick={() => router.push(`/admin/people/${u.id}`)} style={rowStyle(i)}>
                    <TableCell className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-8 w-8 rounded-full shrink-0">
                          <AvatarFallback className="rounded-full bg-secondary text-primary font-semibold text-[12px]">{u.initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[14px] leading-[18px] font-medium text-foreground truncate">{u.fullName}</span>
                          <span className="text-[12px] leading-[16px] text-muted-foreground truncate">{u.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="w-[104px] text-foreground">{ROLE_LABEL[u.role]}</TableCell>
                    <TableCell className="w-[104px]"><StatusPill status={u.status} /></TableCell>
                    <TableCell className="w-[88px] tabular-nums">{u.certifications}</TableCell>
                    <TableCell className="w-[116px] text-muted-foreground">{formatDate(u.lastActive)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
        </div>
      </ScrollCanvas>

      {inviteOpen && <InviteUserModal onClose={() => setInviteOpen(false)} />}
    </div>
  );
}
