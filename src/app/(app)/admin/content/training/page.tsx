"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FilePlus2, Eye, EyeOff, Pencil, Trash2, Send } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { SearchInput } from "@/components/ui/search-input";
import { DataTable, DataCards, NotApplicable, defineActions, defineColumns, sortRows, type SortState } from "@/components/ui/data-list";
import { SortButton } from "@/components/ui/sort-button";
import { Pagination } from "@/components/ui/pagination";
import { useRowStagger } from "@/hooks/use-entrance";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
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
import { useModules, createModule, deleteModule, setModulePublished, CATEGORY_OPTIONS, type AdminModule } from "@/lib/training-store";
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

/**
 * The Modules list, defined once — same shape as People.
 *
 * `lastModified` is labelled "Updated" and no longer falls back to
 * `assignedDate`. Those are two different facts, and one heading over both
 * meant the column restated the assignment date for every module nobody had
 * edited. A module never edited now says so.
 *
 * Roles is a card pair rather than the hidden column it used to be. It is one
 * short string, the card already carries three other pairs, and an expander
 * would be a second disclosure when the editor is one tap away.
 */
const COLUMNS = defineColumns<AdminModule>([
  {
    key: "title",
    label: "Module",
    sortValue: (m) => m.title,
    mobile: "identity",
    render: (m) => <span className="block truncate font-medium">{m.title}</span>,
  },
  {
    key: "category",
    label: "Category",
    width: "narrow",
    mobile: "pair",
    render: (m) => (
      <span className="text-muted-foreground">{CATEGORY_LABEL[m.category] ?? m.category}</span>
    ),
  },
  {
    key: "requirement",
    label: "Requirement",
    width: "narrow",
    mobile: "pair",
    render: (m) => <span className="text-muted-foreground">{m.required ? "Required" : "Optional"}</span>,
  },
  {
    key: "roles",
    label: "Roles",
    width: "narrow",
    // Was dropped from the card entirely — the one silently hidden column in
    // the whole product. It is a pair now.
    mobile: "pair",
    render: (m) => (
      <span className="text-muted-foreground truncate">
        {m.roles.map((r) => ROLE_LABEL[r]).join(", ")}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    width: "narrow",
    mobile: "trailing",
    render: (m) => <PublishBadge published={m.published !== false} />,
  },
  {
    key: "lastModified",
    label: "Updated",
    width: "date",
    sortValue: (m) => m.lastModified,
    sortKind: "date",
    mobile: "pair",
    render: (m) =>
      m.lastModified ? (
        <span className="text-muted-foreground">{formatDate(m.lastModified)}</span>
      ) : (
        <NotApplicable reason="Never modified" />
      ),
  },
]);

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
  const [sort, setSort] = useState<SortState>({ key: "lastModified", dir: "desc" });
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
  function handleSort(key: string) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
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
    // The shared comparator: never-modified modules sort last in BOTH
    // directions, which the old `?? assignedDate` fallback hid by giving
    // every module a date.
    return sortRows(list, COLUMNS, sort);
  }, [modules, q, categoryFilter, requirementFilter, roleFilter, statusFilter, sort]);
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
  /* The MENU only. The trigger, its 44px target, its focus ring and its
     accessible name belong to `DataTable`/`DataCards` — see RowActions. */
  const rowActions = defineActions<ModuleRow>({
    name: (m) => `Actions for ${m.title}`,
    items: (m) => (
      <>
        <DropdownMenuItem onSelect={() => router.push(`/admin/content/training/${m.id}`)}><Pencil size={16} strokeWidth={1.5} /> Edit</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push(withReturn(`/admin/content/training/${m.id}/preview`, "/admin/content/training"))}><Eye size={16} strokeWidth={1.5} /> Preview</DropdownMenuItem>
        {m.published !== false ? (
          <DropdownMenuItem onSelect={() => setUnpublishId(m.id)}><EyeOff size={16} strokeWidth={1.5} /> Unpublish</DropdownMenuItem>
        ) : (
          <DropdownMenuItem disabled={(m.chapters ?? 0) === 0} onSelect={() => requestPublish(m)}><Send size={16} strokeWidth={1.5} /> Publish</DropdownMenuItem>
        )}
        <DropdownMenuItem variant="destructive" onSelect={() => setDeleteId(m.id)}><Trash2 size={16} strokeWidth={1.5} /> Delete</DropdownMenuItem>
      </>
    ),
  });

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
              <SortButton
                columns={COLUMNS}
                sort={sort}
                onChange={(next) => { setSort(next); setPage(1); }}
                className="md:hidden"
              />
            </div>
          </div>

          {/* The shared centred panel. These five lists each had their own
              bordered well at 14/20 — the sixth, seventh and eighth variants
              of a state the rest of the product already renders one way. */}

          {rows.length === 0 ? (
            <StatePanel description={q ? "No modules match that search." : "No modules yet. Create one with New module."} />
          ) : (
            <>
              <DataTable
                className="hidden md:block"
                rows={paginated}
                columns={COLUMNS}
                rowKey={(m) => m.id}
                rowHref={(m) => `/admin/content/training/${m.id}`}
                sort={sort}
                onSort={handleSort}
                rowStyle={rowStyle}
                actions={rowActions}
              />
              <DataCards
                className="md:hidden"
                label="Training modules"
                rows={paginated}
                columns={COLUMNS}
                rowKey={(m) => m.id}
                rowHref={(m) => `/admin/content/training/${m.id}`}
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
