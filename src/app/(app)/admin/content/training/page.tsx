"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MoreHorizontal, FilePlus2, EyeOff, Pencil, Trash2, Send } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { SearchInput } from "@/components/ui/search-input";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell, type SortDir } from "@/components/ui/table";
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
import { useModules, createModule, deleteModule, setModulePublished, CATEGORY_OPTIONS } from "@/lib/training-store";
import { ROLE_LABEL } from "@/lib/user-mock";

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(CATEGORY_OPTIONS.map((c) => [c.value, c.label]));

const PER_PAGE = 8;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminTrainingPage() {
  const { headerClassName, onScroll } = useGlassHeader();
  const router = useRouter();
  const modules = useModules();
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

  const totalPages = Math.ceil(rows.length / PER_PAGE);
  const safePage = Math.min(page, totalPages || 1);
  const paginated = rows.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  return (
    <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
      <PageHeader crumbs={[{ label: "Admin", href: "/admin" }, { label: "Content", href: "/admin/content" }, { label: "Modules" }]} className={headerClassName} />

      <ScrollCanvas onScroll={onScroll}>
        <div className="max-w-[920px] mx-auto px-4 sm:px-8 pt-8 pb-12 flex flex-col gap-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h1 className="text-[22px] leading-[30px] sm:text-[28px] sm:leading-[36px] font-bold text-foreground">Modules</h1>
            <Button size="cta" onClick={() => setNewOpen(true)}>
              <FilePlus2 size={16} strokeWidth={1.5} /> New module
            </Button>
          </div>

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <SearchInput value={query} onChange={resetPage(setQuery)} placeholder="Search modules" className="w-full sm:w-[280px]" />
            <div className="flex items-center gap-2 flex-wrap">
              <FilterSelect value={categoryFilter} onChange={resetPage(setCategoryFilter)} options={CATEGORY_OPTIONS} placeholder="All categories" />
              <FilterSelect value={requirementFilter} onChange={resetPage(setRequirementFilter)} options={[{ value: "required", label: "Required" }, { value: "optional", label: "Optional" }]} placeholder="All requirements" />
              <FilterSelect value={roleFilter} onChange={resetPage(setRoleFilter)} options={[{ value: "field-agent", label: "Field Agent" }, { value: "admin", label: "Admin" }]} placeholder="All roles" />
              <FilterSelect value={statusFilter} onChange={resetPage(setStatusFilter)} options={[{ value: "published", label: "Published" }, { value: "draft", label: "Draft" }]} placeholder="All statuses" />
            </div>
          </div>

          {rows.length === 0 ? (
            <div className="rounded-[12px] p-10 text-center bg-surface-raised" style={{ border: "1px solid var(--border)" }}>
              <p className="text-[14px] leading-[20px] text-muted-foreground">{q ? "No modules match that search." : "No modules yet. Create one with New module."}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableHead className="flex-1" sortDir={sortCol === "title" ? sortDir : null} onSort={() => handleSort("title")}>Module</TableHead>
                <TableHead className="w-[96px]">Category</TableHead>
                <TableHead className="w-[110px]">Requirement</TableHead>
                <TableHead className="w-[150px]">Roles</TableHead>
                <TableHead className="w-[88px]">Status</TableHead>
                <TableHead className="w-[128px]" sortDir={sortCol === "lastModified" ? sortDir : null} onSort={() => handleSort("lastModified")}>Last modified</TableHead>
                <TableHead className="w-8"><span className="sr-only">Actions</span></TableHead>
              </TableHeader>
              <TableBody>
                {paginated.map((m, i) => (
                  <TableRow key={m.id} onClick={() => window.open(`/admin/content/training/${m.id}/preview`, "_blank")} style={rowStyle(i)}>
                    <TableCell className="flex-1 min-w-0 font-medium"><span className="block truncate">{m.title}</span></TableCell>
                    <TableCell className="w-[96px] text-muted-foreground">{CATEGORY_LABEL[m.category] ?? m.category}</TableCell>
                    <TableCell className="w-[110px] text-muted-foreground">{m.required ? "Required" : "Optional"}</TableCell>
                    <TableCell className="w-[150px] text-muted-foreground truncate">{m.roles.map((r) => ROLE_LABEL[r]).join(", ")}</TableCell>
                    <TableCell className="w-[88px]"><PublishBadge published={m.published !== false} /></TableCell>
                    <TableCell className="w-[128px] text-muted-foreground">{formatDate(m.lastModified ?? m.assignedDate)}</TableCell>
                    <TableCell className="w-8">
                      <div onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors duration-100" aria-label="Actions">
                              <MoreHorizontal size={16} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[160px]">
                            <DropdownMenuItem onSelect={() => router.push(`/admin/content/training/${m.id}`)}><Pencil size={16} strokeWidth={1.5} /> Edit</DropdownMenuItem>
                            {m.published !== false ? (
                              <DropdownMenuItem onSelect={() => setUnpublishId(m.id)}><EyeOff size={16} strokeWidth={1.5} /> Unpublish</DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem disabled={(m.chapters ?? 0) === 0} onSelect={() => { setModulePublished(m.id, true); showToast({ title: "Published", description: `"${m.title}" is now visible to learners.`, action: { label: "Undo", onClick: () => setModulePublished(m.id, false) } }); }}><Send size={16} strokeWidth={1.5} /> Publish</DropdownMenuItem>
                            )}
                            <DropdownMenuItem variant="destructive" onSelect={() => setDeleteId(m.id)}><Trash2 size={16} strokeWidth={1.5} /> Delete</DropdownMenuItem>
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
        exitLabel="Delete"
        cancelLabel="Cancel"
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
    </div>
  );
}
