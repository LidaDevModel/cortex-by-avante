"use client";

import { useRef, useEffect } from "react";
import { Search, X, ChevronUp, ChevronDown } from "lucide-react";

type Props = {
  findOpen: boolean;
  onFindToggle: () => void;
  findQuery: string;
  onFindChange: (v: string) => void;
  onFindClose: () => void;
  onFindPrev: () => void;
  onFindNext: () => void;
  findMatchCount: number;
  findTotalCount: number;
  findMatchIdx: number;
  findEntityLabel?: string;
  findGridMode?: boolean;
  right?: React.ReactNode;
};

export function DocumentToolbar({
  findOpen,
  onFindToggle,
  findQuery,
  onFindChange,
  onFindClose,
  onFindPrev,
  onFindNext,
  findMatchCount,
  findTotalCount,
  findMatchIdx,
  findEntityLabel = "sections",
  findGridMode = false,
  right,
}: Props) {
  const findInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (findOpen) {
      setTimeout(() => findInputRef.current?.focus(), 0);
    }
  }, [findOpen]);

  const hasQuery = findQuery.trim() !== "";
  const counterText = !hasQuery
    ? ""
    : findGridMode
    ? findMatchCount === 0
      ? "No results"
      : `${findMatchCount} page${findMatchCount !== 1 ? "s" : ""}`
    : findTotalCount === 0
    ? "No results"
    : `${findMatchIdx + 1} of ${findMatchCount} ${findEntityLabel} · ${findTotalCount} match${findTotalCount !== 1 ? "es" : ""}`;

  return (
    <div
      className="flex items-center gap-3 px-6 py-3 shrink-0 border-b border-border"
      style={{ background: "var(--surface)" }}
    >
      {/* Find region — always flex-1 so the right controls never shift. The
          field expands from a compact pill via a grid 0fr→1fr track (the modern
          "animate to auto width" technique), its content fading in as it opens;
          the pill sits out of flow and cross-fades so nothing jumps. */}
      <div className="relative flex-1 min-w-0 flex items-center h-10">
        {/* Expanding field */}
        <div
          className="grid w-full transition-[grid-template-columns] duration-[220ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
          style={{ gridTemplateColumns: findOpen ? "1fr" : "0fr" }}
          aria-hidden={!findOpen}
        >
          <div className="overflow-hidden min-w-0">
            <div
              className="flex items-center gap-2 w-full h-10 rounded-[10px] border px-3 transition-opacity duration-150 ease-out"
              style={{
                background: "var(--surface-raised)",
                borderColor: "var(--border)",
                opacity: findOpen ? 1 : 0,
              }}
            >
              <Search size={14} strokeWidth={1.5} className="shrink-0" style={{ color: "var(--primary)" }} />
              <input
                ref={findInputRef}
                value={findQuery}
                onChange={e => onFindChange(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") { e.shiftKey ? onFindPrev() : onFindNext(); }
                  if (e.key === "Escape") onFindClose();
                }}
                placeholder="Find in document..."
                tabIndex={findOpen ? 0 : -1}
                className="flex-1 min-w-0 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
                style={{ color: "var(--foreground)" }}
              />
              {counterText && (
                <span className="text-[12px] tabular-nums shrink-0 whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>
                  {counterText}
                </span>
              )}
              {!findGridMode && (
                <div className="flex shrink-0">
                  <button
                    onClick={onFindPrev}
                    disabled={findMatchCount === 0}
                    tabIndex={findOpen ? 0 : -1}
                    className="flex items-center justify-center size-6 rounded-l-[5px] border transition-colors hover:bg-[var(--surface)] disabled:opacity-40"
                    style={{ borderColor: "var(--border)" }}
                    title="Previous match (⇧ Enter)"
                  >
                    <ChevronUp size={12} strokeWidth={2} className="text-foreground" />
                  </button>
                  <button
                    onClick={onFindNext}
                    disabled={findMatchCount === 0}
                    tabIndex={findOpen ? 0 : -1}
                    className="flex items-center justify-center size-6 rounded-r-[5px] border border-l-0 transition-colors hover:bg-[var(--surface)] disabled:opacity-40"
                    style={{ borderColor: "var(--border)" }}
                    title="Next match (Enter)"
                  >
                    <ChevronDown size={12} strokeWidth={2} className="text-foreground" />
                  </button>
                </div>
              )}
              <button
                onClick={onFindClose}
                tabIndex={findOpen ? 0 : -1}
                className="flex items-center justify-center size-6 rounded-[5px] transition-colors hover:bg-[var(--surface)] shrink-0"
                title="Close (Esc)"
              >
                <X size={13} strokeWidth={1.5} className="text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>

        {/* Collapsed pill — out of flow, cross-fades with the field */}
        <button
          onClick={onFindToggle}
          title="Find in document (⌘F)"
          aria-hidden={findOpen}
          tabIndex={findOpen ? -1 : 0}
          className="absolute inset-y-0 left-0 flex items-center gap-2 px-3 h-10 rounded-[10px] border text-[13px] transition-opacity duration-150 ease-out hover:bg-[var(--surface-raised)]"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--muted-foreground)",
            opacity: findOpen ? 0 : 1,
            pointerEvents: findOpen ? "none" : "auto",
          }}
        >
          <Search size={14} strokeWidth={1.5} />
          <span>Find</span>
          <span
            className="text-[11px] px-1 rounded-[3px] ml-0.5"
            style={{ background: "var(--surface-raised)", color: "var(--muted-foreground)" }}
          >
            ⌘F
          </span>
        </button>
      </div>

      {/* Right slot */}
      {right && <div className="flex items-center gap-4 shrink-0">{right}</div>}
    </div>
  );
}
