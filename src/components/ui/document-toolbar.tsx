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
      {/* Find — compact when closed, expands to flex-1 when open */}
      <div
        className={`flex items-center h-10 rounded-[10px] border overflow-hidden transition-colors duration-150 ease-out ${findOpen ? "flex-1 min-w-0" : "shrink-0"}`}
        style={{
          background: findOpen ? "var(--surface-raised)" : "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        {findOpen ? (
          /* Expanded: input + counter + nav + close */
          <div className="flex items-center gap-2 w-full px-3">
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
                  className="flex items-center justify-center size-6 rounded-l-[5px] border transition-colors hover:bg-[var(--surface)] disabled:opacity-40"
                  style={{ borderColor: "var(--border)" }}
                  title="Previous match (⇧ Enter)"
                >
                  <ChevronUp size={12} strokeWidth={2} className="text-foreground" />
                </button>
                <button
                  onClick={onFindNext}
                  disabled={findMatchCount === 0}
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
              className="flex items-center justify-center size-6 rounded-[5px] transition-colors hover:bg-[var(--surface)] shrink-0"
              title="Close (Esc)"
            >
              <X size={13} strokeWidth={1.5} className="text-muted-foreground" />
            </button>
          </div>
        ) : (
          /* Collapsed: pill button */
          <button
            onClick={onFindToggle}
            title="Find in document (⌘F)"
            className="flex items-center gap-2 px-3 h-full w-full text-[13px] hover:bg-[var(--surface-raised)] transition-colors duration-100 rounded-[10px]"
            style={{ color: "var(--muted-foreground)" }}
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
        )}
      </div>

      {/* Spacer — visible only when Find is collapsed, keeps right controls pinned */}
      {!findOpen && <div className="flex-1" />}

      {/* Right slot */}
      {right && <div className="flex items-center gap-4 shrink-0">{right}</div>}
    </div>
  );
}
