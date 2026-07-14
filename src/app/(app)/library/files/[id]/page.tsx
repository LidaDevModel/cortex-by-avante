"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, FileText, LayoutGrid, TableOfContents as TableOfContentsIcon } from "lucide-react";
import { PageHeader, DetailHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { SplitPanel } from "@/components/ui/split-panel";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Highlight } from "@/components/ui/highlight";
import { DocumentToolbar } from "@/components/ui/document-toolbar";
import { DocCallout } from "@/components/library/DocCallout";
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
  pageNumbers,
}: {
  sections: TocSection[];
  allSections: TocSection[];
  activeId: string;
  onSelect: (id: string) => void;
  matchCounts: Record<string, number>;
  pageNumbers: Record<string, number>;
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
                    style={{ background: "color-mix(in srgb, var(--accent-subtle) 50%, transparent)", color: "var(--primary)" }}
                  >
                    {count}
                  </span>
                )}
                <span
                  className="text-[11px] tabular-nums w-4 text-right"
                  style={{ color: isActive ? "var(--primary)" : "var(--muted-foreground)" }}
                >
                  {pageNumbers[s.id] ?? s.page}
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
                          style={{ background: "color-mix(in srgb, var(--accent-subtle) 50%, transparent)", color: "var(--primary)" }}
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

/* ─── Shared page constants ─── */

const PAGE_W = 560;
const PAGE_H = Math.round(PAGE_W * 297 / 210); // 792px — A4

/* ─── Shared page interior renderer ─── */

function PageInner({
  heading,
  body,
  paragraphs,
  points,
  note,
  pageNum,
  q = "",
}: {
  heading: React.ReactNode;
  body: string;
  paragraphs?: string[];
  points?: string[];
  note?: string;
  pageNum?: number;
  q?: string;
}) {
  return (
    <>
      <div className="mb-5">{heading}</div>
      <div className="flex flex-col gap-3 overflow-hidden flex-1">
        <p className="text-[13px] leading-[1.75]" style={{ color: "var(--doc-text)" }}>
          <Highlight text={body} query={q} />
        </p>
        {paragraphs?.map((p, i) => (
          <p key={i} className="text-[13px] leading-[1.75]" style={{ color: "var(--doc-text)" }}>
            <Highlight text={p} query={q} />
          </p>
        ))}
        {points && points.length > 0 && (
          <ul className="flex flex-col gap-1.5 mt-1">
            {points.map((pt, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] leading-[1.7]" style={{ color: "var(--doc-text)" }}>
                <span className="mt-[6px] shrink-0 size-[5px] rounded-full" style={{ background: "var(--primary)", opacity: 0.5 }} />
                <Highlight text={pt} query={q} />
              </li>
            ))}
          </ul>
        )}
        {note && (
          <DocCallout className="mt-2">
            <Highlight text={note} query={q} />
          </DocCallout>
        )}
      </div>
      <div className="pt-4 flex justify-end shrink-0">
        <span className="text-[10px]" style={{ color: "var(--doc-text-faint)" }}>{pageNum}</span>
      </div>
    </>
  );
}

/* ─── Page descriptor type (flat list of all rendered pages) ─── */

type PageDescriptor = {
  id: string;
  heading: React.ReactNode;
  body: string;
  paragraphs?: string[];
  points?: string[];
  note?: string;
  searchText?: string;
};

function makeSearchText(...parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(" ").toLowerCase();
}

function buildAllPages(sections: TocSection[]): PageDescriptor[] {
  const pages: PageDescriptor[] = [];
  for (const s of sections) {
    pages.push({
      id: s.id,
      searchText: makeSearchText(s.num, s.title, s.body, ...(s.paragraphs ?? []), ...(s.points ?? []), s.note),
      heading: (
        <h2 className="inline font-semibold leading-[1.4] text-[16px]" style={{ color: "var(--primary)" }}>
          {s.num}.  {s.title}
        </h2>
      ),
      body: s.body,
      paragraphs: s.paragraphs,
      points: s.points,
      note: s.note,
    });
    s.subsections?.forEach((sub, subIdx) => {
      const subNum = `${s.num}.${subIdx + 1}`;
      pages.push({
        id: sub.id,
        searchText: makeSearchText(subNum, sub.title, sub.body, ...(sub.paragraphs ?? []), ...(sub.points ?? []), sub.note),
        heading: (
          <>
            <p className="text-[11px] font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>
              {s.num}. {s.title}
            </p>
            <h3 className="font-semibold leading-[1.4] text-[15px]" style={{ color: "var(--primary)" }}>
              {subNum}  {sub.title}
            </h3>
          </>
        ),
        body: sub.body,
        paragraphs: sub.paragraphs,
        points: sub.points,
        note: sub.note,
      });
    });
    s.continuationPages?.forEach((cp, cpIdx) => {
      pages.push({
        id: `${s.id}-cont-${cpIdx}`,
        searchText: makeSearchText(s.title, ...(cp.paragraphs ?? []), ...(cp.points ?? []), cp.note),
        heading: (
          <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
            {s.num}. {s.title} — continued
          </p>
        ),
        body: cp.paragraphs?.[0] ?? "",
        paragraphs: cp.paragraphs?.slice(1),
        points: cp.points,
        note: cp.note,
      });
    });
  }
  return pages;
}

/* ─── Document canvas ─── */

function DocumentPage({
  sections,
  activeId,
  onActiveChange,
  findQuery,
  zoom,
  pageNumbers,
}: {
  sections: TocSection[];
  activeId: string;
  onActiveChange: (id: string) => void;
  findQuery: string;
  zoom: number;
  pageNumbers: Record<string, number>;
}) {
  const q = findQuery.trim().toLowerCase();
  const canvasBg = "var(--background-fileview)";

  // On mobile the zoom control is hidden and the page fits the viewport
  // width instead — a 560px page would otherwise force horizontal panning.
  const isMobile = useIsMobile();
  const [containerW, setContainerW] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setContainerW(el.clientWidth));
    ro.observe(el);
    setContainerW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // 48 matches the column's minWidth allowance so the fitted page never
  // introduces horizontal scroll of its own.
  const fitScale = containerW > 0 ? Math.min(1, (containerW - 48) / PAGE_W) : null;
  const scale = isMobile && fitScale !== null ? fitScale : zoom / 100;
  const scaledW = Math.round(PAGE_W * scale);
  const scaledH = Math.round(PAGE_H * scale);
  const pageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const suppressScrollRef = useRef(false);
  const suppressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasPositionedRef = useRef(false);

  useEffect(() => {
    const el = pageRefs.current[activeId];
    const container = scrollRef.current;
    if (!el || !container) return;
    // Suppress the scroll listener while the programmatic scroll animates.
    // Release on scrollend (i.e. when the animation actually settles) — a
    // fixed short timer can expire mid-flight on long multi-page jumps and
    // let the position watcher re-target a page the animation is passing,
    // yanking the viewport back. The timeout stays as a generous fallback
    // for scrolls that never fire the event (already at position).
    suppressScrollRef.current = true;
    const release = () => {
      suppressScrollRef.current = false;
      container.removeEventListener("scrollend", release);
      if (suppressTimerRef.current) clearTimeout(suppressTimerRef.current);
    };
    container.addEventListener("scrollend", release);
    if (suppressTimerRef.current) clearTimeout(suppressTimerRef.current);
    suppressTimerRef.current = setTimeout(release, 1500);
    // First positioning (e.g. a ?section= deep link) jumps instantly — a smooth
    // multi-page scroll can be canceled by the route entrance animation and
    // strand the viewport at the top; later TOC selections animate as usual.
    const behavior: ScrollBehavior = hasPositionedRef.current ? "smooth" : "auto";
    hasPositionedRef.current = true;
    container.scrollTo({ top: el.offsetTop - 32, behavior });
    return () => container.removeEventListener("scrollend", release);
  }, [activeId]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const handler = () => {
      if (suppressScrollRef.current) return;
      const midY = container.scrollTop + container.clientHeight / 2;
      let closest: string | null = null;
      let closestDist = Infinity;
      // Check all page ref keys (includes sub-section ids). Refs can be
      // transiently null right after a remount (e.g. React Strict Mode's
      // dev-only double-invoke) — only report a match once we've actually
      // measured a real element, never fall back to guessing sections[0].
      for (const [id, el] of Object.entries(pageRefs.current)) {
        if (!el) continue;
        const center = el.offsetTop + el.offsetHeight / 2;
        const dist = Math.abs(center - midY);
        if (dist < closestDist) { closestDist = dist; closest = id; }
      }
      if (closest) onActiveChange(closest);
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
          {sections.map((s) => {
            const renderPage = (id: string, pg: PageDescriptor) => (
              <div
                key={id}
                ref={el => { pageRefs.current[id] = el; }}
                style={{ width: scaledW, height: scaledH, flexShrink: 0 }}
              >
                <div
                  className="bg-[var(--doc-page-bg)] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.08)] flex flex-col"
                  style={{ width: PAGE_W, height: PAGE_H, transform: `scale(${scale})`, transformOrigin: "top left", padding: "48px 40px" }}
                >
                  <PageInner {...pg} pageNum={pageNumbers[id]} q={q} />
                </div>
              </div>
            );

            const pages: React.ReactNode[] = [];

            pages.push(renderPage(s.id, {
              id: s.id,
              heading: (
                <h2 className="inline font-semibold leading-[1.4] text-[16px]" style={{ color: "var(--primary)" }}>
                  <Highlight text={`${s.num}.  ${s.title}`} query={q} />
                </h2>
              ),
              body: s.body, paragraphs: s.paragraphs, points: s.points, note: s.note,
            }));

            s.subsections?.forEach((sub, subIdx) => {
              const subNum = `${s.num}.${subIdx + 1}`;
              pages.push(renderPage(sub.id, {
                id: sub.id,
                heading: (
                  <>
                    <p className="text-[11px] font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>
                      {s.num}. {s.title}
                    </p>
                    <h3 className="font-semibold leading-[1.4] text-[15px]" style={{ color: "var(--primary)" }}>
                      <Highlight text={`${subNum}  ${sub.title}`} query={q} />
                    </h3>
                  </>
                ),
                body: sub.body, paragraphs: sub.paragraphs, points: sub.points, note: sub.note,
              }));
            });

            s.continuationPages?.forEach((cp, cpIdx) => {
              const contId = `${s.id}-cont-${cpIdx}`;
              pages.push(renderPage(contId, {
                id: contId,
                heading: (
                  <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
                    {s.num}. {s.title} — continued
                  </p>
                ),
                body: cp.paragraphs?.[0] ?? "", paragraphs: cp.paragraphs?.slice(1), points: cp.points, note: cp.note,
              }));
            });

            return pages;
          })}
          <div style={{ height: 32 }} />
        </div>
      </div>
    </div>
  );
}

/* ─── Grid view ─── */

const DEFAULT_THUMB_W = 184;

function GridView({
  sections,
  pageNumbers,
  activeId,
  onSelect,
  findQuery = "",
  thumbSize = DEFAULT_THUMB_W,
}: {
  sections: TocSection[];
  pageNumbers: Record<string, number>;
  activeId: string;
  onSelect: (id: string) => void;
  findQuery?: string;
  thumbSize?: number;
}) {
  const allPages = buildAllPages(sections);
  const thumbW = thumbSize;
  const thumbH = Math.round(thumbW * 297 / 210);
  const thumbScale = thumbW / PAGE_W;
  const q = findQuery.trim().toLowerCase();

  return (
    <div className="flex-1 overflow-y-auto scroll-thin" style={{ background: "var(--background-fileview)" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(auto-fill, ${thumbW}px)`,
          gap: 16,
          padding: 24,
          justifyContent: "center",
        }}
      >
        {allPages.map((pg) => {
          const isActive = pg.id === activeId;
          const matches = !q || (pg.searchText ?? "").includes(q);
          return (
            <button
              key={pg.id}
              onClick={() => onSelect(pg.id)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                width: thumbW,
                opacity: q && !matches ? 0.2 : 1,
                transition: "opacity 150ms ease-out",
              }}
            >
              {/* Page thumbnail */}
              <div
                style={{
                  position: "relative",
                  overflow: "hidden",
                  width: thumbW,
                  height: thumbH,
                  borderRadius: 4,
                  boxShadow: isActive
                    ? "0 0 0 2px var(--primary), var(--shadow-thumb-strong)"
                    : q && matches && !isActive
                    ? "0 0 0 2px var(--ring), var(--shadow-thumb)"
                    : "var(--shadow-thumb)",
                  transition: "box-shadow 150ms",
                }}
              >
                {/* Full-size page scaled down */}
                <div
                  className="bg-[var(--doc-page-bg)] flex flex-col absolute top-0 left-0 text-left"
                  style={{
                    width: PAGE_W,
                    height: PAGE_H,
                    transform: `scale(${thumbScale})`,
                    transformOrigin: "top left",
                    padding: "48px 40px",
                    pointerEvents: "none",
                  }}
                >
                  <PageInner
                    heading={pg.heading}
                    body={pg.body}
                    paragraphs={pg.paragraphs}
                    points={pg.points}
                    note={pg.note}
                    pageNum={pageNumbers[pg.id]}
                  />
                </div>
              </div>
              {/* Page label */}
              <span
                className="text-[11px] tabular-nums"
                style={{ color: isActive ? "var(--primary)" : "var(--muted-foreground)" }}
              >
                {pageNumbers[pg.id]}
              </span>
            </button>
          );
        })}
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
  const searchParams = useSearchParams();
  const result = getDocById(id);

  const [tocFilter, setTocFilter] = useState("");
  const [tocSheetOpen, setTocSheetOpen] = useState(false);
  const [zoom, setZoom] = useState(75);
  const [thumbSize, setThumbSize] = useState(DEFAULT_THUMB_W);
  const [viewMode, setViewMode] = useState<"single" | "grid">("single");

  // Find in document
  const [findOpen, setFindOpen] = useState(false);
  const [findQuery, setFindQuery] = useState("");
  const [findMatchIdx, setFindMatchIdx] = useState(0);

  const sections = result?.doc.toc ?? [];
  const requestedSection = searchParams.get("section");
  const fromChat = searchParams.get("from") === "chat"; // arrived from a citation
  const [activeId, setActiveId] = useState(() => requestedSection || sections[0]?.id || "");

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

  // Build sequential page number map: every rendered page card in order
  const pageNumbers = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    let pg = 1;
    for (const s of sections) {
      map[s.id] = pg++;
      for (const sub of (s.subsections ?? [])) {
        map[sub.id] = pg++;
      }
      for (let i = 0; i < (s.continuationPages?.length ?? 0); i++) {
        map[`${s.id}-cont-${i}`] = pg++;
      }
    }
    return map;
  }, [sections]);

  const totalPages = Object.keys(pageNumbers).length || sections.length;
  const activePageNum = pageNumbers[activeId] ?? 1;

  // Grid find: count pages whose searchText contains the query
  const allPages = useMemo(() => buildAllPages(sections), [sections]);
  const gridFindMatchCount = useMemo(() => {
    const q = findQuery.trim().toLowerCase();
    if (!q) return 0;
    return allPages.filter(p => (p.searchText ?? "").includes(q)).length;
  }, [allPages, findQuery]);

  // Shared between the desktop rail and the mobile contents sheet; selecting
  // a section from the sheet also closes it.
  const renderTocPanel = (searchPad: string, listPad: string, onSelect: (id: string) => void) => (
    <>
      <div className={`${searchPad} py-3 shrink-0`}>
        <SearchInput
          value={tocFilter}
          onChange={setTocFilter}
          placeholder="Jump to section..."
        />
      </div>
      <div className={`flex-1 overflow-y-auto ${listPad} pb-6 scroll-thin`}>
        {filteredToc.length > 0 ? (
          <TableOfContents
            sections={filteredToc}
            allSections={sections}
            activeId={activeId}
            onSelect={onSelect}
            matchCounts={matchCountBySectionId}
            pageNumbers={pageNumbers}
          />
        ) : tocFilter ? (
          <p className="text-[13px] text-muted-foreground px-2 py-4">No sections found.</p>
        ) : (
          <p className="text-[13px] text-muted-foreground px-2 py-4">No table of contents available.</p>
        )}
      </div>
    </>
  );

  const leftPanel = renderTocPanel("px-8", "px-6", setActiveId);

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
        findMatchCount={viewMode === "grid" ? gridFindMatchCount : findMatchSections.length}
        findTotalCount={totalFindCount}
        findMatchIdx={findMatchIdx}
        findEntityLabel="sections"
        findGridMode={viewMode === "grid"}
        left={
          /* Mobile contents trigger — the desktop rail is hidden below md */
          <div className="md:hidden shrink-0">
            <IconButton position="solo" onClick={() => setTocSheetOpen(true)} title="Contents">
              <TableOfContentsIcon size={15} strokeWidth={1.5} className="text-foreground" />
              <span className="sr-only">Contents</span>
            </IconButton>
          </div>
        }
        right={
          <>
            {viewMode === "single" ? (
              <>
                {/* Zoom — pointer affordance; on mobile the page fits the
                    viewport width instead */}
                <div className="hidden sm:flex items-center gap-3">
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
                    <span className="text-[16px] text-foreground">{activePageNum}</span>
                    {" "}/ {totalPages}
                  </span>
                  {/* Prev/next are pointer affordances — mobile navigates by
                      scroll and the contents sheet */}
                  <div className="hidden sm:flex">
                    <IconButton position="left" onClick={() => canPrev && setActiveId(sections[activeIndex - 1].id)}>
                      <ChevronLeft size={15} strokeWidth={1.5} className={canPrev ? "text-foreground" : "text-muted-foreground"} />
                    </IconButton>
                    <IconButton position="right" onClick={() => canNext && setActiveId(sections[activeIndex + 1].id)}>
                      <ChevronRight size={15} strokeWidth={1.5} className={canNext ? "text-foreground" : "text-muted-foreground"} />
                    </IconButton>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Thumbnail size */}
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-muted-foreground">{totalPages} pages</span>
                  <div className="hidden sm:flex">
                    <IconButton position="left" onClick={() => setThumbSize(s => Math.max(120, s - 40))}>
                      <ZoomOut size={15} strokeWidth={1.5} className="text-foreground" />
                    </IconButton>
                    <IconButton position="right" onClick={() => setThumbSize(s => Math.min(280, s + 40))}>
                      <ZoomIn size={15} strokeWidth={1.5} className="text-foreground" />
                    </IconButton>
                  </div>
                </div>
              </>
            )}

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
          pageNumbers={pageNumbers}
        />
      ) : (
        <GridView
          sections={sections}
          pageNumbers={pageNumbers}
          activeId={activeId}
          onSelect={(id) => { setActiveId(id); setViewMode("single"); }}
          findQuery={findQuery}
          thumbSize={thumbSize}
        />
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: "var(--surface)" }}>
      <PageHeader
        crumbs={
          folder
            ? [
                { label: "Library", href: "/library" },
                { label: folder.name, href: `/library/folders/${folder.id}` },
                { label: doc.name },
              ]
            : [
                { label: "Library", href: "/library" },
                { label: doc.name },
              ]
        }
      />

      <div className="shrink-0 px-4 sm:px-8 pt-6 pb-5 flex flex-col gap-2" style={{ borderBottom: "1px solid var(--border)" }}>
        <DetailHeader
          backHref={fromChat ? "/chat" : folder ? `/library/folders/${folder.id}` : "/library"}
          backLabel={fromChat ? "Back to conversation" : folder ? `Back to ${folder.name}` : "Back to Library"}
          title={doc.name}
          meta={doc.content}
          className="[&_h1]:text-[22px] [&_h1]:leading-[30px]"
        />
      </div>

      <SplitPanel leftWidth={280} left={leftPanel} right={rightPanel} />

      {/* Mobile contents sheet — same shell recipe as the chat history sheet */}
      <Sheet open={tocSheetOpen} onOpenChange={setTocSheetOpen}>
        <SheetContent side="left" className="w-[300px] bg-surface p-0 gap-0 flex flex-col">
          <SheetHeader className="px-4 pt-4 pb-0">
            <SheetTitle className="flex items-center gap-2.5 text-[14px] leading-[20px] font-semibold text-primary">
              <TableOfContentsIcon size={16} strokeWidth={1.5} />
              Contents
            </SheetTitle>
          </SheetHeader>
          {renderTocPanel("px-4", "px-3", (id) => { setActiveId(id); setTocSheetOpen(false); })}
        </SheetContent>
      </Sheet>
    </div>
  );
}
