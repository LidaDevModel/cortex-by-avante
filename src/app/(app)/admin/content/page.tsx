"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FolderPlus, FilePlus2, FolderOpen, Folder, FileText, Pencil, Eye, EyeOff, Trash2, Send } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { SearchInput } from "@/components/ui/search-input";
import { Segmented } from "@/components/ui/segmented";
import { FilterSelect } from "@/components/ui/filter-select";
import { DataTable, DataCards, defineActions, defineColumns, sortRows, type Column, type SortState } from "@/components/ui/data-list";
import { SortButton } from "@/components/ui/sort-button";
import { Pagination } from "@/components/ui/pagination";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ExitConfirmDialog } from "@/components/ui/exit-confirm-dialog";
import { NamePromptModal } from "@/components/admin/NamePromptModal";
import { BackLink } from "@/components/admin/back-link";
import { useRowStagger } from "@/hooks/use-entrance";
import { resolveBack, withReturn } from "@/lib/admin-nav";
import { Button } from "@/components/ui/button";
import { useGlassHeader } from "@/hooks/use-glass-header";
import { useLibrary, getContentFolder, createFolder, createDoc, renameItem, deleteItem, setDocPublished, setFolderPublished } from "@/lib/content-store";
import { PublishBadge } from "@/components/admin/publish-badge";
import { showToast } from "@/components/ui/toast";
import { useManageLock, ManageLockedPanel } from "@/components/admin/manage-lock";
import { SkeletonList } from "@/components/ui/skeleton-blocks";
import { StatePanel } from "@/components/ui/state-panel";
import { useInitialLoad } from "@/hooks/use-initial-load";

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

/** Kind lens — the primary Files / Folders tabs (replaces the old dropdown). */
const KIND_TABS = [
  { value: "all", label: "All" },
  { value: "document", label: "Files" },
  { value: "folder", label: "Folders" },
] as const;
type KindTab = (typeof KIND_TABS)[number]["value"];

/**
 * The admin Library list — folders and documents in one table.
 *
 * "Last modified" is accurate here, unlike the Modules list: a library
 * document's `lastModified` is seeded with a real date and every edit sets it,
 * so there is nothing to rename and no never-modified case.
 */
const COLUMNS: Column<Row>[] = defineColumns<Row>([
  {
    key: "name",
    label: "Name",
    sortValue: (r) => r.name,
    mobile: "identity",
    render: (r) => (
      <div className="flex items-center gap-2.5 min-w-0 font-medium">
        {r.type === "folder" ? (
          <Folder size={16} strokeWidth={1.5} className="text-muted-foreground shrink-0" />
        ) : (
          <FileText size={16} strokeWidth={1.5} className="text-muted-foreground shrink-0" />
        )}
        <span className="block truncate">{r.name}</span>
      </div>
    ),
  },
  {
    key: "lastModified",
    label: "Last modified",
    width: "date",
    sortValue: (r) => r.lastModified,
    sortKind: "date",
    mobile: "pair",
    render: (r) => <span className="text-muted-foreground">{formatDate(r.lastModified)}</span>,
  },
  {
    key: "status",
    label: "Status",
    width: "narrow",
    mobile: "trailing",
    render: (r) => <PublishBadge published={r.published !== false} />,
  },
]);

export default function AdminContentPage() {
  const { headerClassName, onScroll } = useGlassHeader();
  const loading = useInitialLoad("admin-library");
  const router = useRouter();
  const lib = useLibrary();
  const { locked } = useManageLock();
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folder") ?? undefined;
  const folder = folderId ? getContentFolder(folderId) : undefined;

  const newParam = searchParams.get("new");

  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<KindTab>("all");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState<SortState>({ key: "lastModified", dir: "desc" });
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
  function handleSort(key: string) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
    setPage(1);
  }

  const rows: Row[] = folder
    ? folder.documents.map((d) => ({ id: d.id, name: d.name, type: "document", lastModified: d.lastModified, published: d.published !== false, roles: d.roles, hasContent: docHasContent(d.toc) }))
    : [
        ...lib.folders.map((f) => ({ id: f.id, name: f.name, type: "folder" as const, lastModified: f.lastModified, published: f.published !== false })),
        ...lib.topLevel.map((d) => ({ id: d.id, name: d.name, type: "document" as const, lastModified: d.lastModified, published: d.published !== false, roles: d.roles, hasContent: docHasContent(d.toc) })),
      ];

  const q = query.trim().toLowerCase();
  const shown = useMemo(() => {
    const list = rows.filter((r) => {
      if (q && !r.name.toLowerCase().includes(q)) return false;
      if (!folder && kindFilter !== "all" && r.type !== kindFilter) return false;
      // Status applies to files and folders (both publishable); role is file-only.
      if (statusFilter && (statusFilter === "published") !== (r.published !== false)) return false;
      if (roleFilter && (r.type !== "document" || (r.roles !== undefined && !r.roles.includes(roleFilter)))) return false;
      return true;
    });
    return sortRows(list, COLUMNS, sort);
  }, [rows, q, kindFilter, roleFilter, statusFilter, sort]);

  const totalPages = Math.ceil(shown.length / PER_PAGE);
  const safePage = Math.min(page, totalPages || 1);
  const paginated = shown.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);
  const rowStyle = useRowStagger(folder ? `admin-library-${folder.id}` : "admin-library");

  // Dropdown "Open" (folder) / "Edit" (document): folder opens, document edits.
  function openRow(r: Row) {
    if (r.type === "folder") router.push(`/admin/content?folder=${r.id}`);
    else router.push(`/admin/content/${r.id}`);
  }
  function previewRow(r: Row) {
    // Return to exactly where the preview was opened from — inside a folder,
    // that is the folder, not the Library root.
    const from = folder ? `/admin/content?folder=${folder.id}` : "/admin/content";
    router.push(withReturn(`/admin/content/${r.id}/preview`, from));
  }

  // The per-row actions menu — shared by the desktop table and the mobile card
  // so Open/Rename/Publish/Delete stay reachable on a phone. The stopPropagation
  // wrapper keeps a menu click from also triggering the row's navigation.
  const rowActions = defineActions<Row>({
    // Names the row, so eight triggers are not eight buttons called "Actions".
    name: (r) => `Actions for ${r.name}`,
    items: (r) => (
      <>
            {r.type === "folder" ? (
              <>
                <DropdownMenuItem onSelect={() => openRow(r)}><FolderOpen size={16} strokeWidth={1.5} /> Open</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setPrompt({ mode: "rename", id: r.id, initial: r.name })}><Pencil size={16} strokeWidth={1.5} /> Rename</DropdownMenuItem>
                {r.published !== false ? (
                  <DropdownMenuItem onSelect={() => setUnpublishTarget(r)}><EyeOff size={16} strokeWidth={1.5} /> Unpublish</DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onSelect={() => { setFolderPublished(r.id, true); showToast({ title: "Published", description: `"${r.name}" is now visible to learners.`, action: { label: "Undo", onClick: () => setFolderPublished(r.id, false) } }); }}><Send size={16} strokeWidth={1.5} /> Publish</DropdownMenuItem>
                )}
              </>
            ) : (
              <>
                <DropdownMenuItem onSelect={() => openRow(r)}><Pencil size={16} strokeWidth={1.5} /> Edit</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => previewRow(r)}><Eye size={16} strokeWidth={1.5} /> Preview</DropdownMenuItem>
                {r.published !== false ? (
                  <DropdownMenuItem onSelect={() => setUnpublishTarget(r)}><EyeOff size={16} strokeWidth={1.5} /> Unpublish</DropdownMenuItem>
                ) : (
                  <DropdownMenuItem disabled={!r.hasContent} onSelect={() => { setDocPublished(r.id, true); showToast({ title: "Published", description: `"${r.name}" is now visible to learners.`, action: { label: "Undo", onClick: () => setDocPublished(r.id, false) } }); }}><Send size={16} strokeWidth={1.5} /> Publish</DropdownMenuItem>
                )}
              </>
            )}
        <DropdownMenuItem variant="destructive" onSelect={() => setDeleteTarget(r)}><Trash2 size={16} strokeWidth={1.5} /> Delete</DropdownMenuItem>
      </>
    ),
  });

  const crumbs = folder
    ? [{ label: "Content" }, { label: "Library", href: "/admin/content" }, { label: folder.name }]
    : [{ label: "Content" }, { label: "Library" }];

  return (
    <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
      <PageHeader crumbs={crumbs} className={headerClassName} />

      <ScrollCanvas onScroll={onScroll}>
        <div className="container-wide pt-8 pb-12 flex flex-col gap-6 min-h-full">
          {/* Locked: one identity line and one statement. The folder view's own
              title row and actions are skipped too — with the section locked
              there is no folder to be inside. */}
          {locked ? (
            <>
              <div className="flex flex-col gap-1">
                <h1 className="type-h1 font-bold text-foreground">Library</h1>
                <p className="type-label text-muted-foreground">Documents and folders staff can read. Publish one to make it visible to learners.</p>
              </div>
              <ManageLockedPanel task="managing the content library" />
            </>
          ) : loading ? (
            /* First load of the session only — a real backend's latency drives
               this later. Mirrors the toolbar + rows + pagination shape. */
            <SkeletonList filters={2} />
          ) : (
          <>
          {folder && <BackLink {...resolveBack(searchParams.get("return"), { href: "/admin/content", label: "Back to Library" })} />}
          {folder ? (
            // Folder view: name + its actions (New document, Publish/Unpublish
            // the folder) share the title row.
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h1 className="type-h1 font-bold text-foreground">
                {folder.name}
              </h1>
              <div className="flex items-center gap-2">
                <Button size="cta" onClick={() => setPrompt({ mode: "new-doc" })}>
                  <FilePlus2 size={16} strokeWidth={1.5} /> New document
                </Button>
                {folder.published !== false ? (
                  <Button size="cta" variant="outline" onClick={() => setUnpublishTarget({ id: folder.id, name: folder.name, type: "folder", lastModified: folder.lastModified, published: true })}>
                    <EyeOff size={16} strokeWidth={1.5} /> Unpublish
                  </Button>
                ) : (
                  <Button size="cta" variant="outline" onClick={() => { setFolderPublished(folder.id, true); showToast({ title: "Published", description: `"${folder.name}" is now visible to learners.`, action: { label: "Undo", onClick: () => setFolderPublished(folder.id, false) } }); }}>
                    <Send size={16} strokeWidth={1.5} /> Publish
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <h1 className="type-h1 font-bold text-foreground">Library</h1>
                <p className="type-label text-muted-foreground">Documents and folders staff can read. Publish one to make it visible to learners.</p>
              </div>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <Segmented
                  options={KIND_TABS}
                  value={kindFilter}
                  onChange={resetPage(setKindFilter)}
                  ariaLabel="Filter by kind"
                />
                <div className="flex items-center gap-2">
                  <Button size="cta" variant="outline" onClick={() => setPrompt({ mode: "new-folder" })}>
                    <FolderPlus size={16} strokeWidth={1.5} /> New folder
                  </Button>
                  <Button size="cta" onClick={() => setPrompt({ mode: "new-doc" })}>
                    <FilePlus2 size={16} strokeWidth={1.5} /> New document
                  </Button>
                </div>
              </div>
            </>
          )}

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <SearchInput value={query} onChange={resetPage(setQuery)} placeholder={folder ? "Search this folder" : "Search the Library"} className="w-full sm:w-[280px]" />
            <SortButton
              columns={COLUMNS}
              sort={sort}
              onChange={(next) => { setSort(next); setPage(1); }}
              className="md:hidden"
            />
            <div className="flex items-center gap-2 flex-wrap">
              <FilterSelect value={roleFilter} onChange={resetPage(setRoleFilter)} options={[{ value: "field-agent", label: "Field Agent" }, { value: "admin", label: "Admin" }]} placeholder="All roles" />
              <FilterSelect value={statusFilter} onChange={resetPage(setStatusFilter)} options={[{ value: "published", label: "Published" }, { value: "draft", label: "Draft" }]} placeholder="All statuses" />
            </div>
          </div>

          {/* The shared centred panel. These five lists each had their own
              bordered well at 14/20 — the sixth, seventh and eighth variants
              of a state the rest of the product already renders one way. */}

          {shown.length === 0 ? (
            <StatePanel description={q ? "Nothing matches that search." : "No documents here yet. Add one with New document."} />
          ) : (
            <>
              <DataTable
                className="hidden md:block"
                rows={paginated}
                columns={COLUMNS}
                rowKey={(r) => r.id}
                /* A folder opens itself; a document opens its editor. Both are
                   internal paths, so one function covers the pair — the old
                   `handleRowClick` branch. */
                rowHref={(r) => (r.type === "folder" ? `/admin/content?folder=${r.id}` : `/admin/content/${r.id}`)}
                sort={sort}
                onSort={handleSort}
                rowStyle={rowStyle}
                actions={rowActions}
              />
              <DataCards
                className="md:hidden"
                label={folder ? `Documents in ${folder.name}` : "Library"}
                rows={paginated}
                columns={COLUMNS}
                rowKey={(r) => r.id}
                rowHref={(r) => (r.type === "folder" ? `/admin/content?folder=${r.id}` : `/admin/content/${r.id}`)}
                rowStyle={rowStyle}
                actions={rowActions}
              />
            </>
          )}

          <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
          </>
          )}
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
        exitLabel={deleteTarget?.type === "folder" ? "Delete folder and contents" : "Delete document"}
        cancelLabel={deleteTarget?.type === "folder" ? "Keep folder" : "Keep document"}
        onExit={() => { if (deleteTarget) deleteItem(deleteTarget.id); setDeleteTarget(null); }}
      />

      <ExitConfirmDialog
        open={!!unpublishTarget}
        onOpenChange={(o) => !o && setUnpublishTarget(null)}
        title={`Unpublish "${unpublishTarget?.name ?? "this document"}"?`}
        description={unpublishTarget?.type === "folder" ? "The folder and its documents will no longer be visible to learners until you publish it again." : "It will no longer be visible to learners until you publish it again."}
        exitLabel="Unpublish"
        cancelLabel="Keep published"
        onExit={() => {
          if (unpublishTarget) {
            const t = unpublishTarget;
            const setPub = t.type === "folder" ? setFolderPublished : setDocPublished;
            setPub(t.id, false);
            showToast({ title: "Moved to draft", description: `"${t.name}" is no longer visible to learners.`, action: { label: "Undo", onClick: () => setPub(t.id, true) } });
          }
          setUnpublishTarget(null);
        }}
      />
    </div>
  );
}
