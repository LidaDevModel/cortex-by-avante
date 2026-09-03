"use client";

import { SearchX, WifiOff } from "lucide-react";
import { StatePanel } from "@/components/ui/state-panel";

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
 *
 * A thin wrapper over `StatePanel` (the app's single centred-state panel) that
 * keeps this named, dead-end-specific API for its many call sites. Nothing but
 * the icon choice and the tone lives here now.
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
  return (
    <StatePanel
      icon={icon === "offline" ? WifiOff : SearchX}
      title={title}
      description={description}
      action={{ label: actionLabel, href: actionHref, onClick: onAction }}
      secondary={
        secondaryLabel && (secondaryHref || onSecondaryAction)
          ? { label: secondaryLabel, href: secondaryHref, onClick: onSecondaryAction }
          : undefined
      }
    />
  );
}
