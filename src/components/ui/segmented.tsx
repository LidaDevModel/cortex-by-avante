"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  /** Optional leading icon (e.g. theme picker); omit for text-only segments. */
  icon?: LucideIcon;
};

/**
 * Segmented single-select control — the app's canonical pick-one toggle
 * (dashboard "New for your role" filter, Settings theme picker). The active
 * segment reads raised via a lighter background (dark) or a subtle shadow
 * (light), following the app's elevation convention; inactive segments are
 * muted text. One component so the two never drift apart.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex gap-0.5 p-0.5 rounded-[8px] bg-surface-raised border border-border",
        className
      )}
    >
      {options.map((o) => {
        const active = o.value === value;
        const Icon = o.icon;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 h-8 rounded-[6px] text-[13px] font-medium transition-[background-color,color] duration-150",
              active
                ? "bg-surface-lifted text-foreground shadow-[var(--shadow-thumb)] dark:shadow-none"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {Icon && <Icon size={14} strokeWidth={1.5} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
