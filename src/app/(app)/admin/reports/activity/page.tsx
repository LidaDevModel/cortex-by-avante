"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { SearchInput } from "@/components/ui/search-input";
import { FilterSelect } from "@/components/ui/filter-select";
import { DataTable, DataCards, defineColumns, type Column } from "@/components/ui/data-list";
import { Pagination } from "@/components/ui/pagination";
import { withReturn } from "@/lib/admin-nav";
import { useGlassHeader } from "@/hooks/use-glass-header";
import { useRowStagger } from "@/hooks/use-entrance";
import { useActivity, ACTIVITY_KIND_OPTIONS } from "@/lib/activity-log";
import { useManageLock, ManageLockedPanel } from "@/components/admin/manage-lock";
import { SkeletonList } from "@/components/ui/skeleton-blocks";
import { StatePanel } from "@/components/ui/state-panel";
import { useInitialLoad } from "@/hooks/use-initial-load";

const SELF = "/admin/reports/activity";

const PER_PAGE = 8;

function formatWhen(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/**
 * The activity log. Two things make it the odd one out, and both are handled
 * by the shape rather than around it:
 *
 *  - NO SORTABLE COLUMN. The log is chronological and that is the only order
 *    it makes sense in, so no column carries a `sortValue` and `SortButton`
 *    renders nothing.
 *  - ONLY SOME ROWS LEAD SOMEWHERE. An entry has an `href` when the thing it
 *    describes still exists. `rowHref` returns `undefined` for the rest, so
 *    those rows are not links and do not announce as links. The arrow that
 *    marks an entry as openable sits INSIDE the action cell, next to what it
 *    describes, rather than in a column of its own with no data and no label.
 */
type ActivityRow = { id: string; action: string; actor: string; ts: string; href?: string };

const COLUMNS: Column<ActivityRow>[] = defineColumns<ActivityRow>([
  {
    key: "action",
    label: "Action",
    mobile: "identity",
    render: (e) => <span className="block truncate">{e.action}</span>,
  },
  {
    key: "actor",
    label: "Admin",
    width: "wide",
    mobile: "pair",
    render: (e) => <span className="block truncate text-muted-foreground">{e.actor}</span>,
  },
  {
    key: "ts",
    label: "When",
    width: "date",
    mobile: "pair",
    render: (e) => <span className="text-muted-foreground tabular-nums">{formatWhen(e.ts)}</span>,
  },
  {
    /* The "this entry opens something" arrow, in the LAST cell — where
       Library's and Modules' row control sits. It was inside the action cell,
       which made Activity the only list with its control on the left. */
    key: "opens",
    label: "Opens",
    headerHidden: true,
    width: "icon",
    mobile: "trailing",
    render: (e) =>
      e.href ? (
        <span className="flex justify-end">
          <ArrowUpRight size={16} strokeWidth={1.5} className="text-muted-foreground" aria-hidden />
        </span>
      ) : (
        // Nothing, not a dash: the row simply does not open, and the absence
        // of the arrow beside its neighbours is the whole signal.
        null
      ),
  },
]);

export default function AdminActivityPage() {
  const { headerClassName, onScroll } = useGlassHeader();
  const loading = useInitialLoad("admin-activity");
  const all = useActivity();
  const { locked } = useManageLock();

  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState("");
  const [actorFilter, setActorFilter] = useState("");
  const [page, setPage] = useState(1);
  const rowStyle = useRowStagger("admin-activity");

  // Admin filter options come from the log itself — whoever appears in it.
  const actorOptions = useMemo(
    () => [...new Set(all.map((e) => e.actor))].sort().map((a) => ({ value: a, label: a })),
    [all]
  );

  const q = query.trim().toLowerCase();
  const entries = useMemo(() => {
    const list = all.filter((e) => {
      if (kindFilter && e.kind !== kindFilter) return false;
      if (actorFilter && e.actor !== actorFilter) return false;
      if (q && !e.action.toLowerCase().includes(q)) return false;
      return true;
    });
    return [...list].sort((a, b) => (a.ts > b.ts ? -1 : 1));
  }, [all, q, kindFilter, actorFilter]);

  const totalPages = Math.ceil(entries.length / PER_PAGE);
  const safePage = Math.min(page, totalPages || 1);
  const paginated = entries.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  // Any filter/search change resets to the first page so results stay in view.
  function resetPage<T>(set: (v: T) => void) {
    return (v: T) => { set(v); setPage(1); };
  }

  return (
    <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
      <PageHeader crumbs={[{ label: "Activity log" }]} className={headerClassName} />

      <ScrollCanvas onScroll={onScroll}>
        <div className="container-wide pt-8 pb-12 flex flex-col gap-6 min-h-full">
          <div className="flex flex-col gap-1">
            <h1 className="type-h1 font-bold text-foreground">Activity log</h1>
            <p className="type-label text-muted-foreground">Who did what across content, people, and flagged responses.</p>
          </div>

          {/* Locked: the screen keeps its identity above, and its working
              surface becomes one statement plus the one useful action. */}
          {locked ? (
            <ManageLockedPanel task="reviewing the activity log" />
          ) : loading ? (
            /* First load of the session only — a real backend's latency drives
               this later. Mirrors the toolbar + rows + pagination shape. */
            <SkeletonList filters={3} />
          ) : (
            <>

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <SearchInput value={query} onChange={resetPage(setQuery)} placeholder="Search actions" className="w-full sm:w-[280px]" />
            <div className="flex items-center gap-2 flex-wrap">
              <FilterSelect value={kindFilter} onChange={resetPage(setKindFilter)} options={ACTIVITY_KIND_OPTIONS} placeholder="All actions" />
              <FilterSelect value={actorFilter} onChange={resetPage(setActorFilter)} options={actorOptions} placeholder="All admins" />
            </div>
          </div>

          {/* The shared centred panel. These five lists each had their own
              bordered well at 14/20 — the sixth, seventh and eighth variants
              of a state the rest of the product already renders one way. */}

          {entries.length === 0 ? (
            <StatePanel description={q || kindFilter || actorFilter ? "No actions match these filters." : "No activity data yet. Actions across content, people, and flagged responses will appear here."} />
          ) : (
            <>
              <DataTable
                className="hidden md:block"
                rows={paginated}
                columns={COLUMNS}
                rowKey={(e) => e.id}
                rowHref={(e) => (e.href ? withReturn(e.href, SELF) : undefined)}
                rowStyle={rowStyle}
              />
              <DataCards
                className="md:hidden"
                label="Activity log"
                rows={paginated}
                columns={COLUMNS}
                rowKey={(e) => e.id}
                rowHref={(e) => (e.href ? withReturn(e.href, SELF) : undefined)}
                rowStyle={rowStyle}
              />
            </>
          )}

          <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
            </>
          )}
        </div>
      </ScrollCanvas>
    </div>
  );
}
