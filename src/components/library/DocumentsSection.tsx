"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { LayoutList, LayoutGrid } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { DocGridCard } from "./DocGridCard";
import { KindPill, type DocKind } from "./kind-pill";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell, type SortDir } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { FilterSelect } from "@/components/ui/filter-select";
import { cn } from "@/lib/utils";
import { FOLDERS, TOP_LEVEL_DOCS } from "@/lib/library-mock";

/* ─── Types ─── */

type Doc = {
  id: string;
  name: string;
  kind: DocKind;
  content: string;
  lastModified: string;
};

/* ─── Data — derived live from the shared library data, never hand-duplicated ─── */

const DOCUMENTS: Doc[] = [
  ...FOLDERS.map((f): Doc => ({
    id: f.id,
    name: f.name,
    kind: "folder",
    content: `${f.documents.length} file${f.documents.length !== 1 ? "s" : ""}`,
    lastModified: f.lastModified,
  })),
  ...TOP_LEVEL_DOCS.map((d): Doc => ({
    id: d.id,
    name: d.name,
    kind: "document",
    content: d.content,
    lastModified: d.lastModified,
  })),
];

const LIST_PAGE_SIZE = 8;
const GRID_PAGE_SIZE = 12; // 6 cols × 2 rows

/* ─── Helpers ─── */

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/* ─── Sub-components ─── */

function ViewToggle({ view, onChange }: { view: "list" | "grid"; onChange: (v: "list" | "grid") => void }) {
  return (
    <div className="flex items-center rounded-[8px] overflow-hidden border border-border">
      <button
        onClick={() => onChange("list")}
        className={cn(
          "flex items-center justify-center w-12 h-12 transition-colors duration-100",
          view === "list" ? "bg-[var(--accent-subtle)]" : "bg-[var(--surface)]"
        )}
        aria-label="List view"
      >
        <LayoutList size={16} strokeWidth={1.5} className={view === "list" ? "text-foreground" : "text-muted-foreground"} />
      </button>
      <button
        onClick={() => onChange("grid")}
        className={cn(
          "flex items-center justify-center w-12 h-12 border-l border-border transition-colors duration-100",
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
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<"name" | "lastModified">("lastModified");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [kindFilter, setKindFilter] = useState("");
  const [view, setView] = useState<"list" | "grid">("list");
  const [page, setPage] = useState(1);
  const pageSize = view === "grid" ? GRID_PAGE_SIZE : LIST_PAGE_SIZE;

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  type GridSort = "name-asc" | "name-desc" | "date-desc" | "date-asc";
  const gridSort: GridSort = sortCol === "name" ? (sortDir === "asc" ? "name-asc" : "name-desc") : (sortDir === "desc" ? "date-desc" : "date-asc");

  function handleGridSort(v: string) {
    const map: Record<string, { col: "name" | "lastModified"; dir: SortDir }> = {
      "name-asc":  { col: "name",         dir: "asc"  },
      "name-desc": { col: "name",         dir: "desc" },
      "date-desc": { col: "lastModified", dir: "desc" },
      "date-asc":  { col: "lastModified", dir: "asc"  },
    };
    const target = map[v];
    if (target) { setSortCol(target.col); setSortDir(target.dir); setPage(1); }
  }

  function handleSearch(v: string) { setSearch(v); setPage(1); }
  function handleKind(v: string) { setKindFilter(v); setPage(1); }
  function handleView(v: "list" | "grid") { setView(v); setPage(1); }

  return (
    <section className="flex flex-col gap-0">
      {/* Section label + toolbar */}
      <div className="flex flex-col gap-4">
        <p className="section-label">Documents</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <SearchInput
            value={search}
            onChange={handleSearch}
            placeholder="Search documents"
            className="w-full sm:w-[280px] sm:shrink-0"
          />

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <FilterSelect
              value={kindFilter}
              onChange={handleKind}
              placeholder="All types"
              className="flex-1 sm:flex-none sm:w-[120px]"
              options={[
                { value: "document", label: "Documents" },
                { value: "folder", label: "Folders" },
              ]}
            />
            {/* Sort select: always available on mobile, where the card list
                has no sortable column headers; desktop list view sorts via
                the table header, so there it only appears alongside the grid. */}
            <FilterSelect
              value={gridSort}
              onChange={handleGridSort}
              className={cn("flex-1 sm:flex-none sm:w-[140px]", view === "list" && "sm:hidden")}
              options={[
                { value: "date-desc", label: "Newest first" },
                { value: "date-asc",  label: "Oldest first" },
                { value: "name-asc",  label: "Name A–Z" },
                { value: "name-desc", label: "Name Z–A" },
              ]}
            />
            <ViewToggle view={view} onChange={handleView} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-4">
        {paginated.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-[15px] leading-[24px] text-muted-foreground">No documents available.</p>
          </div>
        ) : view === "list" ? (
          <>
            {/* Desktop: full column table */}
            <Table className="hidden md:block">
              <TableHeader>
                <TableHead className="flex-1" sortDir={sortCol === "name" ? sortDir : null} onSort={() => handleSort("name")}>Name</TableHead>
                <TableHead className="w-[140px]" sortDir={sortCol === "lastModified" ? sortDir : null} onSort={() => handleSort("lastModified")}>Last modified</TableHead>
                <TableHead className="w-[110px]">Kind</TableHead>
                <TableHead className="w-[90px]">Content</TableHead>
              </TableHeader>
              <TableBody>
                {paginated.map((doc) => (
                  <TableRow key={doc.id} onClick={() => router.push(doc.kind === "folder" ? `/library/folders/${doc.id}` : `/library/files/${doc.id}`)}>
                    <TableCell className="flex-1 font-medium truncate" style={{ color: "var(--foreground)" }}>
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

            {/* Mobile: the columns collapse into stacked card rows — name over
                a date · content meta line, kind pill on the right. Fixed-width
                columns don't shrink gracefully at 375px. */}
            <Table className="md:hidden">
              <TableBody>
                {paginated.map((doc) => (
                  <TableRow key={doc.id} className="py-3" onClick={() => router.push(doc.kind === "folder" ? `/library/folders/${doc.id}` : `/library/files/${doc.id}`)}>
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <span className="text-[14px] leading-[20px] font-medium truncate" style={{ color: "var(--foreground)" }}>{doc.name}</span>
                      <span className="text-[12px] leading-[16px] font-[500] text-muted-foreground">
                        {formatDate(doc.lastModified)} · {doc.content}
                      </span>
                    </div>
                    <KindPill kind={doc.kind} />
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-x-2 gap-y-8">
            {paginated.map((doc) => (
              <DocGridCard
                key={doc.id}
                name={doc.name}
                kind={doc.kind}
                lastModified={doc.lastModified}
                onClick={() => router.push(doc.kind === "folder" ? `/library/folders/${doc.id}` : `/library/files/${doc.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} onChange={setPage} className="mt-6" />
    </section>
  );
}
