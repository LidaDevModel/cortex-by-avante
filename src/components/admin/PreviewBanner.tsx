"use client";

import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";

/**
 * Top strip for the admin content preview pages. Makes it unmistakable that
 * this is a preview (not the live learner screen) and offers a way out.
 *
 * The preview used to open in a NEW TAB, so the way out was window.close().
 * It now opens in the app like every other admin screen, so the way out is a
 * real back link — window.close() silently did nothing on any tab the user
 * had not opened by script, which included every reload and every shared URL.
 */
export function PreviewBanner({ note, backHref, backLabel }: { note: string; backHref: string; backLabel: string }) {
  return (
    <div
      className="flex items-center justify-between gap-3 px-4 sm:px-8 py-2 border-b border-border"
      style={{ background: "color-mix(in srgb, var(--primary) 10%, transparent)" }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Eye size={16} strokeWidth={1.5} className="text-primary shrink-0" />
        <span className="text-[13px] leading-[18px] font-semibold text-primary shrink-0">Preview</span>
        <span className="text-[13px] leading-[18px] text-muted-foreground truncate">— {note}</span>
      </div>
      {/* min-h-11 = the 44px floor. The old Close was 32px. */}
      <Link
        href={backHref}
        className="flex items-center gap-1.5 min-h-11 px-2.5 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors duration-100 shrink-0"
      >
        <ArrowLeft size={14} strokeWidth={1.5} /> {backLabel}
      </Link>
    </div>
  );
}
