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
 * ONE SET OF METRICS, no size variant. There was a "sm" for the two dashboard
 * card empties, on the assumption a 56px well and a 48px CTA would swamp a
 * card. Measured, the cards had 98px of slack — and the smaller CTA came out
 * at 32px, under VISION's 44px touch floor. A second scale bought nothing and
 * cost the standard, so it is gone.
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
  className,
}: {
  /** Omit for filter-empty states, where an icon adds weight and no meaning. */
  icon?: LucideIcon;
  /**
   * Omit for an empty RESULT — "no documents match your search" is a sentence,
   * not a heading, and setting it in the H2 role shouted a non-event. Those
   * states pass `description` alone and read as one quiet line. Pass at least
   * one of `title` / `description`.
   */
  title?: string;
  description?: string;
  action?: Act;
  /** A quieter second option — "Try a timed simulation", "Search the library". */
  secondary?: Act;
  tone?: "neutral" | "invite";
  className?: string;
}) {
  const invite = tone === "invite";

  return (
    <div
      // data-slot follows the house convention and makes the panel findable:
      // the screenshot harness asserts one is present before it shoots, so a
      // "panel screen" can never be filed without its panel.
      data-slot="state-panel"
      data-tone={tone}
      className={cn(
        "flex-1 flex flex-col items-center justify-center text-center px-6 gap-4 py-16",
        className
      )}
    >
      {Icon && (
        <span
          aria-hidden
          className={cn(
            "flex items-center justify-center rounded-full shrink-0 w-14 h-14",
            invite ? "text-primary" : "bg-surface-raised text-muted-foreground"
          )}
          style={invite ? { background: "color-mix(in srgb, var(--primary) 8%, transparent)" } : undefined}
        >
          <Icon size={24} strokeWidth={1.5} />
        </span>
      )}

      <div className="flex flex-col gap-1">
        {title && (
          <p
            className="text-[20px] leading-[28px] font-semibold text-foreground"
          >
            {title}
          </p>
        )}
        {description && (
          <p
            className="text-[15px] leading-[24px] text-muted-foreground max-w-[46ch]"
          >
            {description}
          </p>
        )}
      </div>

      {(action || secondary) && (
        <div className="mt-1 flex flex-col items-center gap-2">
          {action && <ActionButton act={action} variant={invite ? "default" : "outline"} size="cta" />}
          {/* min-h-11: a ghost button at size="sm" is 32px, under VISION's
              44px hit target — and on a dead end this is often the only
              way out. Type stays quiet; only the target grows. */}
          {secondary && <ActionButton act={secondary} variant="ghost" size="sm" className="min-h-11 px-3" />}
        </div>
      )}
    </div>
  );
}

function ActionButton({
  act,
  variant,
  size,
  className,
}: {
  act: Act;
  variant: "default" | "outline" | "ghost";
  size: "cta" | "sm";
  className?: string;
}) {
  if (act.href) {
    return (
      <Button asChild variant={variant} size={size} className={className}>
        <Link href={act.href}>{act.label}</Link>
      </Button>
    );
  }
  return (
    <Button variant={variant} size={size} className={className} onClick={act.onClick}>
      {act.label}
    </Button>
  );
}
