"use client";

import { useState, useMemo } from "react";
import { Search, FileText, Folder, LayoutList, LayoutGrid } from "lucide-react";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell, type SortDir } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { FilterSelect } from "@/components/ui/filter-select";
import { cn } from "@/lib/utils";

/* ─── Types ─── */

type DocKind = "document" | "folder";

type Doc = {
  id: string;
  name: string;
  kind: DocKind;
  content: string;
  lastModified: string;
};

/* ─── Mock data ─── */

const DOCUMENTS: Doc[] = [
  { id: "1",  name: "Incident Response",          kind: "document", content: "13 pages", lastModified: "2026-06-28" },
  { id: "2",  name: "Guard Duty",                 kind: "folder",   content: "2 files",  lastModified: "2026-06-25" },
  { id: "3",  name: "Security Protocols",         kind: "document", content: "12 pages", lastModified: "2026-06-20" },
  { id: "4",  name: "Access Control",             kind: "folder",   content: "7 files",  lastModified: "2026-06-18" },
  { id: "5",  name: "Emergency Procedures",       kind: "document", content: "8 pages",  lastModified: "2026-06-15" },
  { id: "6",  name: "Client Communication",       kind: "document", content: "6 pages",  lastModified: "2026-06-10" },
  { id: "7",  name: "Patrol Guidelines",          kind: "document", content: "10 pages", lastModified: "2026-06-08" },
  { id: "8",  name: "Escalation Procedures",      kind: "folder",   content: "4 files",  lastModified: "2026-06-05" },
  { id: "9",  name: "First Aid Reference",        kind: "document", content: "5 pages",  lastModified: "2026-05-30" },
  { id: "10", name: "Onboarding Pack",            kind: "folder",   content: "9 files",  lastModified: "2026-05-22" },
  { id: "11", name: "Post Incident Report",       kind: "document", content: "3 pages",  lastModified: "2026-05-18" },
  { id: "12", name: "Site Briefings",             kind: "folder",   content: "6 files",  lastModified: "2026-05-10" },
];

const PAGE_SIZE = 8;

/* ─── Helpers ─── */

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/* ─── Sub-components ─── */

function KindPill({ kind }: { kind: DocKind }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[12px] leading-[16px] font-medium px-2 py-0.5 rounded-full border",
        kind === "document"
          ? "border-[color-mix(in_srgb,var(--primary)_25%,transparent)] text-[var(--primary)]"
          : "border-border text-muted-foreground"
      )}
    >
      {kind === "document" ? <FileText size={11} strokeWidth={1.5} /> : <Folder size={11} strokeWidth={1.5} />}
      {kind === "document" ? "Document" : "Folder"}
    </span>
  );
}

function ViewToggle({ view, onChange }: { view: "list" | "grid"; onChange: (v: "list" | "grid") => void }) {
  return (
    <div className="flex items-center rounded-[8px] overflow-hidden border border-border">
      <button
        onClick={() => onChange("list")}
        className={cn(
          "flex items-center justify-center w-10 h-10 transition-colors duration-100",
          view === "list" ? "bg-[var(--accent-subtle)]" : "bg-[var(--surface)]"
        )}
        aria-label="List view"
      >
        <LayoutList size={16} strokeWidth={1.5} className={view === "list" ? "text-foreground" : "text-muted-foreground"} />
      </button>
      <button
        onClick={() => onChange("grid")}
        className={cn(
          "flex items-center justify-center w-10 h-10 border-l border-border transition-colors duration-100",
          view === "grid" ? "bg-[var(--accent-subtle)]" : "bg-[var(--surface)]"
        )}
        aria-label="Grid view"
      >
        <LayoutGrid size={16} strokeWidth={1.5} className={view === "grid" ? "text-foreground" : "text-muted-foreground"} />
      </button>
    </div>
  );
}


/* ─── Main export ─── */

export function DocumentsSection() {
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<"name" | "lastModified">("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [kindFilter, setKindFilter] = useState("");
  const [view, setView] = useState<"list" | "grid">("list");
  const [page, setPage] = useState(1);

  function handleSort(col: "name" | "lastModified") {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
    setPage(1);
  }

  const filtered = useMemo(() => {
    let list = DOCUMENTS;
    if (kindFilter) list = list.filter((d) => d.kind === kindFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((d) => d.name.toLowerCase().includes(q));
    }
    list = [...list].sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1;
      if (sortCol === "name") return mul * a.name.localeCompare(b.name);
      return mul * (new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime());
    });
    return list;
  }, [search, sortCol, sortDir, kindFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSearch(v: string) { setSearch(v); setPage(1); }
  function handleKind(v: string) { setKindFilter(v); setPage(1); }

  return (
    <section className="flex flex-col gap-0">
      {/* Section label + toolbar */}
      <div className="flex flex-col gap-4">
        <p className="section-label">Documents</p>
        <div className="flex items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-[280px] shrink-0">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-[8px] border border-border bg-[var(--surface-raised)] text-[14px] leading-[20px] text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 transition-shadow duration-100"
              style={{ "--tw-ring-color": "rgba(26,74,46,0.25)" } as React.CSSProperties}
            />
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <FilterSelect
              value={kindFilter}
              onChange={handleKind}
              placeholder="All types"
              className="w-[120px]"
              options={[
                { value: "document", label: "Documents" },
                { value: "folder", label: "Folders" },
              ]}
            />
            <ViewToggle view={view} onChange={setView} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4">
        {paginated.length > 0 ? (
          <Table>
            <TableHeader>
              <TableHead className="flex-1" sortDir={sortCol === "name" ? sortDir : null} onSort={() => handleSort("name")}>Name</TableHead>
              <TableHead className="w-[140px]" sortDir={sortCol === "lastModified" ? sortDir : null} onSort={() => handleSort("lastModified")}>Last modified</TableHead>
              <TableHead className="w-[110px]">Kind</TableHead>
              <TableHead className="w-[90px]">Content</TableHead>
            </TableHeader>
            <TableBody>
              {paginated.map((doc) => (
                <TableRow key={doc.id} onClick={() => {}}>
                  <TableCell className="flex-1 font-medium truncate" style={{ color: "var(--primary)" }}>
                    <span className="truncate">{doc.name}</span>
                  </TableCell>
                  <TableCell className="w-[140px] text-muted-foreground">{formatDate(doc.lastModified)}</TableCell>
                  <TableCell className="w-[110px]">
                    <KindPill kind={doc.kind} />
                  </TableCell>
                  <TableCell className="w-[90px] text-muted-foreground">{doc.content}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex items-center justify-center py-16">
            <p className="text-[15px] leading-[24px] text-muted-foreground">No documents found.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} onChange={setPage} className="mt-6" />
    </section>
  );
}
