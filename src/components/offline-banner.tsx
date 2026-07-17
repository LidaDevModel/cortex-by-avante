"use client";

import { CloudOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-online-status";

/**
 * Shell-level connectivity banner. Quiet by design — a field guard loses signal
 * constantly, so this reassures ("your saved content still works") rather than
 * alarms. Shows only while offline; slides in below the header, above content.
 * Neutral surface, never an all-red error bar (VISION error tone).
 */
export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="shrink-0 flex items-center justify-center gap-2 px-4 py-2 border-b border-border bg-surface-raised text-muted-foreground"
      style={{ animation: "msg-in 200ms ease-out both" }}
    >
      <CloudOff size={14} strokeWidth={1.5} className="shrink-0" />
      <span className="text-[12px] leading-[16px] font-medium">
        You&apos;re offline. Showing saved copies.
      </span>
    </div>
  );
}
