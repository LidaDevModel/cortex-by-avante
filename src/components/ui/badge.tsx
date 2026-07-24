import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "primary" | "accent";
export type BadgeVariant = "soft" | "outline";

/** Tinted-fill treatment per tone — all from existing tokens. */
const SOFT: Record<BadgeTone, CSSProperties> = {
  // Muted gray for quiet/inactive states (deactivated, draft, not-ready). A
  // tint of the gray text token so it reads as a soft gray pill in both modes
  // (raw --muted goes near-black in dark and would vanish on dark cards).
  neutral: { background: "color-mix(in srgb, var(--muted-foreground) 15%, transparent)", color: "var(--muted-foreground)" },
  success: { background: "color-mix(in srgb, var(--success) 12%, transparent)", color: "var(--success)" },
  warning: { background: "color-mix(in srgb, var(--warning) 14%, transparent)", color: "var(--warning)" },
  danger: { background: "color-mix(in srgb, var(--destructive) 12%, transparent)", color: "var(--destructive)" },
  primary: { background: "color-mix(in srgb, var(--primary) 10%, transparent)", color: "var(--primary)" },
  accent: { background: "color-mix(in srgb, var(--accent-subtle) 45%, transparent)", color: "var(--success)" },
};

/** Outline treatment per tone — transparent fill, tinted border. */
const OUTLINE: Record<BadgeTone, CSSProperties> = {
  neutral: { border: "1px solid var(--border)", color: "var(--muted-foreground)" },
  success: { border: "1px solid color-mix(in srgb, var(--success) 30%, transparent)", color: "var(--success)" },
  warning: { border: "1px solid color-mix(in srgb, var(--warning) 30%, transparent)", color: "var(--warning)" },
  danger: { border: "1px solid color-mix(in srgb, var(--destructive) 30%, transparent)", color: "var(--destructive)" },
  primary: { border: "1px solid color-mix(in srgb, var(--primary) 25%, transparent)", color: "var(--primary)" },
  accent: { border: "1px solid var(--border)", color: "var(--success)" },
};

/**
 * The one badge for the whole product — a pill-shaped status/label marker.
 *
 * Shape is FIXED (full pill, `rounded-full`) so every badge reads as the same
 * object; meaning is carried by `tone` (colour), never by a different outline.
 * `variant` picks a tinted fill (default) or an outline. Pass a leading `icon`
 * for badges that want one. Never fork a differently-shaped badge — add a tone
 * or variant here instead.
 */
export function Badge({
  tone = "neutral",
  variant = "soft",
  icon,
  title,
  className,
  style,
  children,
}: {
  tone?: BadgeTone;
  variant?: BadgeVariant;
  icon?: ReactNode;
  title?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1 shrink-0 px-2.5 py-0.5 rounded-full text-[12px] leading-[16px] font-medium whitespace-nowrap",
        className,
      )}
      style={{ ...(variant === "outline" ? OUTLINE[tone] : SOFT[tone]), ...style }}
    >
      {icon}
      {children}
    </span>
  );
}
