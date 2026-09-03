"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/*
 * StatePanel — the one centred "there is nothing here / you can't do this yet"
 * panel. Every part is optional except the title, so the same component covers
 * a bare filter-empty line and a full gate with icon, description and CTA.
 *
 * WHY IT EXISTS. The app had grown FIVE of these, no two alike: NotFoundState
 * (48px grey well, 16/24 title, outline button), the module exam gate (56px
 * primary-tinted well, 17/26 title, a hand-rolled 40px primary link), the
 * Manage locked panel (48px well, 20/28 title, Button size="cta"), the
 * modules/library filter-empties (no icon, one 15/24 muted line, outline
 * button), and the quick-check empty (32px bare icon, no well). Same job on
 * screen, five different sizes and weights.
 *
 * TYPE COMES FROM VISION'S RAMP, not from any of the five. The old 17/26 and
 * 16/24 titles were off-scale inventions; the title is now the H2 role
 * (20/28 · 600) and the description the Body role (15/24 · 400), or the Body
 * and Label roles at `size="sm"`.
 *
 * TONE, not decoration:
 *  - "neutral" (default) — a dead end or an empty result. Grey well, outline
 *    action. Nothing for the person to do here but go back or clear a filter.
 *  - "invite" — a gate they can act on: finish the chapters, finish the
 *    training. Primary-tinted well, primary action.
 *
 * SIZE:
 *  - "default" — owns the screen's body.
 *  - "sm" — sits inside a dashboard card, where a 56px well and a 48px CTA
 *    would overwhelm the card it lives in.
 */

type Act = {
  label: string;
  href?: string;
  onClick?: () => void;
};

export function StatePanel({
  icon: Icon,
  title,
  description,
  action,
  secondary,
  tone = "neutral",
  size = "default",
  className,
}: {
  /** Omit for filter-empty states, where an icon adds weight and no meaning. */
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: Act;
  /** A quieter second option — "Try a timed simulation", "Search the library". */
  secondary?: Act;
  tone?: "neutral" | "invite";
  size?: "default" | "sm";
  className?: string;
}) {
  const sm = size === "sm";
  const invite = tone === "invite";

  return (
    <div
      className={cn(
        "flex-1 flex flex-col items-center justify-center text-center px-6",
        sm ? "gap-3 py-6" : "gap-4 py-16",
        className
      )}
    >
      {Icon && (
        <span
          aria-hidden
          className={cn(
            "flex items-center justify-center rounded-full shrink-0",
            sm ? "w-10 h-10" : "w-14 h-14",
            invite ? "text-primary" : "bg-surface-raised text-muted-foreground"
          )}
          style={invite ? { background: "color-mix(in srgb, var(--primary) 8%, transparent)" } : undefined}
        >
          <Icon size={sm ? 20 : 24} strokeWidth={1.5} />
        </span>
      )}

      <div className="flex flex-col gap-1">
        <p
          className={cn(
            "font-semibold text-foreground",
            sm ? "text-[15px] leading-[24px]" : "text-[20px] leading-[28px]"
          )}
        >
          {title}
        </p>
        {description && (
          <p
            className={cn(
              "text-muted-foreground",
              sm ? "text-[14px] leading-[20px] max-w-[38ch]" : "text-[15px] leading-[24px] max-w-[46ch]"
            )}
          >
            {description}
          </p>
        )}
      </div>

      {(action || secondary) && (
        <div className={cn("flex flex-col items-center", sm ? "gap-1.5" : "mt-1 gap-2")}>
          {action && (
            <ActionButton
              act={action}
              variant={invite ? "default" : "outline"}
              size={sm ? "sm" : "cta"}
            />
          )}
          {secondary && <ActionButton act={secondary} variant="ghost" size="sm" />}
        </div>
      )}
    </div>
  );
}

function ActionButton({
  act,
  variant,
  size,
}: {
  act: Act;
  variant: "default" | "outline" | "ghost";
  size: "cta" | "sm";
}) {
  if (act.href) {
    return (
      <Button asChild variant={variant} size={size}>
        <Link href={act.href}>{act.label}</Link>
      </Button>
    );
  }
  return (
    <Button variant={variant} size={size} onClick={act.onClick}>
      {act.label}
    </Button>
  );
}
