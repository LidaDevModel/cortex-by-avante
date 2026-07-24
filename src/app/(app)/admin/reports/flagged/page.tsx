"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { SearchInput } from "@/components/ui/search-input";
import { FilterSelect } from "@/components/ui/filter-select";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { useGlassHeader } from "@/hooks/use-glass-header";
import { useRowStagger } from "@/hooks/use-entrance";
import { useFlags, type FlagStatus } from "@/lib/flags-store";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** Open reads as caution (warning); resolved as positive (success). */
function FlagPill({ status }: { status: FlagStatus }) {
  const open = status === "open";
  return <Badge tone={open ? "warning" : "success"}>{open ? "Open" : "Resolved"}</Badge>;
}

export default function AdminFlaggedPage() {
  const { headerClassName, onScroll } = useGlassHeader();
  const router = useRouter();
  const flags = useFlags();

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
      <PageHeader crumbs={[{ label: "Admin", href: "/admin" }, { label: "Flagged responses" }]} className={headerClassName} />

      <ScrollCanvas onScroll={onScroll}>
        <div className="max-w-[920px] mx-auto px-4 sm:px-8 pt-8 pb-12 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-[22px] leading-[30px] sm:text-[28px] sm:leading-[36px] font-bold text-foreground">Flagged responses</h1>
            <p className="text-[14px] leading-[20px] text-muted-foreground">Answers staff reported as wrong or incomplete. Open one to review the source content, then resolve.</p>
          </div>

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <SearchInput value={query} onChange={setQuery} placeholder="Search flagged responses" className="w-full sm:w-[280px]" />
            <div className="flex items-center gap-2 flex-wrap">
              <FilterSelect value={statusFilter} onChange={setStatusFilter} options={[{ value: "open", label: "Open" }, { value: "resolved", label: "Resolved" }]} placeholder="All statuses" />
              <FilterSelect value={reasonFilter} onChange={setReasonFilter} options={[{ value: "Incomplete", label: "Incomplete" }, { value: "Wrong info", label: "Wrong info" }, { value: "Other", label: "Other" }]} placeholder="All reasons" />
              <FilterSelect value={sourceFilter} onChange={setSourceFilter} options={sourceOptions} placeholder="All sources" />
            </div>
          </div>

          {sorted.length === 0 ? (
            <div className="rounded-[12px] p-10 text-center bg-surface-raised" style={{ border: "1px solid var(--border)" }}>
              <p className="text-[14px] leading-[20px] text-muted-foreground">
                {q || statusFilter || reasonFilter || sourceFilter ? "No flagged responses match these filters." : "No flagged responses. Reports from the AI chat will appear here."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableHead className="w-[92px]">Status</TableHead>
                <TableHead className="w-[104px]">Reason</TableHead>
                <TableHead className="flex-1">Based on</TableHead>
                <TableHead className="w-[108px]">Date</TableHead>
                <TableHead className="w-[112px]">Flagged by</TableHead>
              </TableHeader>
              <TableBody>
                {sorted.map((f, i) => (
                  <TableRow key={f.id} onClick={() => router.push(`/admin/reports/flagged/${f.id}`)} style={rowStyle(i)}>
                    <TableCell className="w-[92px]"><FlagPill status={f.status} /></TableCell>
                    <TableCell className="w-[104px] text-muted-foreground">{f.reason}</TableCell>
                    <TableCell className="flex-1 min-w-0 text-foreground">
                      <span className="block truncate">{f.source?.label ?? "Not grounded"}</span>
                    </TableCell>
                    <TableCell className="w-[108px] text-muted-foreground">{formatDate(f.date)}</TableCell>
                    <TableCell className="w-[112px] min-w-0 text-muted-foreground">
                      <span className="block truncate">{f.flaggedBy}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </ScrollCanvas>
    </div>
  );
}
