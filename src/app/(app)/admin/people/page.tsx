"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { UserPlus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { FilterSelect } from "@/components/ui/filter-select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DataTable, DataCards, NotApplicable, defineColumns, sortRows, type SortState } from "@/components/ui/data-list";
import { SortButton } from "@/components/ui/sort-button";
import { Pagination } from "@/components/ui/pagination";
import { useGlassHeader } from "@/hooks/use-glass-header";
import { useRowStagger } from "@/hooks/use-entrance";
import { useAdminUsers } from "@/lib/admin-store";
import type { StaffMember } from "@/lib/user-mock";
import { ROLE_LABEL } from "@/lib/user-mock";
import { InviteUserModal } from "@/components/admin/InviteUserModal";
import { StatusPill } from "@/components/admin/status-pill";
import { ClearedBadge, NotClearedBadge } from "@/components/dashboard/ClearedBadge";
import { useManageLock, ManageLockedPanel } from "@/components/admin/manage-lock";
import { SkeletonList } from "@/components/ui/skeleton-blocks";
import { StatePanel } from "@/components/ui/state-panel";
import { useInitialLoad } from "@/hooks/use-initial-load";
import { PageTitle } from "@/components/ui/page-title";

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

/**
 * The People list, defined ONCE. Both the desktop table and the mobile cards
 * render from this — so the card labels are these labels, sorting works at
 * both widths, and a column cannot quietly disappear on a phone.
 *
 * `defineColumns` asserts the one structural rule (exactly one identity
 * column) at module load, so a bad edit throws on import rather than shipping.
 */
const COLUMNS = defineColumns<StaffMember>([
  {
    key: "name",
    label: "Name",
    // No width: the identity column absorbs the remaining space, capped.
    sortValue: (u) => u.fullName,
    mobile: "identity",
    render: (u) => (
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="h-8 w-8 rounded-full shrink-0">
          <AvatarFallback className="rounded-full bg-secondary text-primary font-semibold type-caption">
            {u.initials}
          </AvatarFallback>
        </Avatar>
        {/* Email is a SUBTITLE of identity, not a column of its own — it would
            otherwise gain an "Email" label and a sort control it never had. */}
        <div className="flex flex-col min-w-0">
          <span className="type-meta font-medium text-foreground truncate">{u.fullName}</span>
          <span className="type-caption text-muted-foreground truncate">{u.email}</span>
        </div>
      </div>
    ),
  },
  {
    key: "role",
    label: "Role",
    width: "narrow",
    mobile: "pair",
    render: (u) => <span className="text-foreground">{ROLE_LABEL[u.role]}</span>,
  },
  {
    key: "status",
    label: "Status",
    width: "narrow",
    mobile: "trailing",
    render: (u) => <StatusPill status={u.status} />,
  },
  {
    key: "shiftReady",
    label: "Shift-ready",
    width: "wide",
    /* A PAIR on the card, not a trailing badge. Stacked with the status pill
       it took most of a 390px row and squeezed the email down to
       "amara.diallo@avante.s…". As a labelled pair it also stops being a bare
       badge whose meaning you infer. */
    mobile: "pair",
    render: (u) =>
      u.role === "field-agent" && u.status === "active" ? (
        u.shiftReady ? <ClearedBadge /> : <NotClearedBadge />
      ) : (
        <NotApplicable reason="Shift-ready does not apply to this person" />
      ),
    // The desktop column keeps its em dash — a column with a hole in it reads
    // as a bug. At a card's trailing edge an em-dash badge is just noise, so
    // the card shows nothing for anyone who cannot be shift-ready.
    mobileRender: (u) =>
      u.role === "field-agent" && u.status === "active"
        ? u.shiftReady
          ? <ClearedBadge />
          : <NotClearedBadge />
        : null,
  },
  {
    key: "lastActive",
    label: "Last active",
    width: "date",
    // Owner's call: this is the column people sort by.
    sortValue: (u) => u.lastActive,
    sortKind: "date",
    mobile: "pair",
    render: (u) =>
      u.lastActive ? (
        <span className="text-muted-foreground">{formatDate(u.lastActive)}</span>
      ) : (
        // An invited person who has never signed in. Same treatment as
        // Shift-ready: the dash is decoration, the sentence is the content.
        <NotApplicable reason="Never signed in" />
      ),
  },
]);

export default function AdminPeoplePage() {
  const { headerClassName, onScroll } = useGlassHeader();
  const loading = useInitialLoad("admin-people");
  const users = useAdminUsers();
  const { locked } = useManageLock();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [page, setPage] = useState(1);
  const rowStyle = useRowStagger("admin-people");

  // Deep link from the Home quick actions: /admin/people?invite=1 opens the modal.
  const inviteParam = useSearchParams().get("invite");
  useEffect(() => { if (inviteParam === "1") setInviteOpen(true); }, [inviteParam]);

  // One sort state for both renderings. It was `sortDir` alone, with the
  // column implied, which is why sorting could not be offered anywhere but
  // the header row.
  const [sort, setSort] = useState<SortState>({ key: "name", dir: "asc" });
  function handleSort(key: string) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
    setPage(1);
  }

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
    // The shared comparator, so the null policy (empty sorts last in BOTH
    // directions) is stated once for every list.
    return sortRows(list, COLUMNS, sort);
  }, [users, roleFilter, statusFilter, q, sort]);

  const totalPages = Math.ceil(rows.length / PER_PAGE);
  const safePage = Math.min(page, totalPages || 1);
  const paginated = rows.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  return (
    <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
      <PageHeader crumbs={[{ label: "People" }]} className={headerClassName} />

      <ScrollCanvas onScroll={onScroll}>
        <div className="container-wide pt-8 pb-12 flex flex-col gap-6 min-h-full">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <PageTitle
              title="People"
              description="Everyone at Avante, their role, and whether they&apos;re cleared for duty."
            />
            {!locked && (
            <Button size="cta" onClick={() => setInviteOpen(true)}>
              <UserPlus size={16} strokeWidth={1.5} /> Invite user
            </Button>
            )}
          </div>

          {/* Locked: the screen keeps its identity above, and its working
              surface becomes one statement plus the one useful action. */}
          {locked ? (
            <ManageLockedPanel task="managing people" />
          ) : loading ? (
            /* First load of the session only — a real backend's latency drives
               this later. Mirrors the toolbar + rows + pagination shape. */
            <SkeletonList filters={2} />
          ) : (
            <>

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <SearchInput value={query} onChange={resetPage(setQuery)} placeholder="Search name or email" className="w-full sm:w-[280px]" />
            <div className="flex items-center gap-2 flex-wrap">
              <FilterSelect value={roleFilter} onChange={resetPage(setRoleFilter)} options={ROLE_FILTER} placeholder="All roles" />
              <FilterSelect value={statusFilter} onChange={resetPage(setStatusFilter)} options={STATUS_FILTER} placeholder="All statuses" />
              {/* Sorting, where there is no header row to click. Reads the
                  same definition, so it can never offer a different set. */}
              <SortButton
                columns={COLUMNS}
                sort={sort}
                onChange={(next) => { setSort(next); setPage(1); }}
                className="md:hidden"
              />
            </div>
          </div>

          {/* The shared centred panel. These five lists each had their own
              bordered well at 14/20 — the sixth, seventh and eighth variants
              of a state the rest of the product already renders one way. */}

          {rows.length === 0 ? (
            <StatePanel description="No staff match these filters." />
          ) : (
            <>
              {/* One definition, two renderings: a real <table> here, a
                  <ul> of records below. */}
              <DataTable
                className="hidden md:block"
                rows={paginated}
                columns={COLUMNS}
                rowKey={(u) => u.id}
                rowHref={(u) => `/admin/people/${u.id}`}
                sort={sort}
                onSort={handleSort}
                rowStyle={rowStyle}
              />
              <DataCards
                className="md:hidden"
                label="People"
                rows={paginated}
                columns={COLUMNS}
                rowKey={(u) => u.id}
                rowHref={(u) => `/admin/people/${u.id}`}
                rowStyle={rowStyle}
              />
            </>
          )}

          <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
            </>
          )}
        </div>
      </ScrollCanvas>

      {inviteOpen && <InviteUserModal onClose={() => setInviteOpen(false)} />}
    </div>
  );
}
