"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { FileText } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { FilterSelect } from "@/components/ui/filter-select";
import { PageHeader } from "@/components/ui/page-header";
import { NotFoundState } from "@/components/ui/not-found-state";
import { DetailHeader } from "@/components/ui/page-header";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell, type SortDir } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { getFolderById } from "@/lib/library-mock";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";

const PAGE_SIZE = 8;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

type SortCol = "name" | "lastModified";

export default function FolderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const folder = getFolderById(id);

  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<SortCol>("lastModified");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return folder?.documents.filter((d) =>
      !q || d.name.toLowerCase().includes(q)
    ) ?? [];
  }, [folder, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1;
      if (sortCol === "name") return mul * a.name.localeCompare(b.name);
      return mul * (new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime());
    });
  }, [filtered, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSort(col: SortCol) {
    if (col === sortCol) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
    setPage(1);
  }

  function handleSearch(v: string) {
    setSearch(v);
    setPage(1);
  }

  if (!folder) {
    return (
      <div className="relative flex flex-col h-full overflow-hidden" style={{ background: "var(--surface)" }}>
        <PageHeader crumbs={[{ label: "Library", href: "/library" }, { label: "Folder" }]} />
        <NotFoundState
          title="Folder not found"
          description="This folder may have been moved or removed from the Library."
          actionLabel="Back to Library"
          actionHref="/library"
        />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
      <PageHeader
        className="bg-transparent"
        crumbs={[
          { label: "Library", href: "/library" },
          { label: folder.name },
        ]}
      />

      <ScrollCanvas>
          <div className="max-w-[920px] mx-auto px-4 sm:px-8 pt-8 pb-12 flex flex-col gap-8">
            <DetailHeader
              backHref="/library"
              backLabel="Back to Library"
              title={folder.name}
              meta={`${folder.documents.length} document${folder.documents.length !== 1 ? "s" : ""}  ·  Last updated ${formatDate(folder.lastModified)}`}
            />

            {/* Search + Table */}
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <SearchInput
                  value={search}
                  onChange={handleSearch}
                  placeholder="Search documents"
                  className="flex-1 min-w-0 sm:flex-none sm:w-full sm:max-w-[400px]"
                />
                {/* Mobile-only sort: the card list below has no sortable
                    column headers (same pattern as the Library home list). */}
                <FilterSelect
                  value={sortCol === "name" ? (sortDir === "asc" ? "name-asc" : "name-desc") : (sortDir === "desc" ? "date-desc" : "date-asc")}
                  onChange={(v) => {
                    const map: Record<string, { col: SortCol; dir: SortDir }> = {
                      "name-asc":  { col: "name",         dir: "asc"  },
                      "name-desc": { col: "name",         dir: "desc" },
                      "date-desc": { col: "lastModified", dir: "desc" },
                      "date-asc":  { col: "lastModified", dir: "asc"  },
                    };
                    const t = map[v];
                    if (t) { setSortCol(t.col); setSortDir(t.dir); setPage(1); }
                  }}
                  className="w-[140px] shrink-0 sm:hidden"
                  options={[
                    { value: "date-desc", label: "Newest first" },
                    { value: "date-asc",  label: "Oldest first" },
                    { value: "name-asc",  label: "Name A–Z" },
                    { value: "name-desc", label: "Name Z–A" },
                  ]}
                />
              </div>

            <div className="flex flex-col gap-4">
              {paged.length === 0 ? (
                <p className="text-[14px] text-muted-foreground py-8 text-center">No documents available.</p>
              ) : (
                <>
                {/* Desktop: full column table */}
                <Table className="hidden md:block">
                  <TableHeader>
                    <TableHead
                      sortDir={sortCol === "name" ? sortDir : null}
                      onSort={() => handleSort("name")}
                      className="flex-1"
                    >
                      Name
                    </TableHead>
                    <TableHead style={{ width: 90, minWidth: 90 }}>Content</TableHead>
                    <TableHead
                      sortDir={sortCol === "lastModified" ? sortDir : null}
                      onSort={() => handleSort("lastModified")}
                      style={{ width: 120, minWidth: 120 }}
                    >
                      Last modified
                    </TableHead>
                  </TableHeader>
                  <TableBody>
                    {paged.map((doc) => (
                      <TableRow key={doc.id} onClick={() => doc.kind === "document" ? router.push(`/library/files/${doc.id}`) : undefined}>
                        <TableCell className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText size={14} strokeWidth={1.5} className="text-muted-foreground shrink-0" />
                            <span className="truncate" style={{ color: "var(--primary)" }}>{doc.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground" style={{ width: 90, minWidth: 90 }}>{doc.content}</TableCell>
                        <TableCell className="text-muted-foreground" style={{ width: 120, minWidth: 120 }}>
                          {formatDate(doc.lastModified)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Mobile: stacked card rows — same collapse as the Library
                    home list. Fixed-width columns don't shrink at 375px. */}
                <Table className="md:hidden">
                  <TableBody>
                    {paged.map((doc) => (
                      <TableRow key={doc.id} className="py-3" onClick={() => doc.kind === "document" ? router.push(`/library/files/${doc.id}`) : undefined}>
                        <FileText size={14} strokeWidth={1.5} className="text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                          <span className="text-[14px] leading-[20px] font-medium truncate" style={{ color: "var(--primary)" }}>{doc.name}</span>
                          <span className="text-[12px] leading-[16px] font-[500] text-muted-foreground">
                            {formatDate(doc.lastModified)} · {doc.content}
                          </span>
                        </div>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </>
              )}

              {totalPages > 1 && (
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              )}
            </div>
            </div>
          </div>
      </ScrollCanvas>
    </div>
  );
}
