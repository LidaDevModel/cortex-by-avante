"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MoreHorizontal, FolderPlus, FilePlus2, FolderOpen, Pencil, EyeOff, Trash2, Send } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { SearchInput } from "@/components/ui/search-input";
import { KindPill } from "@/components/library/kind-pill";
import { FilterSelect } from "@/components/ui/filter-select";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell, type SortDir } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ExitConfirmDialog } from "@/components/ui/exit-confirm-dialog";
import { NamePromptModal } from "@/components/admin/NamePromptModal";
import { BackLink } from "@/components/admin/back-link";
import { useRowStagger } from "@/hooks/use-entrance";
import { resolveBack } from "@/lib/admin-nav";
import { Button } from "@/components/ui/button";
import { useGlassHeader } from "@/hooks/use-glass-header";
import { useLibrary, getContentFolder, createFolder, createDoc, renameItem, deleteItem, setDocPublished } from "@/lib/content-store";
import { PublishBadge } from "@/components/admin/publish-badge";
import { showToast } from "@/components/ui/toast";

type Row = { id: string; name: string; type: "folder" | "document"; lastModified: string; published?: boolean; roles?: string[]; hasContent?: boolean };

/** A document is publishable only if it has real section content. */
function docHasContent(toc?: { title: string; body: string; points?: string[]; image?: unknown; subsections?: unknown[] }[]): boolean {
  return (toc ?? []).some((s) => !!(s.title.trim() || s.body.trim() || s.points?.length || s.image || s.subsections?.length));
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

type Prompt = { mode: "new-folder" | "new-doc" | "rename"; id?: string; initial?: string };

const PER_PAGE = 8;

export default function AdminContentPage() {
  const { headerClassName, onScroll } = useGlassHeader();
  const router = useRouter();
  const lib = useLibrary();
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folder") ?? undefined;
  const folder = folderId ? getContentFolder(folderId) : undefined;

  const newParam = searchParams.get("new");

  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortCol, setSortCol] = useState<"name" | "lastModified">("lastModified");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);
  const [unpublishTarget, setUnpublishTarget] = useState<Row | null>(null);
  const [page, setPage] = useState(1);

  // Deep link from the Home quick actions: /admin/content?new=1 opens the prompt.
  useEffect(() => { if (newParam === "1") setPrompt({ mode: "new-doc" }); }, [newParam]);
  // Entering or leaving a folder is a fresh listing — start at page one.
  useEffect(() => { setPage(1); }, [folderId]);

  // Any filter/search/sort change resets to the first page so results stay in view.
  function resetPage<T>(set: (v: T) => void) {
    return (v: T) => { set(v); setPage(1); };
  }
  function handleSort(col: "name" | "lastModified") {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
    setPage(1);
  }

  const rows: Row[] = folder
    ? folder.documents.map((d) => ({ id: d.id, name: d.name, type: "document", lastModified: d.lastModified, published: d.published !== false, roles: d.roles, hasContent: docHasContent(d.toc) }))
    : [
        ...lib.folders.map((f) => ({ id: f.id, name: f.name, type: "folder" as const, lastModified: f.lastModified })),
        ...lib.topLevel.map((d) => ({ id: d.id, name: d.name, type: "document" as const, lastModified: d.lastModified, published: d.published !== false, roles: d.roles, hasContent: docHasContent(d.toc) })),
      ];

  const q = query.trim().toLowerCase();
  const shown = useMemo(() => {
    let list = rows.filter((r) => {
      if (q && !r.name.toLowerCase().includes(q)) return false;
      if (kindFilter && r.type !== kindFilter) return false;
      // Status and role filters only make sense for files — folders drop out.
      if (statusFilter && (r.type !== "document" || (statusFilter === "published") !== (r.published !== false))) return false;
      if (roleFilter && (r.type !== "document" || (r.roles !== undefined && !r.roles.includes(roleFilter)))) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1;
      if (sortCol === "name") return mul * a.name.localeCompare(b.name);
      return mul * (new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime());
    });
    return list;
  }, [rows, q, kindFilter, roleFilter, statusFilter, sortCol, sortDir]);

  const totalPages = Math.ceil(shown.length / PER_PAGE);
  const safePage = Math.min(page, totalPages || 1);
  const paginated = shown.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);
  const rowStyle = useRowStagger(folder ? `admin-library-${folder.id}` : "admin-library");

  // Dropdown "Open" (folder) / "Edit" (document): folder opens, document edits.
  function openRow(r: Row) {
    if (r.type === "folder") router.push(`/admin/content?folder=${r.id}`);
    else router.push(`/admin/content/${r.id}`);
  }
  // Row click: a folder opens; a document previews (the learner view, new tab).
  function handleRowClick(r: Row) {
    if (r.type === "folder") router.push(`/admin/content?folder=${r.id}`);
    else window.open(`/admin/content/${r.id}/preview`, "_blank");
  }

  const crumbs = folder
    ? [{ label: "Admin", href: "/admin" }, { label: "Content", href: "/admin/content" }, { label: "Library", href: "/admin/content" }, { label: folder.name }]
    : [{ label: "Admin", href: "/admin" }, { label: "Content", href: "/admin/content" }, { label: "Library" }];

  return (
    <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
      <PageHeader crumbs={crumbs} className={headerClassName} />

      <ScrollCanvas onScroll={onScroll}>
        <div className="max-w-[920px] mx-auto px-4 sm:px-8 pt-8 pb-12 flex flex-col gap-6">
          {folder && <BackLink {...resolveBack(searchParams.get("return"), { href: "/admin/content", label: "Back to Library" })} />}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h1 className="text-[22px] leading-[30px] sm:text-[28px] sm:leading-[36px] font-bold text-foreground">
              {folder ? folder.name : "Library"}
            </h1>
            <div className="flex items-center gap-2">
              {!folder && (
                <Button size="cta" variant="outline" onClick={() => setPrompt({ mode: "new-folder" })}>
                  <FolderPlus size={16} strokeWidth={1.5} /> New folder
                </Button>
              )}
              <Button size="cta" onClick={() => setPrompt({ mode: "new-doc" })}>
                <FilePlus2 size={16} strokeWidth={1.5} /> New document
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <SearchInput value={query} onChange={resetPage(setQuery)} placeholder={folder ? "Search this folder" : "Search the Library"} className="w-full sm:w-[280px]" />
            <div className="flex items-center gap-2 flex-wrap">
              {!folder && <FilterSelect value={kindFilter} onChange={resetPage(setKindFilter)} options={[{ value: "document", label: "Files" }, { value: "folder", label: "Folders" }]} placeholder="All kinds" />}
              <FilterSelect value={roleFilter} onChange={resetPage(setRoleFilter)} options={[{ value: "field-agent", label: "Field Agent" }, { value: "admin", label: "Admin" }]} placeholder="All roles" />
              <FilterSelect value={statusFilter} onChange={resetPage(setStatusFilter)} options={[{ value: "published", label: "Published" }, { value: "draft", label: "Draft" }]} placeholder="All statuses" />
            </div>
          </div>

          {shown.length === 0 ? (
            <div className="rounded-[12px] p-10 text-center bg-surface-raised" style={{ border: "1px solid var(--border)" }}>
              <p className="text-[14px] leading-[20px] text-muted-foreground">{q ? "Nothing matches that search." : "No documents here yet. Add one with New document."}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableHead className="flex-1" sortDir={sortCol === "name" ? sortDir : null} onSort={() => handleSort("name")}>Name</TableHead>
                <TableHead className="w-[124px]" sortDir={sortCol === "lastModified" ? sortDir : null} onSort={() => handleSort("lastModified")}>Last modified</TableHead>
                <TableHead className="w-[104px]">Kind</TableHead>
                <TableHead className="w-[104px]">Status</TableHead>
                <TableHead className="w-8"><span className="sr-only">Actions</span></TableHead>
              </TableHeader>
              <TableBody>
                {paginated.map((r, i) => (
                  <TableRow key={r.id} onClick={() => handleRowClick(r)} style={rowStyle(i)}>
                    <TableCell className="flex-1 min-w-0 font-medium">
                      <span className="block truncate">{r.name}</span>
                    </TableCell>
                    <TableCell className="w-[124px] text-muted-foreground">{formatDate(r.lastModified)}</TableCell>
                    <TableCell className="w-[104px]">
                      <KindPill kind={r.type} />
                    </TableCell>
                    <TableCell className="w-[104px]">
                      {r.type === "document" ? <PublishBadge published={r.published !== false} /> : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="w-8">
                      <div onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors duration-100" aria-label="Actions">
                              <MoreHorizontal size={16} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[160px]">
                            {r.type === "folder" ? (
                              <>
                                <DropdownMenuItem onSelect={() => openRow(r)}><FolderOpen size={16} strokeWidth={1.5} /> Open</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => setPrompt({ mode: "rename", id: r.id, initial: r.name })}><Pencil size={16} strokeWidth={1.5} /> Rename</DropdownMenuItem>
                              </>
                            ) : (
                              <>
                                <DropdownMenuItem onSelect={() => openRow(r)}><Pencil size={16} strokeWidth={1.5} /> Edit</DropdownMenuItem>
                                {r.published !== false ? (
                                  <DropdownMenuItem onSelect={() => setUnpublishTarget(r)}><EyeOff size={16} strokeWidth={1.5} /> Unpublish</DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem disabled={!r.hasContent} onSelect={() => { setDocPublished(r.id, true); showToast({ title: "Published", description: `"${r.name}" is now visible to learners.`, action: { label: "Undo", onClick: () => setDocPublished(r.id, false) } }); }}><Send size={16} strokeWidth={1.5} /> Publish</DropdownMenuItem>
                                )}
                              </>
                            )}
                            <DropdownMenuItem variant="destructive" onSelect={() => setDeleteTarget(r)}><Trash2 size={16} strokeWidth={1.5} /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
        </div>
      </ScrollCanvas>

      {prompt && (
        <NamePromptModal
          title={prompt.mode === "new-folder" ? "New folder" : prompt.mode === "new-doc" ? "New document" : "Rename"}
          label={prompt.mode === "new-folder" ? "Folder name" : prompt.mode === "rename" ? "Name" : "Document name"}
          initial={prompt.initial}
          submitLabel={prompt.mode === "rename" ? "Save" : "Create"}
          onSubmit={(value) => {
            // New document navigates to the editor — keep the modal up until the
            // editor route renders. Folder/rename stay here, so close on submit.
            if (prompt.mode === "new-doc") { const id = createDoc(value, folder?.id); router.push(`/admin/content/${id}?new=1`); return; }
            if (prompt.mode === "new-folder") createFolder(value);
            else if (prompt.id) renameItem(prompt.id, value);
            setPrompt(null);
          }}
          onClose={() => setPrompt(null)}
        />
      )}

      <ExitConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`Delete ${deleteTarget?.type === "folder" ? "folder" : "document"}?`}
        description={deleteTarget?.type === "folder" ? "This removes the folder and its documents. This can't be undone." : "This removes the document. This can't be undone."}
        exitLabel="Delete"
        cancelLabel="Cancel"
        onExit={() => { if (deleteTarget) deleteItem(deleteTarget.id); setDeleteTarget(null); }}
      />

      <ExitConfirmDialog
        open={!!unpublishTarget}
        onOpenChange={(o) => !o && setUnpublishTarget(null)}
        title={`Unpublish "${unpublishTarget?.name ?? "this document"}"?`}
        description="It will no longer be visible to learners until you publish it again."
        exitLabel="Unpublish"
        cancelLabel="Cancel"
        onExit={() => {
          if (unpublishTarget) {
            const t = unpublishTarget;
            setDocPublished(t.id, false);
            showToast({ title: "Moved to draft", description: `"${t.name}" is no longer visible to learners.`, action: { label: "Undo", onClick: () => setDocPublished(t.id, true) } });
          }
          setUnpublishTarget(null);
        }}
      />
    </div>
  );
}
