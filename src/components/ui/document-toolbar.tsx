"use client";

import { useRef, useEffect } from "react";
import { Search, X, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

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
  /** Extra classes on the find region — e.g. cap the expanded width. */
  findRegionClass?: string;
  left?: React.ReactNode;
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
  findGridMode = false,
  findRegionClass,
  left,
  right,
}: Props) {
  const findInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (findOpen) {
      setTimeout(() => findInputRef.current?.focus(), 0);
    }
  }, [findOpen]);

  const hasQuery = findQuery.trim() !== "";
  // Match count only — no "of N chapters/pages" framing.
  const counterText = !hasQuery
    ? ""
    : findTotalCount === 0
    ? "No results"
    : `${findTotalCount} match${findTotalCount !== 1 ? "es" : ""}`;

  return (
    <div
      className="flex items-center gap-3 px-4 sm:px-6 py-3 shrink-0 border-b border-border"
      style={{ background: "var(--surface)" }}
    >
      {/* Left slot — e.g. the mobile contents-sheet trigger */}
      {left}
      {/* Find region — always flex-1 so the right controls never shift. Adapted
          from the 60fps.design "Search" expand: the leading icon is a SINGLE
          persistent element that morphs search ↔ close (it doesn't cross-fade
          away), and it IS the toggle — the "icon morphs between states" detail.
          The pill grows to full width via a grid 0fr→1fr track (shape unchanged —
          still a rounded-[10px] pill, it just grows in place); the collapsed
          label and the open field cross-fade behind the fixed icon. */}
      <div className={cn("relative flex-1 min-w-0 flex items-center h-10", findRegionClass)}>
        {/* Expanding field — carries only the input + match nav now; the leading
            icon and close live in the shared morphing icon overlaid below. */}
        <div
          className="grid w-full transition-[grid-template-columns] duration-[220ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
          style={{ gridTemplateColumns: findOpen ? "1fr" : "0fr" }}
          aria-hidden={!findOpen}
        >
          <div className="overflow-hidden min-w-0">
            <div
              className="flex items-center gap-2 w-full h-10 rounded-[10px] border pl-10 pr-3 transition-opacity duration-150 ease-out"
              style={{
                background: "var(--surface-raised)",
                borderColor: "var(--border)",
                opacity: findOpen ? 1 : 0,
              }}
            >
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
                // A find field must not be "helped" by the mobile keyboard:
                // autocorrect + auto-capitalize fight the controlled value and
                // scramble/upper-case what's typed (e.g. "shift" → "iftHS").
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="off"
                spellCheck={false}
                className="flex-1 min-w-0 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
                style={{ color: "var(--foreground)" }}
              />
              {counterText && (
                <span className="text-[12px] tabular-nums shrink-0 whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>
                  {counterText}
                </span>
              )}
              {!findGridMode && hasQuery && findMatchCount > 0 && (
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
            </div>
          </div>
        </div>

        {/* Collapsed pill — out of flow, cross-fades with the field. Just the
            label now; the icon lives in the shared overlay. pl-10 clears it. */}
        <button
          onClick={onFindToggle}
          title="Find in document (⌘F)"
          aria-hidden={findOpen}
          tabIndex={findOpen ? -1 : 0}
          className="absolute inset-y-0 left-0 flex items-center h-10 rounded-[10px] border pl-10 pr-0 sm:pr-3 text-[13px] transition-opacity duration-150 ease-out hover:bg-[var(--surface-raised)]"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--muted-foreground)",
            opacity: findOpen ? 0 : 1,
            pointerEvents: findOpen ? "none" : "auto",
          }}
        >
          <span className="hidden sm:inline">Find</span>
          <span
            className="hidden sm:inline text-[11px] px-1 rounded-[3px] ml-2"
            style={{ background: "var(--surface-raised)", color: "var(--muted-foreground)" }}
          >
            ⌘F
          </span>
        </button>

        {/* Shared morphing icon — the persistent element from the reference. It
            stays put and morphs (search when closed, close-X when open) instead
            of cross-fading, and doubles as the toggle: opens when collapsed,
            closes when open. */}
        <button
          onClick={findOpen ? onFindClose : onFindToggle}
          title={findOpen ? "Close (Esc)" : "Find in document (⌘F)"}
          aria-label={findOpen ? "Close find" : "Find"}
          className="absolute inset-y-0 left-0 z-10 flex items-center justify-center size-10 rounded-[10px] transition-opacity duration-150 hover:opacity-70"
        >
          <span className="relative flex items-center justify-center" style={{ width: 15, height: 15 }}>
            <Search
              size={14}
              strokeWidth={1.5}
              className="absolute"
              style={{
                color: "var(--primary)",
                opacity: findOpen ? 0 : 1,
                transform: findOpen ? "rotate(-90deg) scale(0.5)" : "none",
                transition: "opacity 220ms cubic-bezier(0.32,0.72,0,1), transform 220ms cubic-bezier(0.32,0.72,0,1)",
              }}
            />
            <X
              size={15}
              strokeWidth={1.5}
              className="absolute"
              style={{
                color: "var(--muted-foreground)",
                opacity: findOpen ? 1 : 0,
                transform: findOpen ? "none" : "rotate(90deg) scale(0.5)",
                transition: "opacity 220ms cubic-bezier(0.32,0.72,0,1), transform 220ms cubic-bezier(0.32,0.72,0,1)",
              }}
            />
          </span>
        </button>
      </div>

      {/* Right slot — yields to the expanded find field on mobile, where
          both don't fit side by side. */}
      {right && <div className={cn("flex items-center gap-4 shrink-0", findOpen && "max-sm:hidden")}>{right}</div>}
    </div>
  );
}
