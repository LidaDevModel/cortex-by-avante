"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { SearchInput } from "@/components/ui/search-input";
import { FilterSelect } from "@/components/ui/filter-select";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { useGlassHeader } from "@/hooks/use-glass-header";
import { useActivity, ACTIVITY_KIND_OPTIONS } from "@/lib/activity-log";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AdminActivityPage() {
  const { headerClassName, onScroll } = useGlassHeader();
  const all = useActivity();

  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState("");
  const [actorFilter, setActorFilter] = useState("");

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

  return (
    <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
      <PageHeader crumbs={[{ label: "Admin", href: "/admin" }, { label: "Activity log" }]} className={headerClassName} />

      <ScrollCanvas onScroll={onScroll}>
        <div className="max-w-[920px] mx-auto px-4 sm:px-8 pt-8 pb-12 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-[22px] leading-[30px] sm:text-[28px] sm:leading-[36px] font-bold text-foreground">Activity log</h1>
            <p className="text-[14px] leading-[20px] text-muted-foreground">Who did what across content, people, and flagged responses.</p>
          </div>

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <SearchInput value={query} onChange={setQuery} placeholder="Search actions" className="w-full sm:w-[280px]" />
            <div className="flex items-center gap-2 flex-wrap">
              <FilterSelect value={kindFilter} onChange={setKindFilter} options={ACTIVITY_KIND_OPTIONS} placeholder="All actions" />
              <FilterSelect value={actorFilter} onChange={setActorFilter} options={actorOptions} placeholder="All admins" />
            </div>
          </div>

          {entries.length === 0 ? (
            <div className="rounded-[12px] p-10 text-center bg-surface-raised" style={{ border: "1px solid var(--border)" }}>
              <p className="text-[14px] leading-[20px] text-muted-foreground">
                {q || kindFilter || actorFilter ? "No actions match these filters." : "No activity data yet."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableHead className="flex-1">Action</TableHead>
                <TableHead className="w-[140px]">Admin</TableHead>
                <TableHead className="w-[150px]">When</TableHead>
              </TableHeader>
              <TableBody>
                {entries.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="flex-1 min-w-0">
                      <span className="block truncate">{e.action}</span>
                    </TableCell>
                    <TableCell className="w-[140px] min-w-0 text-muted-foreground">
                      <span className="block truncate">{e.actor}</span>
                    </TableCell>
                    <TableCell className="w-[150px] text-muted-foreground tabular-nums">{formatWhen(e.ts)}</TableCell>
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
