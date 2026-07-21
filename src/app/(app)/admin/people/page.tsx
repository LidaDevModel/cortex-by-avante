"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, MoreHorizontal, KeyRound, Send, Ban, UserCheck, Eye } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { FilterSelect } from "@/components/ui/filter-select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell, type SortDir } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ExitConfirmDialog } from "@/components/ui/exit-confirm-dialog";
import { showToast } from "@/components/ui/toast";
import { useGlassHeader } from "@/hooks/use-glass-header";
import { useAdminUsers, setUserStatus, getUserPin } from "@/lib/admin-store";
import { ROLE_LABEL, type StaffMember } from "@/lib/user-mock";
import { InviteUserModal } from "@/components/admin/InviteUserModal";
import { StatusPill } from "@/components/admin/status-pill";

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
  const [deactivateTarget, setDeactivateTarget] = useState<StaffMember | null>(null);

  const [sortDir, setSortDir] = useState<SortDir>("asc");

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

          <div className="flex items-center gap-2 flex-wrap">
            <SearchInput value={query} onChange={setQuery} placeholder="Search name or email" className="w-full sm:w-[280px]" />
            <FilterSelect value={roleFilter} onChange={setRoleFilter} options={ROLE_FILTER} placeholder="All roles" />
            <FilterSelect value={statusFilter} onChange={setStatusFilter} options={STATUS_FILTER} placeholder="All statuses" />
          </div>

          {rows.length === 0 ? (
            <div className="rounded-[12px] p-10 text-center bg-surface-raised" style={{ border: "1px solid var(--border)" }}>
              <p className="text-[14px] leading-[20px] text-muted-foreground">No staff match these filters.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableHead className="flex-1" sortDir={sortDir} onSort={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}>Name</TableHead>
                <TableHead className="w-[120px]">Role</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[64px] text-right">Certs</TableHead>
                <TableHead className="w-[120px]">Last active</TableHead>
                <TableHead className="w-8"><span className="sr-only">Actions</span></TableHead>
              </TableHeader>
              <TableBody>
                {rows.map((u) => (
                  <TableRow key={u.id}>
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
                    <TableCell className="w-[120px] text-foreground">{ROLE_LABEL[u.role]}</TableCell>
                    <TableCell className="w-[120px]"><StatusPill status={u.status} /></TableCell>
                    <TableCell className="w-[64px] text-right tabular-nums">{u.certifications}</TableCell>
                    <TableCell className="w-[120px] text-muted-foreground">{formatDate(u.lastActive)}</TableCell>
                    <TableCell className="w-8">
                      <div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors duration-100" aria-label="Actions">
                              <MoreHorizontal size={16} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[180px]">
                            <DropdownMenuItem onSelect={() => router.push(`/admin/people/${u.id}`)}>
                              <Eye size={16} strokeWidth={1.5} /> Details
                            </DropdownMenuItem>
                            {u.status === "invited" && (
                              <>
                                <DropdownMenuItem onSelect={() => { const pin = getUserPin(u.id); showToast({ title: "Activation PIN", description: pin ? `${u.fullName}: ${pin}` : "No PIN available." }); }}>
                                  <KeyRound size={16} strokeWidth={1.5} /> Show activation PIN
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => showToast({ title: "Invitation resent", description: `A new PIN was issued for ${u.email}.` })}>
                                  <Send size={16} strokeWidth={1.5} /> Resend invite
                                </DropdownMenuItem>
                              </>
                            )}
                            {u.status === "active" && (
                              <DropdownMenuItem variant="destructive" onSelect={() => setDeactivateTarget(u)}>
                                <Ban size={16} strokeWidth={1.5} /> Deactivate
                              </DropdownMenuItem>
                            )}
                            {u.status === "deactivated" && (
                              <DropdownMenuItem onSelect={() => { setUserStatus(u.id, "active"); showToast({ title: "Account reactivated" }); }}>
                                <UserCheck size={16} strokeWidth={1.5} /> Reactivate
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </ScrollCanvas>

      {inviteOpen && <InviteUserModal onClose={() => setInviteOpen(false)} />}

      <ExitConfirmDialog
        open={!!deactivateTarget}
        onOpenChange={(o) => !o && setDeactivateTarget(null)}
        title="Deactivate account?"
        description={`${deactivateTarget?.fullName ?? "This person"} won't be able to sign in until reactivated.`}
        exitLabel="Deactivate"
        cancelLabel="Cancel"
        onExit={() => { if (deactivateTarget) { setUserStatus(deactivateTarget.id, "deactivated"); showToast({ title: "Account deactivated" }); } setDeactivateTarget(null); }}
      />
    </div>
  );
}
