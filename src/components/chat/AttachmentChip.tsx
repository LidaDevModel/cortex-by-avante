"use client";

import { FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

/** A file or photo attached to a chat message. Mock: the app holds and shows
    the file, but the canned assistant can't actually read its contents. */
export type Attachment = {
  id: string;
  name: string;
  size: number; // bytes
  kind: "image" | "file";
  /** Object URL for image previews; absent for non-image files. */
  url?: string;
};

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Attachment chip — icon/thumbnail · name · size, with an optional remove
 * control. Removable in the composer tray; static on a sent message bubble.
 */
export function AttachmentChip({
  attachment,
  onRemove,
  className,
}: {
  attachment: Attachment;
  onRemove?: () => void;
  className?: string;
}) {
  const { name, size, kind, url } = attachment;
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 h-11 pl-1.5 pr-2 rounded-[10px] bg-surface-raised border border-border max-w-[220px]",
        className
      )}
    >
      <span className="flex items-center justify-center w-8 h-8 rounded-[7px] shrink-0 overflow-hidden bg-surface-chip text-primary">
        {kind === "image" && url ? (
          // eslint-disable-next-line @next/next/no-img-element -- object URL, not a static asset
          <img src={url} alt="" className="w-full h-full object-cover" />
        ) : (
          <FileText size={15} strokeWidth={1.5} />
        )}
      </span>
      <span className="flex flex-col min-w-0 leading-tight">
        <span className="text-[12px] leading-[16px] font-medium text-foreground truncate">{name}</span>
        <span className="text-[11px] leading-[14px] text-muted-foreground tabular-nums">{formatFileSize(size)}</span>
      </span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${name}`}
          className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors duration-100"
        >
          <X size={13} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
