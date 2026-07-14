"use client";

import { useRef, useEffect } from "react";
import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type ExamSection = "mc" | "matching" | "shortAnswer" | "branching" | "review";

type SectionPill = {
  id: ExamSection;
  label: string;
  jumpable: boolean;
};

export const SECTIONS: SectionPill[] = [
  { id: "mc", label: "Multiple choice", jumpable: true },
  { id: "matching", label: "Matching", jumpable: true },
  { id: "shortAnswer", label: "Short answer", jumpable: true },
  { id: "branching", label: "Scenario", jumpable: true },
  { id: "review", label: "Review", jumpable: true },
];

type Props = {
  activeSection: ExamSection;
  completedSections: Set<ExamSection>;
  onSectionClick: (section: ExamSection) => void;
  onExit: () => void;
  timeRemaining: number;
  timeLimitSeconds: number;
  isSimulation?: boolean;
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function ExamProgress({
  activeSection,
  completedSections,
  onSectionClick,
  onExit,
  timeRemaining,
  timeLimitSeconds,
  isSimulation,
}: Props) {
  const isLowTime = timeRemaining <= timeLimitSeconds * 0.2;

  return (
    <div
      className="shrink-0 border-b border-border bg-[var(--surface)] h-14 relative flex items-center gap-2 px-4 sm:px-6"
      style={{ zIndex: 10 }}
    >
      <button
        onClick={onExit}
        className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-100 cursor-pointer shrink-0"
      >
        <X size={14} />
        {/* Label is a pointer nicety; the icon carries it on mobile where the
            row is tight. */}
        <span className="hidden sm:inline">Exit</span>
      </button>
      {/* Title — inline-centered in the flex row on mobile, viewport-centered
          via absolute positioning on desktop (unchanged there). */}
      <span className="flex-1 min-w-0 flex items-center justify-center gap-2 text-[13px] text-muted-foreground pointer-events-none sm:flex-none sm:absolute sm:left-1/2 sm:-translate-x-1/2">
        <span className="truncate">{isSimulation ? "Exam simulation" : "Certification exam"}</span>
        {isSimulation && (
          <span className="shrink-0 px-2 py-[1px] rounded-full text-[11px] font-medium bg-[var(--sidebar-active)] text-primary">
            Practice
          </span>
        )}
      </span>
      <span
        className={cn(
          "shrink-0 sm:ml-auto inline-flex items-center px-[10px] py-[2px] rounded-full text-[12px] font-medium tabular-nums transition-colors duration-300",
          isLowTime
            ? "bg-[color-mix(in_srgb,var(--destructive)_15%,transparent)] text-destructive"
            : "bg-[var(--sidebar-active)] text-foreground"
        )}
      >
        {formatTime(timeRemaining)} mins
      </span>
    </div>
  );
}

type SectionNavProps = {
  activeSection: ExamSection;
  completedSections: Set<ExamSection>;
  onSectionClick: (section: ExamSection) => void;
};

export function SectionNav({ activeSection, completedSections, onSectionClick }: SectionNavProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Keep the active pill in the visible scroll window as the section advances.
  // The active pill is disabled (non-jumpable), so the browser would otherwise
  // scroll the first *focusable* pill into view and push the current one off
  // the left edge on mobile.
  useEffect(() => {
    const c = scrollRef.current;
    const a = activeRef.current;
    if (!c || !a) return;
    c.scrollTo({ left: Math.max(0, a.offsetLeft - 16), behavior: "smooth" });
  }, [activeSection]);

  return (
    // Scrolls edge-to-edge on mobile where the five section pills don't fit;
    // resets inside the column on desktop. Matches the KC section-tabs strip.
    <div ref={scrollRef} className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
      {SECTIONS.map((s) => {
        const isActive = activeSection === s.id;
        const isDone = completedSections.has(s.id);
        const isClickable = s.jumpable && !isActive;

        return (
          <button
            key={s.id}
            ref={isActive ? activeRef : undefined}
            onClick={() => isClickable && onSectionClick(s.id)}
            disabled={!isClickable}
            className={cn(
              "flex items-center gap-1.5 px-3 h-7 rounded-full text-[12px] font-medium transition-all duration-150 shrink-0",
              isActive
                ? "bg-[var(--primary)] text-[var(--primary-foreground)] cursor-default"
                : isDone
                ? "bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-[var(--primary)] cursor-pointer hover:bg-[color-mix(in_srgb,var(--primary)_18%,transparent)]"
                : s.jumpable
                ? "bg-[var(--surface-raised)] text-muted-foreground border border-border cursor-pointer hover:text-foreground"
                : "bg-[var(--surface-raised)] text-muted-foreground border border-border cursor-default opacity-60"
            )}
          >
            {isDone && !isActive && <Check size={11} strokeWidth={2.5} />}
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
