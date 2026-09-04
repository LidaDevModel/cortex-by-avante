"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { SearchInput } from "@/components/ui/search-input";
import { FilterSelect } from "@/components/ui/filter-select";
import { Badge } from "@/components/ui/badge";
import { DataTable, DataCards, defineColumns, type Column } from "@/components/ui/data-list";
import { useGlassHeader } from "@/hooks/use-glass-header";
import { useRowStagger } from "@/hooks/use-entrance";
import { useFlags, type FlagStatus } from "@/lib/flags-store";
import { useManageLock, ManageLockedPanel } from "@/components/admin/manage-lock";
import { SkeletonList } from "@/components/ui/skeleton-blocks";
import { StatePanel } from "@/components/ui/state-panel";
import { useInitialLoad } from "@/hooks/use-initial-load";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** Open reads as caution (warning); resolved as positive (success). */
function FlagPill({ status }: { status: FlagStatus }) {
  const open = status === "open";
  return <Badge tone={open ? "warning" : "success"}>{open ? "Open" : "Resolved"}</Badge>;
}

/**
 * Flagged responses. Note the column ORDER: Status comes first, and the
 * identity column ("Based on") is third. The shape allows that — it asks for
 * exactly one identity column, not for it to be first — so the desktop order
 * is unchanged while the card still uses "Based on" as its heading.
 *
 * No column is sortable: the list is newest-first and that is the only order
 * a review queue is read in.
 */
type FlagRow = {
  id: string;
  status: Parameters<typeof FlagPill>[0]["status"];
  reason: string;
  source?: { label: string };
  date: string;
  flaggedBy: string;
};

const COLUMNS: Column<FlagRow>[] = defineColumns<FlagRow>([
  {
    key: "status",
    label: "Status",
    width: "narrow",
    mobile: "trailing",
    render: (f) => <FlagPill status={f.status} />,
  },
  {
    key: "reason",
    label: "Reason",
    width: "narrow",
    mobile: "pair",
    render: (f) => <span className="text-muted-foreground">{f.reason}</span>,
  },
  {
    key: "source",
    label: "Based on",
    mobile: "identity",
    render: (f) => <span className="block truncate text-foreground">{f.source?.label ?? "Not grounded"}</span>,
  },
  {
    key: "date",
    label: "Date",
    width: "date",
    mobile: "pair",
    render: (f) => <span className="text-muted-foreground">{formatDate(f.date)}</span>,
  },
  {
    key: "flaggedBy",
    label: "Flagged by",
    width: "date",
    mobile: "pair",
    render: (f) => <span className="block truncate text-muted-foreground">{f.flaggedBy}</span>,
  },
]);

export default function AdminFlaggedPage() {
  const { headerClassName, onScroll } = useGlassHeader();
  const loading = useInitialLoad("admin-flagged");
  const flags = useFlags();
  const { locked } = useManageLock();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [reasonFilter, setReasonFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const rowStyle = useRowStagger("admin-flagged");

  // "Based on" options come from the flags themselves — one per source doc.
  const sourceOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const f of flags) if (f.source) map.set(f.source.docId, f.source.label.split("·")[0].trim());
    return [...map].map(([value, label]) => ({ value, label }));
  }, [flags]);

  const q = query.trim().toLowerCase();
  // Open flags first, then newest first within each group.
  const sorted = useMemo(() => {
    const list = flags.filter((f) => {
      if (statusFilter && f.status !== statusFilter) return false;
      if (reasonFilter && f.reason !== reasonFilter) return false;
      if (sourceFilter && f.source?.docId !== sourceFilter) return false;
      if (q && ![f.question, f.answer, f.note ?? "", f.flaggedBy, f.source?.label ?? ""].some((t) => t.toLowerCase().includes(q))) return false;
      return true;
    });
    return [...list].sort((a, b) => {
      if (a.status !== b.status) return a.status === "open" ? -1 : 1;
      return a.date > b.date ? -1 : 1;
    });
  }, [flags, q, statusFilter, reasonFilter, sourceFilter]);

  return (
    <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
      <PageHeader crumbs={[{ label: "Flagged responses" }]} className={headerClassName} />

      <ScrollCanvas onScroll={onScroll}>
        <div className="container-wide pt-8 pb-12 flex flex-col gap-6 min-h-full">
          <div className="flex flex-col gap-1">
            <h1 className="type-h1 font-bold text-foreground">Flagged responses</h1>
            <p className="type-label text-muted-foreground">Answers staff reported as wrong or incomplete. Open one to review the source content, then resolve.</p>
          </div>

          {/* Locked: the screen keeps its identity above, and its working
              surface becomes one statement plus the one useful action. */}
          {locked ? (
            <ManageLockedPanel task="reviewing flagged responses" />
          ) : loading ? (
            /* First load of the session only — a real backend's latency drives
               this later. Mirrors the toolbar + rows + pagination shape. */
            <SkeletonList filters={3} />
          ) : (
            <>

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <SearchInput value={query} onChange={setQuery} placeholder="Search flagged responses" className="w-full sm:w-[280px]" />
            <div className="flex items-center gap-2 flex-wrap">
              <FilterSelect value={statusFilter} onChange={setStatusFilter} options={[{ value: "open", label: "Open" }, { value: "resolved", label: "Resolved" }]} placeholder="All statuses" />
              <FilterSelect value={reasonFilter} onChange={setReasonFilter} options={[{ value: "Incomplete", label: "Incomplete" }, { value: "Wrong info", label: "Wrong info" }, { value: "Other", label: "Other" }]} placeholder="All reasons" />
              <FilterSelect value={sourceFilter} onChange={setSourceFilter} options={sourceOptions} placeholder="All sources" />
            </div>
          </div>

          {/* The shared centred panel. These five lists each had their own
              bordered well at 14/20 — the sixth, seventh and eighth variants
              of a state the rest of the product already renders one way. */}

          {sorted.length === 0 ? (
            <StatePanel description={q || statusFilter || reasonFilter || sourceFilter ? "No flagged responses match these filters." : "No flagged responses. Reports from the AI chat will appear here."} />
          ) : (
            <>
              <DataTable
                className="hidden md:block"
                rows={sorted}
                columns={COLUMNS}
                rowKey={(f) => f.id}
                rowHref={(f) => `/admin/reports/flagged/${f.id}`}
                rowStyle={rowStyle}
              />
              <DataCards
                className="md:hidden"
                label="Flagged responses"
                rows={sorted}
                columns={COLUMNS}
                rowKey={(f) => f.id}
                rowHref={(f) => `/admin/reports/flagged/${f.id}`}
                rowStyle={rowStyle}
              />
            </>
          )}
            </>
          )}
        </div>
      </ScrollCanvas>
    </div>
  );
}
