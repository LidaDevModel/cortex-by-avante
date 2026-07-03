"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, FileText, LayoutGrid } from "lucide-react";
import { PageHeader, DetailHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { SplitPanel } from "@/components/ui/split-panel";
import { Highlight } from "@/components/ui/highlight";
import { DocumentToolbar } from "@/components/ui/document-toolbar";
import { getDocById, type TocSection } from "@/lib/library-mock";

/* ─── Helpers ─── */

function countOccurrences(text: string, query: string): number {
  if (!query) return 0;
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  let count = 0;
  let idx = 0;
  while ((idx = lower.indexOf(q, idx)) !== -1) {
    count++;
    idx += q.length;
  }
  return count;
}

/* ─── Table of contents ─── */

function TableOfContents({
  sections,
  allSections,
  activeId,
  onSelect,
  matchCounts,
}: {
  sections: TocSection[];
  allSections: TocSection[];
  activeId: string;
  onSelect: (id: string) => void;
  matchCounts: Record<string, number>;
}) {
  return (
    <div className="flex flex-col">
      {sections.map((s) => {
        const isActive = s.id === activeId;
        const count = matchCounts[s.id] ?? 0;
        return (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className="w-full flex items-center justify-between gap-3 px-2 py-2 rounded-[6px] text-left transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2"
            style={{ background: isActive ? "var(--nav-active)" : "transparent" }}
          >
            <span
              className="text-[14px] leading-[20px] truncate flex-1 min-w-0"
              style={{
                fontWeight: isActive ? 500 : 400,
                color: isActive ? "var(--primary)" : "var(--foreground)",
              }}
            >
              {s.num}.{"  "}{s.title}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              {count > 0 && (
                <span
                  className="text-[11px] font-semibold px-[6px] py-[1px] rounded-[4px] tabular-nums"
                  style={{
                    background: "rgba(212, 236, 147, 0.5)",
                    color: "var(--primary)",
                  }}
                >
                  {count}
                </span>
              )}
              <span
                className="text-[12px] tabular-nums"
                style={{ color: isActive ? "var(--primary)" : "var(--muted-foreground)" }}
              >
                {s.page}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Document canvas ─── */

function DocumentPage({
  sections,
  activeId,
  findQuery,
  zoom,
}: {
  sections: TocSection[];
  activeId: string;
  findQuery: string;
  zoom: number;
}) {
  const q = findQuery.trim().toLowerCase();
  const canvasBg = "#f0f0f0";

  const PAGE_W = 560;
  const PAGE_H = Math.round(PAGE_W * 297 / 210);
  const scale = zoom / 100;
  const scaledW = Math.round(PAGE_W * scale);
  const scaledH = Math.round(PAGE_H * scale);

  const scrollRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const el = pageRefs.current[activeId];
    const container = scrollRef.current;
    if (!el || !container) return;
    container.scrollTo({ top: el.offsetTop - 32, behavior: "smooth" });
  }, [activeId]);

  return (
    <div className="relative flex-1 overflow-hidden" style={{ background: canvasBg }}>
      <div className="absolute top-0 inset-x-0 h-8 pointer-events-none z-10"
        style={{ background: `linear-gradient(to bottom, ${canvasBg}, transparent)` }} />
      <div className="absolute bottom-0 inset-x-0 h-12 pointer-events-none z-10"
        style={{ background: `linear-gradient(to top, ${canvasBg}, transparent)` }} />
      <div ref={scrollRef} className="absolute inset-0 overflow-y-auto overflow-x-auto scroll-thin">
        <div className="flex flex-col items-center gap-4 py-8" style={{ minWidth: scaledW + 48 }}>
          {sections.map((s) => {
            const isActive = s.id === activeId;
            return (
              <div
                key={s.id}
                ref={el => { pageRefs.current[s.id] = el; }}
                style={{ width: scaledW, height: scaledH, flexShrink: 0 }}
              >
                <div
                  className="bg-white shadow-[0px_4px_20px_0px_rgba(0,0,0,0.08)] flex flex-col"
                  style={{
                    width: PAGE_W,
                    height: PAGE_H,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                    padding: "48px 40px",
                  }}
                >
                  <div className="mb-5">
                    <h2
                      className="inline font-semibold leading-[1.4] text-[16px]"
                      style={{
                        color: "var(--primary)",
                        ...(isActive && {
                          background: "rgba(212, 236, 147, 0.3)",
                          borderRadius: 4,
                          padding: "2px 4px",
                        }),
                      }}
                    >
                      <Highlight text={`${s.num}.  ${s.title}`} query={q} />
                    </h2>
                  </div>
                  <p className="text-[13px] leading-[1.75]" style={{ color: "#333" }}>
                    <Highlight text={s.body} query={q} />
                  </p>
                  <div className="mt-auto pt-6 flex justify-end">
                    <span className="text-[10px]" style={{ color: "#aaa" }}>{s.page}</span>
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{ height: 32 }} />
        </div>
      </div>
    </div>
  );
}

/* ─── Icon button ─── */

function IconButton({
  onClick,
  active,
  children,
  position,
  title,
}: {
  onClick?: () => void;
  active?: boolean;
  children: React.ReactNode;
  position?: "left" | "right" | "solo";
  title?: string;
}) {
  const radius =
    position === "left" ? "rounded-l-[10px]"
    : position === "right" ? "rounded-r-[10px]"
    : "rounded-[10px]";

  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex items-center justify-center size-10 border transition-colors duration-100 hover:bg-[var(--surface-raised)] ${radius} ${active ? "border-r-0" : ""}`}
      style={{
        background: active ? "var(--accent-subtle)" : "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      {children}
    </button>
  );
}

/* ─── Page ─── */

export default function FileViewPage() {
  const { id } = useParams<{ id: string }>();
  const result = getDocById(id);

  const [tocFilter, setTocFilter] = useState("");
  const [zoom, setZoom] = useState(75);
  const [viewMode, setViewMode] = useState<"single" | "grid">("single");

  // Find in document
  const [findOpen, setFindOpen] = useState(false);
  const [findQuery, setFindQuery] = useState("");
  const [findMatchIdx, setFindMatchIdx] = useState(0);

  const sections = result?.doc.toc ?? [];
  const [activeId, setActiveId] = useState(() => sections[0]?.id ?? "");

  // TOC: filter by section title only
  const filteredToc = useMemo(() => {
    const q = tocFilter.trim().toLowerCase();
    return q ? sections.filter(s => s.title.toLowerCase().includes(q)) : sections;
  }, [sections, tocFilter]);

  // Find: sections containing the query in title or body
  const findMatchSections = useMemo(() => {
    const q = findQuery.trim().toLowerCase();
    if (!q) return [];
    return sections.filter(s =>
      s.title.toLowerCase().includes(q) || s.body.toLowerCase().includes(q)
    );
  }, [sections, findQuery]);

  // Total text occurrences for the counter
  const totalFindCount = useMemo(() => {
    const q = findQuery.trim().toLowerCase();
    if (!q) return 0;
    return sections.reduce((sum, s) => sum + countOccurrences(s.title + " " + s.body, q), 0);
  }, [sections, findQuery]);

  // Per-section occurrence count for TOC badges
  const matchCountBySectionId = useMemo<Record<string, number>>(() => {
    const q = findQuery.trim().toLowerCase();
    if (!q) return {};
    return Object.fromEntries(
      sections.map(s => [s.id, countOccurrences(s.title + " " + s.body, q)])
    );
  }, [sections, findQuery]);

  // Sync active page to current find match
  useEffect(() => {
    if (findQuery.trim() && findMatchSections.length > 0) {
      const clamped = Math.min(findMatchIdx, findMatchSections.length - 1);
      setActiveId(findMatchSections[clamped].id);
    }
  }, [findMatchIdx, findMatchSections, findQuery]);

  // Reset match index when query changes
  useEffect(() => {
    setFindMatchIdx(0);
  }, [findQuery]);

  // Cmd+F / Ctrl+F → open find
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        setFindOpen(true);
      }
      if (e.key === "Escape" && findOpen) {
        setFindOpen(false);
        setFindQuery("");
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [findOpen]);

  const closeFindBar = useCallback(() => {
    setFindOpen(false);
    setFindQuery("");
  }, []);

  const goFindPrev = useCallback(() => {
    if (findMatchSections.length === 0) return;
    setFindMatchIdx(i => (i - 1 + findMatchSections.length) % findMatchSections.length);
  }, [findMatchSections.length]);

  const goFindNext = useCallback(() => {
    if (findMatchSections.length === 0) return;
    setFindMatchIdx(i => (i + 1) % findMatchSections.length);
  }, [findMatchSections.length]);

  // Page nav uses all sections
  const activeIndex = sections.findIndex(s => s.id === activeId);
  const canPrev = activeIndex > 0;
  const canNext = activeIndex < sections.length - 1;

  if (!result) {
    return (
      <div className="flex flex-col h-full overflow-hidden" style={{ background: "var(--surface)" }}>
        <PageHeader crumbs={[{ label: "Library", href: "/library" }, { label: "File" }]} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[14px] text-muted-foreground">Document not found.</p>
        </div>
      </div>
    );
  }

  const { doc, folder } = result;
  const pageCount = parseInt(doc.content) || sections.length;

  const leftPanel = (
    <>
      <div className="px-8 py-3 shrink-0">
        <SearchInput
          value={tocFilter}
          onChange={setTocFilter}
          placeholder="Jump to section..."
        />
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-6 scroll-thin">
        {filteredToc.length > 0 ? (
          <TableOfContents
            sections={filteredToc}
            allSections={sections}
            activeId={activeId}
            onSelect={setActiveId}
            matchCounts={matchCountBySectionId}
          />
        ) : tocFilter ? (
          <p className="text-[13px] text-muted-foreground px-2 py-4">No sections found.</p>
        ) : (
          <p className="text-[13px] text-muted-foreground px-2 py-4">No table of contents available.</p>
        )}
      </div>
    </>
  );

  const rightPanel = (
    <div className="flex flex-col flex-1 overflow-hidden">
      <DocumentToolbar
        findOpen={findOpen}
        onFindToggle={() => setFindOpen(o => !o)}
        findQuery={findQuery}
        onFindChange={setFindQuery}
        onFindClose={closeFindBar}
        onFindPrev={goFindPrev}
        onFindNext={goFindNext}
        findMatchCount={findMatchSections.length}
        findTotalCount={totalFindCount}
        findMatchIdx={findMatchIdx}
        findEntityLabel="sections"
        right={
          <>
            {/* Zoom */}
            <div className="flex items-center gap-3">
              <span className="text-[14px] text-muted-foreground tabular-nums w-10 text-right">
                {zoom}%
              </span>
              <div className="flex">
                <IconButton position="left" onClick={() => setZoom(z => Math.max(50, z - 25))}>
                  <ZoomOut size={15} strokeWidth={1.5} className="text-foreground" />
                </IconButton>
                <IconButton position="right" onClick={() => setZoom(z => Math.min(200, z + 25))}>
                  <ZoomIn size={15} strokeWidth={1.5} className="text-foreground" />
                </IconButton>
              </div>
            </div>

            {/* Page nav */}
            <div className="flex items-center gap-3">
              <span className="text-[14px] text-muted-foreground">
                Page{" "}
                <span className="text-[16px] text-foreground">{Math.max(1, activeIndex + 1)}</span>
                {" "}/ {pageCount}
              </span>
              <div className="flex">
                <IconButton position="left" onClick={() => canPrev && setActiveId(sections[activeIndex - 1].id)}>
                  <ChevronLeft size={15} strokeWidth={1.5} className={canPrev ? "text-foreground" : "text-muted-foreground"} />
                </IconButton>
                <IconButton position="right" onClick={() => canNext && setActiveId(sections[activeIndex + 1].id)}>
                  <ChevronRight size={15} strokeWidth={1.5} className={canNext ? "text-foreground" : "text-muted-foreground"} />
                </IconButton>
              </div>
            </div>

            {/* View toggle */}
            <div className="flex">
              <IconButton position="left" active={viewMode === "single"} onClick={() => setViewMode("single")}>
                <FileText size={15} strokeWidth={1.5} className="text-foreground" />
              </IconButton>
              <IconButton position="right" active={viewMode === "grid"} onClick={() => setViewMode("grid")}>
                <LayoutGrid size={15} strokeWidth={1.5} className="text-foreground" />
              </IconButton>
            </div>
          </>
        }
      />

      {/* Document canvas */}
      {viewMode === "single" ? (
        <DocumentPage
          sections={sections}
          activeId={activeId}
          findQuery={findQuery}
          zoom={zoom}
        />
      ) : (
        <div className="flex-1 overflow-y-auto p-8 scroll-thin" style={{ background: "#f0f0f0" }}>
          <div className="grid grid-cols-3 gap-4 max-w-[800px] mx-auto">
            {sections.map((s, i) => (
              <button
                key={s.id}
                onClick={() => { setActiveId(s.id); setViewMode("single"); }}
                className="bg-white rounded-[8px] text-left shadow-[0px_2px_8px_0px_rgba(0,0,0,0.06)] hover:shadow-[0px_4px_16px_0px_rgba(0,0,0,0.10)] transition-shadow duration-150 flex flex-col p-4 overflow-hidden"
                style={{
                  aspectRatio: "210 / 297",
                  outline: s.id === activeId ? "2px solid var(--primary)" : "none",
                }}
              >
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide shrink-0">
                  Page {i + 1}
                </span>
                <span className="text-[12px] font-semibold leading-[16px] mt-2 shrink-0" style={{ color: "var(--primary)" }}>
                  {s.num}. {s.title}
                </span>
                <p className="text-[10px] leading-[1.6] text-muted-foreground mt-2 line-clamp-[8]">{s.body}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: "var(--surface)" }}>
      <PageHeader
        crumbs={[
          { label: "Library", href: "/library" },
          { label: folder.name, href: `/library/folders/${folder.id}` },
          { label: doc.name },
        ]}
      />

      <div className="shrink-0 px-8 pt-5 pb-4 flex flex-col gap-2" style={{ borderBottom: "1px solid var(--border)" }}>
        <DetailHeader
          backHref={`/library/folders/${folder.id}`}
          backLabel="Back to folder"
          title={doc.name}
          meta={doc.content}
          className="[&_h1]:text-[22px] [&_h1]:leading-[30px]"
        />
      </div>

      <SplitPanel leftWidth={280} left={leftPanel} right={rightPanel} />
    </div>
  );
}
