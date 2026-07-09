"use client";

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
      className="shrink-0 border-b border-border bg-[var(--surface)] h-14 relative flex items-center px-6"
      style={{ zIndex: 10 }}
    >
      <button
        onClick={onExit}
        className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-100 cursor-pointer"
      >
        <X size={14} />
        Exit
      </button>
      <span className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 text-[13px] text-muted-foreground pointer-events-none">
        {isSimulation ? "Exam simulation" : "Certification exam"}
        {isSimulation && (
          <span className="px-2 py-[1px] rounded-full text-[11px] font-medium bg-[var(--sidebar-active)] text-primary">
            Practice
          </span>
        )}
      </span>
      <span
        className={cn(
          "ml-auto inline-flex items-center px-[10px] py-[2px] rounded-full text-[12px] font-medium tabular-nums transition-colors duration-300",
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
  return (
    <div className="flex items-center gap-2">
      {SECTIONS.map((s) => {
        const isActive = activeSection === s.id;
        const isDone = completedSections.has(s.id);
        const isClickable = s.jumpable && !isActive;

        return (
          <button
            key={s.id}
            onClick={() => isClickable && onSectionClick(s.id)}
            disabled={!isClickable}
            className={cn(
              "flex items-center gap-1.5 px-3 h-7 rounded-full text-[12px] font-medium transition-all duration-150",
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
