"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MoreHorizontal, FilePlus2, Eye, EyeOff, Pencil, Trash2, Send } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { SearchInput } from "@/components/ui/search-input";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell, TableCard, TableCardMeta, type SortDir } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { useRowStagger } from "@/hooks/use-entrance";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ExitConfirmDialog } from "@/components/ui/exit-confirm-dialog";
import { showToast } from "@/components/ui/toast";
import { NamePromptModal } from "@/components/admin/NamePromptModal";
import { FilterSelect } from "@/components/ui/filter-select";
import { PublishBadge } from "@/components/admin/publish-badge";
import { Button } from "@/components/ui/button";
import { useGlassHeader } from "@/hooks/use-glass-header";
import { withReturn } from "@/lib/admin-nav";
import { PublishImpactDialog } from "@/components/admin/PublishImpactDialog";
import { usePublishImpact } from "@/hooks/use-publish-impact";
import { useModules, createModule, deleteModule, setModulePublished, CATEGORY_OPTIONS } from "@/lib/training-store";
import { ROLE_LABEL } from "@/lib/user-mock";
import { useManageLock, ManageLockedPanel } from "@/components/admin/manage-lock";
import { SkeletonList } from "@/components/ui/skeleton-blocks";
import { StatePanel } from "@/components/ui/state-panel";
import { useInitialLoad } from "@/hooks/use-initial-load";

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(CATEGORY_OPTIONS.map((c) => [c.value, c.label]));

const PER_PAGE = 8;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminTrainingPage() {
  const { headerClassName, onScroll } = useGlassHeader();
  const loading = useInitialLoad("admin-modules");
  const router = useRouter();
  const modules = useModules();
  const { locked } = useManageLock();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [requirementFilter, setRequirementFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortCol, setSortCol] = useState<"title" | "lastModified">("lastModified");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [newOpen, setNewOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [unpublishId, setUnpublishId] = useState<string | null>(null);
  const [publishId, setPublishId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const rowStyle = useRowStagger("admin-modules");

  // Deep link from the Home quick actions: ?new=1 opens the name prompt.
  const newParam = useSearchParams().get("new");
  useEffect(() => { if (newParam === "1") setNewOpen(true); }, [newParam]);

  // Any filter/search/sort change resets to the first page so results stay in view.
  function resetPage<T>(set: (v: T) => void) {
    return (v: T) => { set(v); setPage(1); };
  }
  function handleSort(col: "title" | "lastModified") {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
    setPage(1);
  }

  const q = query.trim().toLowerCase();
  const rows = useMemo(() => {
    const list = modules.filter((m) => {
      if (q && !m.title.toLowerCase().includes(q)) return false;
      if (categoryFilter && m.category !== categoryFilter) return false;
      if (requirementFilter && (requirementFilter === "required") !== m.required) return false;
      if (roleFilter && !m.roles.includes(roleFilter as (typeof m.roles)[number])) return false;
      if (statusFilter && (statusFilter === "published") !== (m.published !== false)) return false;
      return true;
    });
    const mul = sortDir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      if (sortCol === "title") return mul * a.title.localeCompare(b.title);
      return mul * ((a.lastModified ?? a.assignedDate) > (b.lastModified ?? b.assignedDate) ? 1 : -1);
    });
  }, [modules, q, categoryFilter, requirementFilter, roleFilter, statusFilter, sortCol, sortDir]);
  const deleting = modules.find((m) => m.id === deleteId);
  const unpublishing = modules.find((m) => m.id === unpublishId);
  const publishing = modules.find((m) => m.id === publishId);
  const impact = usePublishImpact(publishing?.roles);

  /* Publishing a REQUIRED module assigns it to every guard in its roles and
     starts each one's clearance deadline (D11), so it asks first. An optional
     module publishes straight away — no workforce consequence. */
  function requestPublish(m: { id: string; required?: boolean }) {
    if (m.required) {
      setPublishId(m.id);
      return;
    }
    doPublish(m.id);
  }
  function doPublish(id: string) {
    const title = modules.find((x) => x.id === id)?.title ?? "This module";
    setModulePublished(id, true);
    showToast({
      title: "Published",
      description: `"${title}" is now visible to learners.`,
      action: { label: "Undo", onClick: () => setModulePublished(id, false) },
    });
  }

  const totalPages = Math.ceil(rows.length / PER_PAGE);
  const safePage = Math.min(page, totalPages || 1);
  const paginated = rows.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  // Per-row actions menu — shared by the desktop table and the mobile card so
  // Edit/Publish/Delete stay reachable on a phone. The stopPropagation wrapper
  // keeps a menu click from also opening the row's preview.
  type ModuleRow = (typeof paginated)[number];
  function rowActions(m: ModuleRow) {
    return (
      <div onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors duration-100" aria-label="Actions">
              <MoreHorizontal size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem onSelect={() => router.push(`/admin/content/training/${m.id}`)}><Pencil size={16} strokeWidth={1.5} /> Edit</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => router.push(withReturn(`/admin/content/training/${m.id}/preview`, "/admin/content/training"))}><Eye size={16} strokeWidth={1.5} /> Preview</DropdownMenuItem>
            {m.published !== false ? (
              <DropdownMenuItem onSelect={() => setUnpublishId(m.id)}><EyeOff size={16} strokeWidth={1.5} /> Unpublish</DropdownMenuItem>
            ) : (
              <DropdownMenuItem disabled={(m.chapters ?? 0) === 0} onSelect={() => requestPublish(m)}><Send size={16} strokeWidth={1.5} /> Publish</DropdownMenuItem>
            )}
            <DropdownMenuItem variant="destructive" onSelect={() => setDeleteId(m.id)}><Trash2 size={16} strokeWidth={1.5} /> Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
      <PageHeader crumbs={[{ label: "Content" }, { label: "Modules" }]} className={headerClassName} />

      <ScrollCanvas onScroll={onScroll}>
        <div className="container-wide pt-8 pb-12 flex flex-col gap-6 min-h-full">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex flex-col gap-1">
              <h1 className="type-h1 font-bold text-foreground">Modules</h1>
              <p className="type-label text-muted-foreground">Training modules and their chapters. Publish one to assign it to a role.</p>
            </div>
            {!locked && (
            <Button size="cta" onClick={() => setNewOpen(true)}>
              <FilePlus2 size={16} strokeWidth={1.5} /> New module
            </Button>
            )}
          </div>

          {/* Locked: the screen keeps its identity above, and its working
              surface becomes one statement plus the one useful action. */}
          {locked ? (
            <ManageLockedPanel task="managing training modules" />
          ) : loading ? (
            /* First load of the session only — a real backend's latency drives
               this later. Mirrors the toolbar + rows + pagination shape. */
            <SkeletonList filters={2} />
          ) : (
            <>

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <SearchInput value={query} onChange={resetPage(setQuery)} placeholder="Search modules" className="w-full sm:w-[280px]" />
            <div className="flex items-center gap-2 flex-wrap">
              <FilterSelect value={categoryFilter} onChange={resetPage(setCategoryFilter)} options={CATEGORY_OPTIONS} placeholder="All categories" />
              <FilterSelect value={requirementFilter} onChange={resetPage(setRequirementFilter)} options={[{ value: "required", label: "Required" }, { value: "optional", label: "Optional" }]} placeholder="All requirements" />
              <FilterSelect value={roleFilter} onChange={resetPage(setRoleFilter)} options={[{ value: "field-agent", label: "Field Agent" }, { value: "admin", label: "Admin" }]} placeholder="All roles" />
              <FilterSelect value={statusFilter} onChange={resetPage(setStatusFilter)} options={[{ value: "published", label: "Published" }, { value: "draft", label: "Draft" }]} placeholder="All statuses" />
            </div>
          </div>

          {/* The shared centred panel. These five lists each had their own
              bordered well at 14/20 — the sixth, seventh and eighth variants
              of a state the rest of the product already renders one way. */}

          {rows.length === 0 ? (
            <StatePanel description={q ? "No modules match that search." : "No modules yet. Create one with New module."} />
          ) : (
            <>
              {/* Desktop: full column table */}
              <Table className="hidden md:block">
                <TableHeader>
                  <TableHead className="flex-1" sortDir={sortCol === "title" ? sortDir : null} onSort={() => handleSort("title")}>Module</TableHead>
                  <TableHead className="w-[100px]">Category</TableHead>
                  <TableHead className="w-[104px]">Requirement</TableHead>
                  <TableHead className="w-[104px]">Roles</TableHead>
                  <TableHead className="w-[104px]">Status</TableHead>
                  <TableHead className="w-[112px]" sortDir={sortCol === "lastModified" ? sortDir : null} onSort={() => handleSort("lastModified")}>Last modified</TableHead>
                  <TableHead className="w-8"><span className="sr-only">Actions</span></TableHead>
                </TableHeader>
                <TableBody>
                  {paginated.map((m, i) => (
                    <TableRow key={m.id} onClick={() => router.push(`/admin/content/training/${m.id}`)} style={rowStyle(i)}>
                      <TableCell className="flex-1 min-w-0 font-medium"><span className="block truncate">{m.title}</span></TableCell>
                      <TableCell className="w-[100px] text-muted-foreground">{CATEGORY_LABEL[m.category] ?? m.category}</TableCell>
                      <TableCell className="w-[104px] text-muted-foreground">{m.required ? "Required" : "Optional"}</TableCell>
                      <TableCell className="w-[104px] text-muted-foreground truncate">{m.roles.map((r) => ROLE_LABEL[r]).join(", ")}</TableCell>
                      <TableCell className="w-[104px]"><PublishBadge published={m.published !== false} /></TableCell>
                      <TableCell className="w-[112px] text-muted-foreground">{formatDate(m.lastModified ?? m.assignedDate)}</TableCell>
                      <TableCell className="w-8">{rowActions(m)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Mobile: module title over a category · requirement · date meta
                  line; publish badge + actions menu in the trailing slot. Roles
                  are relegated to the edit screen on a phone. */}
              <Table className="md:hidden">
                <TableBody>
                  {paginated.map((m, i) => (
                    <TableCard
                      key={m.id}
                      onClick={() => router.push(`/admin/content/training/${m.id}`)}
                      style={rowStyle(i)}
                      title={m.title}
                      meta={<TableCardMeta>{CATEGORY_LABEL[m.category] ?? m.category} · {m.required ? "Required" : "Optional"} · {formatDate(m.lastModified ?? m.assignedDate)}</TableCardMeta>}
                      trailing={
                        <>
                          <PublishBadge published={m.published !== false} />
                          {rowActions(m)}
                        </>
                      }
                    />
                  ))}
                </TableBody>
              </Table>
            </>
          )}

          <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
            </>
          )}
        </div>
      </ScrollCanvas>

      {newOpen && (
        <NamePromptModal
          title="New module"
          label="Module title"
          submitLabel="Create"
          onSubmit={(value) => { const id = createModule(value); router.push(`/admin/content/training/${id}?new=1`); }}
          onClose={() => setNewOpen(false)}
        />
      )}

      <ExitConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete module?"
        description={`This removes "${deleting?.title ?? "this module"}" and its chapters. This can't be undone.`}
        exitLabel="Delete module"
        cancelLabel="Keep module"
        onExit={() => { if (deleteId) deleteModule(deleteId); setDeleteId(null); }}
      />

      <ExitConfirmDialog
        open={!!unpublishId}
        onOpenChange={(o) => !o && setUnpublishId(null)}
        title={`Unpublish "${unpublishing?.title ?? "this module"}"?`}
        description="It will no longer be visible to learners until you publish it again."
        exitLabel="Unpublish"
        cancelLabel="Cancel"
        onExit={() => {
          if (unpublishing) {
            const m = unpublishing;
            setModulePublished(m.id, false);
            showToast({ title: "Moved to draft", description: `"${m.title}" is no longer visible to learners.`, action: { label: "Undo", onClick: () => setModulePublished(m.id, true) } });
          }
          setUnpublishId(null);
        }}
      />

      {/* Required training lands on the whole workforce — say so before it does. */}
      <PublishImpactDialog
        open={!!publishId}
        onOpenChange={(o) => !o && setPublishId(null)}
        moduleTitle={publishing?.title ?? "This module"}
        roleLabel={impact.roleLabel}
        affected={impact.affected}
        clearedNow={impact.clearedNow}
        onPublish={() => {
          if (publishId) doPublish(publishId);
          setPublishId(null);
        }}
      />
    </div>
  );
}
