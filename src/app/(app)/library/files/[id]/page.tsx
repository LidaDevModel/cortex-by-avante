"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, FileText, LayoutGrid } from "lucide-react";
import { PageHeader, DetailHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { SplitPanel } from "@/components/ui/split-panel";
import { Highlight } from "@/components/ui/highlight";
import { DocumentToolbar } from "@/components/ui/document-toolbar";
import { getDocById, type TocSection, type SubSection } from "@/lib/library-mock";

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
    <div className="flex flex-col gap-0.5">
      {sections.map((s) => {
        const isActive = s.id === activeId;
        const count = matchCounts[s.id] ?? 0;
        const hasSubs = (s.subsections?.length ?? 0) > 0;
        return (
          <div key={s.id}>
            {/* Section row */}
            <button
              onClick={() => onSelect(s.id)}
              className="w-full flex items-center justify-between gap-3 px-2 py-[7px] rounded-[6px] text-left transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2"
              style={{ background: isActive ? "var(--nav-active)" : "transparent" }}
            >
              {/* Number chip */}
              <span
                className="shrink-0 text-[10px] font-semibold tabular-nums w-5 text-center leading-[1]"
                style={{ color: isActive ? "var(--primary)" : "var(--muted-foreground)" }}
              >
                {s.num}
              </span>
              <span
                className="text-[13px] leading-[18px] truncate flex-1 min-w-0"
                style={{
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "var(--primary)" : "var(--foreground)",
                }}
              >
                {s.title}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                {count > 0 && (
                  <span
                    className="text-[10px] font-semibold px-[5px] py-[1px] rounded-[3px] tabular-nums"
                    style={{ background: "rgba(212, 236, 147, 0.5)", color: "var(--primary)" }}
                  >
                    {count}
                  </span>
                )}
                <span
                  className="text-[11px] tabular-nums w-4 text-right"
                  style={{ color: isActive ? "var(--primary)" : "var(--muted-foreground)" }}
                >
                  {s.page}
                </span>
              </div>
            </button>

            {/* Sub-sections */}
            {hasSubs && (
              <div className="flex flex-col ml-7 mb-1">
                {s.subsections!.map((sub, subIdx) => {
                  const subNum = `${s.num}.${subIdx + 1}`;
                  const subActive = sub.id === activeId;
                  const subCount = matchCounts[sub.id] ?? 0;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => onSelect(sub.id)}
                      className="w-full flex items-center gap-2 px-2 py-[5px] rounded-[5px] text-left transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2"
                      style={{ background: subActive ? "var(--nav-active)" : "transparent" }}
                    >
                      <span
                        className="shrink-0 text-[10px] tabular-nums w-6 leading-[1]"
                        style={{ color: subActive ? "var(--primary)" : "var(--muted-foreground)", fontWeight: subActive ? 600 : 400 }}
                      >
                        {subNum}
                      </span>
                      <span
                        className="text-[12px] leading-[17px] truncate flex-1 min-w-0"
                        style={{
                          fontWeight: subActive ? 600 : 400,
                          color: subActive ? "var(--primary)" : "var(--muted-foreground)",
                        }}
                      >
                        {sub.title}
                      </span>
                      {subCount > 0 && (
                        <span
                          className="text-[10px] font-semibold px-[5px] py-[1px] rounded-[3px] tabular-nums shrink-0"
                          style={{ background: "rgba(212, 236, 147, 0.5)", color: "var(--primary)" }}
                        >
                          {subCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Document canvas ─── */

function DocumentPage({
  sections,
  activeId,
  onActiveChange,
  findQuery,
  zoom,
}: {
  sections: TocSection[];
  activeId: string;
  onActiveChange: (id: string) => void;
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
  const suppressScrollRef = useRef(false);
  const suppressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = pageRefs.current[activeId];
    const container = scrollRef.current;
    if (!el || !container) return;
    // Suppress the scroll listener while the programmatic scroll animates
    suppressScrollRef.current = true;
    if (suppressTimerRef.current) clearTimeout(suppressTimerRef.current);
    suppressTimerRef.current = setTimeout(() => { suppressScrollRef.current = false; }, 600);
    container.scrollTo({ top: el.offsetTop - 32, behavior: "smooth" });
  }, [activeId]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const handler = () => {
      if (suppressScrollRef.current) return;
      const midY = container.scrollTop + container.clientHeight / 2;
      let closest = sections[0]?.id ?? "";
      let closestDist = Infinity;
      // Check all page ref keys (includes sub-section ids)
      for (const [id, el] of Object.entries(pageRefs.current)) {
        if (!el) continue;
        const center = el.offsetTop + el.offsetHeight / 2;
        const dist = Math.abs(center - midY);
        if (dist < closestDist) { closestDist = dist; closest = id; }
      }
      onActiveChange(closest);
    };
    container.addEventListener("scroll", handler, { passive: true });
    return () => container.removeEventListener("scroll", handler);
  }, [sections, onActiveChange]);

  return (
    <div className="relative flex-1 overflow-hidden" style={{ background: canvasBg }}>
      <div className="absolute top-0 inset-x-0 h-8 pointer-events-none z-10"
        style={{ background: `linear-gradient(to bottom, ${canvasBg}, transparent)` }} />
      <div className="absolute bottom-0 inset-x-0 h-12 pointer-events-none z-10"
        style={{ background: `linear-gradient(to top, ${canvasBg}, transparent)` }} />
      <div ref={scrollRef} className="absolute inset-0 overflow-y-auto overflow-x-auto scroll-thin">
        <div className="flex flex-col items-center gap-4 py-8" style={{ minWidth: scaledW + 48 }}>
          {sections.map((s, sIdx) => {
            // Compute global page index across all rendered pages
            let pageNum = s.page;
            const renderPage = (
              id: string,
              heading: React.ReactNode,
              body: string,
              paragraphs?: string[],
              points?: string[],
              note?: string,
              pgNum?: number,
            ) => (
              <div
                key={id}
                ref={el => { pageRefs.current[id] = el; }}
                style={{ width: scaledW, height: scaledH, flexShrink: 0 }}
              >
                <div
                  className="bg-white shadow-[0px_4px_20px_0px_rgba(0,0,0,0.08)] flex flex-col"
                  style={{ width: PAGE_W, height: PAGE_H, transform: `scale(${scale})`, transformOrigin: "top left", padding: "48px 40px" }}
                >
                  <div className="mb-5">{heading}</div>
                  <div className="flex flex-col gap-3 overflow-hidden flex-1">
                    <p className="text-[13px] leading-[1.75]" style={{ color: "#333" }}>
                      <Highlight text={body} query={q} />
                    </p>
                    {paragraphs?.map((p, i) => (
                      <p key={i} className="text-[13px] leading-[1.75]" style={{ color: "#333" }}>
                        <Highlight text={p} query={q} />
                      </p>
                    ))}
                    {points && points.length > 0 && (
                      <ul className="flex flex-col gap-1.5 mt-1">
                        {points.map((pt, i) => (
                          <li key={i} className="flex items-start gap-2 text-[13px] leading-[1.7]" style={{ color: "#333" }}>
                            <span className="mt-[6px] shrink-0 size-[5px] rounded-full" style={{ background: "var(--primary)", opacity: 0.5 }} />
                            <Highlight text={pt} query={q} />
                          </li>
                        ))}
                      </ul>
                    )}
                    {note && (
                      <div className="mt-2 rounded-[6px] px-3 py-2.5" style={{ background: "#f5f5f0", borderLeft: "3px solid #d4e897" }}>
                        <p className="text-[11.5px] leading-[1.7] italic" style={{ color: "#555" }}>
                          <Highlight text={note} query={q} />
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="pt-4 flex justify-end shrink-0">
                    <span className="text-[10px]" style={{ color: "#aaa" }}>{pgNum ?? pageNum}</span>
                  </div>
                </div>
              </div>
            );

            const pages: React.ReactNode[] = [];

            // Main section page
            pages.push(renderPage(
              s.id,
              <h2 className="inline font-semibold leading-[1.4] text-[16px]" style={{ color: "var(--primary)" }}>
                <Highlight text={`${s.num}.  ${s.title}`} query={q} />
              </h2>,
              s.body, s.paragraphs, s.points, s.note, s.page,
            ));

            // Sub-section pages
            s.subsections?.forEach((sub, subIdx) => {
              const subNum = `${s.num}.${subIdx + 1}`;
              pages.push(renderPage(
                sub.id,
                <>
                  <p className="text-[11px] font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>
                    {s.num}. {s.title}
                  </p>
                  <h3 className="font-semibold leading-[1.4] text-[15px]" style={{ color: "var(--primary)" }}>
                    <Highlight text={`${subNum}  ${sub.title}`} query={q} />
                  </h3>
                </>,
                sub.body, sub.paragraphs, sub.points, sub.note,
              ));
            });

            // Continuation pages
            s.continuationPages?.forEach((cp, cpIdx) => {
              const contId = `${s.id}-cont-${cpIdx}`;
              pages.push(renderPage(
                contId,
                <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
                  {s.num}. {s.title} — continued
                </p>,
                cp.paragraphs?.[0] ?? "", cp.paragraphs?.slice(1), cp.points, cp.note,
              ));
            });

            return pages;
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
          onActiveChange={setActiveId}
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

      <div className="shrink-0 px-8 pt-6 pb-5 flex flex-col gap-2" style={{ borderBottom: "1px solid var(--border)" }}>
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
