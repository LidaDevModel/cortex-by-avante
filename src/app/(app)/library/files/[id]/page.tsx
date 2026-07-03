"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, FileText, LayoutGrid } from "lucide-react";
import { PageHeader, DetailHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { SplitPanel } from "@/components/ui/split-panel";
import { Highlight } from "@/components/ui/highlight";
import { getDocById, type TocSection } from "@/lib/library-mock";

/* ─── Table of contents ─── */

function TableOfContents({
  sections,
  activeId,
  onSelect,
  search,
}: {
  sections: TocSection[];
  activeId: string;
  onSelect: (id: string) => void;
  search: string;
}) {
  const q = search.trim().toLowerCase();
  const filtered = q
    ? sections.filter((s) => s.title.toLowerCase().includes(q) || s.body.toLowerCase().includes(q))
    : sections;

  return (
    <div className="flex flex-col">
      {filtered.map((s) => {
        const isActive = s.id === activeId;
        return (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className="flex items-center justify-between gap-2 px-2 py-2 rounded-[6px] text-left transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2"
            style={{
              background: isActive ? "var(--nav-active)" : "transparent",
            }}
          >
            <span
              className="text-[14px] leading-[20px] truncate flex-1 min-w-0"
              style={{
                fontWeight: isActive ? 500 : 400,
                color: isActive ? "var(--primary)" : "var(--foreground)",
              }}
            >
              <Highlight text={`${s.num}.  ${s.title}`} query={q} />
            </span>
            <span
              className="text-[12px] shrink-0 tabular-nums"
              style={{ color: isActive ? "var(--primary)" : "var(--muted-foreground)" }}
            >
              {s.page}
            </span>
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
  search,
  zoom,
}: {
  sections: TocSection[];
  activeId: string;
  search: string;
  zoom: number;
}) {
  const q = search.trim().toLowerCase();

  return (
    <div
      className="flex-1 overflow-y-auto scroll-thin px-12 py-10"
      style={{
        background: "#f0f0f0",
        maskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 48px), transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 48px), transparent 100%)",
      }}
    >
      <div
        className="bg-white rounded-[10px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.06)] mx-auto px-10 py-12 flex flex-col gap-8"
        style={{
          maxWidth: 620,
          fontSize: zoom / 100,
          transform: `scale(${zoom / 100})`,
          transformOrigin: "top center",
        }}
      >
        {sections.map((s) => {
          const isActive = s.id === activeId;
          return (
            <div key={s.id} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                {isActive && (
                  <span
                    className="text-[11px] font-semibold px-1.5 py-0.5 rounded-[4px]"
                    style={{ background: "color-mix(in srgb, var(--accent-subtle) 60%, transparent)", color: "var(--primary)" }}
                  >
                    Current
                  </span>
                )}
                <h2
                  className="text-[16px] leading-[24px] font-semibold"
                  style={{ color: "var(--primary)" }}
                >
                  {s.num}.{"  "}{s.title}
                </h2>
              </div>
              <p className="text-[12px] leading-[1.7]" style={{ color: "var(--foreground)" }}>
                <Highlight text={s.body} query={q} />
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Toolbar ─── */

function IconButton({
  onClick,
  active,
  children,
  position,
}: {
  onClick?: () => void;
  active?: boolean;
  children: React.ReactNode;
  position?: "left" | "right" | "solo";
}) {
  const radius =
    position === "left"
      ? "rounded-l-[10px]"
      : position === "right"
      ? "rounded-r-[10px]"
      : "rounded-[10px]";

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center size-10 border border-border transition-colors duration-100 hover:bg-[var(--surface-raised)] ${radius} ${active ? "border-r-0" : ""}`}
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

  const [search, setSearch] = useState("");
  const [zoom, setZoom] = useState(100);
  const [viewMode, setViewMode] = useState<"single" | "grid">("single");

  const sections = result?.doc.toc ?? [];

  const [activeId, setActiveId] = useState(() => sections[0]?.id ?? "");

  const filteredSections = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? sections.filter((s) => s.title.toLowerCase().includes(q) || s.body.toLowerCase().includes(q))
      : sections;
  }, [sections, search]);

  const activeIndex = filteredSections.findIndex((s) => s.id === activeId);
  const canPrev = activeIndex > 0;
  const canNext = activeIndex < filteredSections.length - 1;

  function handleSearch(v: string) {
    setSearch(v);
    // When filtering, jump to first matching section
    const q = v.trim().toLowerCase();
    if (q) {
      const first = sections.find((s) => s.title.toLowerCase().includes(q) || s.body.toLowerCase().includes(q));
      if (first) setActiveId(first.id);
    }
  }

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
      {/* Search */}
      <div className="px-6 pt-6 pb-4 shrink-0">
        <SearchInput
          value={search}
          onChange={handleSearch}
          placeholder="Search keywords..."
        />
      </div>

      {/* ToC list */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 scroll-thin">
        {sections.length > 0 ? (
          <TableOfContents
            sections={sections}
            activeId={activeId}
            onSelect={setActiveId}
            search={search}
          />
        ) : (
          <p className="text-[13px] text-muted-foreground px-2 py-4">No table of contents available.</p>
        )}
      </div>
    </>
  );

  const rightPanel = (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-end gap-4 px-6 py-3 shrink-0 border-b border-border" style={{ background: "var(--surface)" }}>
        {/* Zoom */}
        <div className="flex items-center gap-3">
          <span className="text-[14px] text-muted-foreground tabular-nums w-10 text-right">
            {zoom}%
          </span>
          <div className="flex">
            <IconButton position="left" onClick={() => setZoom((z) => Math.max(50, z - 25))}>
              <ZoomOut size={15} strokeWidth={1.5} className="text-foreground" />
            </IconButton>
            <IconButton position="right" onClick={() => setZoom((z) => Math.min(200, z + 25))}>
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
            <IconButton position="left" onClick={() => canPrev && setActiveId(filteredSections[activeIndex - 1].id)}>
              <ChevronLeft size={15} strokeWidth={1.5} className={canPrev ? "text-foreground" : "text-muted-foreground"} />
            </IconButton>
            <IconButton position="right" onClick={() => canNext && setActiveId(filteredSections[activeIndex + 1].id)}>
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
      </div>

      {/* Document canvas */}
      {viewMode === "single" ? (
        <DocumentPage
          sections={filteredSections.length > 0 ? filteredSections : sections}
          activeId={activeId}
          search={search}
          zoom={zoom}
        />
      ) : (
        <div
          className="flex-1 overflow-y-auto p-8 scroll-thin"
          style={{ background: "#f0f0f0" }}
        >
          <div className="grid grid-cols-3 gap-4 max-w-[800px] mx-auto">
            {sections.map((s, i) => (
              <button
                key={s.id}
                onClick={() => { setActiveId(s.id); setViewMode("single"); }}
                className="bg-white rounded-[8px] p-4 text-left shadow-[0px_2px_8px_0px_rgba(0,0,0,0.06)] hover:shadow-[0px_4px_16px_0px_rgba(0,0,0,0.10)] transition-shadow duration-150 flex flex-col gap-2"
                style={{ outline: s.id === activeId ? "2px solid var(--primary)" : "none" }}
              >
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Page {i + 1}</span>
                <span className="text-[12px] font-semibold leading-[16px]" style={{ color: "var(--primary)" }}>
                  {s.num}. {s.title}
                </span>
                <p className="text-[10px] leading-[1.6] text-muted-foreground line-clamp-4">{s.body}</p>
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
