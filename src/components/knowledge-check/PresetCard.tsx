"use client";

import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * One actionable preset card — icon tile · title · meta · arrow. The shared
 * practice-launcher idiom, used by the Knowledge Check start section and the
 * dashboard's Quick practice widget so both speak one card language.
 */
export function PresetCard({
  icon,
  title,
  meta,
  onClick,
  disabled,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  meta: string;
  onClick: () => void;
  disabled?: boolean;
  /** Surface override — e.g. when the card sits inside a raised widget card. */
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      // Resting: raised on canvas (light) / lifted (dark); hover steps once more.
      className={cn(
        "group relative flex items-center gap-4 rounded-[12px] border border-transparent p-4 text-left bg-surface-raised dark:bg-surface-lifted transition-[translate,scale,box-shadow,background-color] duration-150 disabled:cursor-not-allowed disabled:opacity-60 enabled:hover:-translate-y-0.5 enabled:hover:shadow-md enabled:active:scale-[0.98] dark:enabled:hover:shadow-none dark:enabled:hover:bg-surface-chip-hover",
        className
      )}
    >
      <span
        className="flex items-center justify-center w-11 h-11 rounded-[10px] shrink-0 text-primary"
        style={{ background: "color-mix(in srgb, var(--accent-subtle) 45%, transparent)" }}
      >
        {icon}
      </span>
      <span className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="text-[15px] leading-[20px] font-semibold" style={{ color: "var(--primary)" }}>
          {title}
        </span>
        <span className="text-[13px] leading-[18px] text-muted-foreground truncate">{meta}</span>
      </span>
      <ArrowRight
        size={18}
        strokeWidth={1.5}
        className="shrink-0 text-muted-foreground transition-transform duration-150 group-enabled:group-hover:translate-x-0.5"
      />
    </button>
  );
}
