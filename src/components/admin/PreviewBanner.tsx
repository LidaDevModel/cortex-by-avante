"use client";

import { Eye, X } from "lucide-react";

/**
 * Top strip for the admin content preview pages. Makes it unmistakable that
 * this is a preview (not the live learner screen) and offers a way out. Opened
 * in a new tab from the content tables, so Close attempts window.close().
 */
export function PreviewBanner({ note }: { note: string }) {
  return (
    <div
      className="flex items-center justify-between gap-3 px-4 sm:px-8 py-2.5 border-b border-border"
      style={{ background: "color-mix(in srgb, var(--primary) 10%, transparent)" }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Eye size={16} strokeWidth={1.5} className="text-primary shrink-0" />
        <span className="text-[13px] leading-[18px] font-semibold text-primary shrink-0">Preview</span>
        <span className="text-[13px] leading-[18px] text-muted-foreground truncate">— {note}</span>
      </div>
      <button
        onClick={() => window.close()}
        className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors duration-100 shrink-0"
      >
        <X size={14} strokeWidth={1.5} /> Close
      </button>
    </div>
  );
}
