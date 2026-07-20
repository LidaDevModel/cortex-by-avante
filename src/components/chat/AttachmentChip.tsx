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
  /** MIME type — decides whether the viewer can preview the file inline. */
  type?: string;
  /** Object URL used by the tile/viewer (images and files); absent once a
      conversation is restored from storage (blob URLs aren't serialisable). */
  url?: string;
};

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Uppercase extension for the file card's meta line ("PDF · 240 KB"). */
function fileExt(name: string): string | null {
  const i = name.lastIndexOf(".");
  if (i <= 0 || i === name.length - 1) return null;
  const ext = name.slice(i + 1);
  return ext.length <= 5 ? ext.toUpperCase() : null;
}

/** Split for middle truncation — the head truncates, the tail (which carries
    the extension) stays visible, so "Patrol-checklist-v2.pdf" clips to
    "Patrol-che…t-v2.pdf" instead of losing the part that tells files apart. */
function splitForMiddleTruncate(name: string): [string, string] {
  const TAIL = 8;
  if (name.length <= TAIL) return [name, ""];
  return [name.slice(0, -TAIL), name.slice(-TAIL)];
}

const TILE = 72; // shared height so mixed images + files read as one rail

/**
 * Attachment — two shapes by kind (an image is its own label; a document's
 * name is its only identity):
 * - image → square thumbnail tile, no visible name (kept in alt/title), X
 *   floating in the corner;
 * - file → card with icon, middle-truncated name and "EXT · size" meta.
 * Removable in the composer tray; static on a sent message bubble.
 */
export function AttachmentChip({
  attachment,
  onRemove,
  onOpen,
  className,
}: {
  attachment: Attachment;
  onRemove?: () => void;
  /** When set (sent messages), the image tile becomes a button that opens the
      full-size viewer. Composer tiles pass onRemove instead. */
  onOpen?: () => void;
  className?: string;
}) {
  const { name, size, kind, url } = attachment;

  if (kind === "image" && url) {
    // eslint-disable-next-line @next/next/no-img-element -- object URL, not a static asset
    const img = (
      <img
        src={url}
        alt={name}
        title={name}
        className={cn("w-full h-full object-cover", onOpen && "transition-transform duration-150 group-hover:scale-105")}
      />
    );
    const base = "relative shrink-0 rounded-[10px] border border-border overflow-hidden";

    if (onOpen) {
      return (
        <button
          type="button"
          onClick={onOpen}
          aria-label={`View ${name}`}
          className={cn("group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50", base, className)}
          style={{ width: TILE, height: TILE }}
        >
          {img}
        </button>
      );
    }

    return (
      <div className={cn(base, className)} style={{ width: TILE, height: TILE }}>
        {img}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${name}`}
            // Token-derived scrim chip: foreground-on-photo stays legible in
            // both modes (light: dark chip / white X; dark: light chip / dark X).
            className="absolute top-1 right-1 flex items-center justify-center w-[22px] h-[22px] rounded-full bg-foreground/55 text-background backdrop-blur-[2px] hover:bg-foreground/75 transition-colors duration-100"
          >
            <X size={12} strokeWidth={2.5} />
          </button>
        )}
      </div>
    );
  }

  const [head, tail] = splitForMiddleTruncate(name);
  const ext = fileExt(name);
  const fileBase = "inline-flex items-center gap-2.5 shrink-0 rounded-[10px] bg-surface-raised border border-border w-[200px]";
  const fileInner = (
    <>
      <span className="flex items-center justify-center w-9 h-9 rounded-[8px] shrink-0 bg-surface-chip text-muted-foreground">
        <FileText size={16} strokeWidth={1.5} />
      </span>
      <span className="flex flex-col gap-0.5 min-w-0 flex-1 text-left" title={name}>
        <span className="flex text-[12px] leading-[16px] font-medium text-foreground min-w-0">
          <span className="truncate">{head}</span>
          {tail && <span className="shrink-0">{tail}</span>}
        </span>
        <span className="text-[11px] leading-[14px] text-muted-foreground tabular-nums">
          {ext ? `${ext} · ${formatFileSize(size)}` : formatFileSize(size)}
        </span>
      </span>
    </>
  );

  if (onOpen) {
    return (
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open ${name}`}
        className={cn(
          fileBase,
          "px-2 cursor-pointer transition-[translate,box-shadow,background-color] duration-150 hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-none dark:hover:bg-surface-chip-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          className
        )}
        style={{ height: TILE }}
      >
        {fileInner}
      </button>
    );
  }

  return (
    <div className={cn(fileBase, "pl-2 pr-2", className)} style={{ height: TILE }}>
      {fileInner}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${name}`}
          className="shrink-0 self-start mt-1.5 flex items-center justify-center w-6 h-6 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors duration-100"
        >
          <X size={13} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
