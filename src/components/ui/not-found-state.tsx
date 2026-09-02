"use client";

import Link from "next/link";
import { SearchX, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Full-height "we couldn't find this" state for detail routes reached with a
 * bad/stale id — always offers a way back to the parent list instead of
 * stranding the user (a field guard who followed a dead link mid-shift needs
 * an exit, not a full stop). Plain, no-blame copy (VISION error tone).
 *
 * Also serves the app's error boundary: pass `onAction` instead of
 * `actionHref` for a retry button, and `icon="offline"` for the load-failure
 * face. One component so a dead end and a failed load never drift apart
 * visually — they are the same shape of problem to the person looking at them.
 */
export function NotFoundState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryLabel,
  secondaryHref,
  onSecondaryAction,
  icon = "missing",
}: {
  title: string;
  description: string;
  actionLabel: string;
  /** A link out. Provide this OR `onAction`. */
  actionHref?: string;
  /** A button action, e.g. an error boundary's `reset()`. */
  onAction?: () => void;
  secondaryLabel?: string;
  secondaryHref?: string;
  /** Use instead of `secondaryHref` when the action must run code as well as
      navigate — an error boundary has to clear itself, or the next route
      renders behind the error screen. */
  onSecondaryAction?: () => void;
  icon?: "missing" | "offline";
}) {
  const Icon = icon === "offline" ? WifiOff : SearchX;
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex items-center justify-center w-12 h-12 rounded-full bg-surface-raised text-muted-foreground">
        <Icon size={22} strokeWidth={1.5} />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-[16px] leading-[24px] font-semibold text-foreground">{title}</p>
        <p className="text-[14px] leading-[20px] text-muted-foreground max-w-[320px]">{description}</p>
      </div>
      <div className="mt-1 flex flex-col items-center gap-2">
        {actionHref ? (
          <Button asChild variant="outline">
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        ) : (
          <Button variant="outline" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
        {secondaryLabel && (secondaryHref || onSecondaryAction) &&
          (onSecondaryAction ? (
            <Button variant="ghost" size="sm" onClick={onSecondaryAction}>
              {secondaryLabel}
            </Button>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link href={secondaryHref!}>{secondaryLabel}</Link>
            </Button>
          ))}
      </div>
    </div>
  );
}
