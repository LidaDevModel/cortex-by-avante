"use client";

import { useState } from "react";
import { Pencil, Copy, Check } from "lucide-react";
import { AttachmentChip, type Attachment } from "@/components/chat/AttachmentChip";
import { AttachmentLightbox } from "@/components/chat/AttachmentLightbox";

/**
 * A sent user message. The pencil doesn't edit in place — it drops the text
 * back into the composer as a fresh draft (no rewind; nothing is removed), so
 * the user tweaks and re-sends from the input where they normally type.
 */
export function UserMessage({
  content,
  attachments,
  onEdit,
}: {
  content: string;
  attachments?: Attachment[];
  /** Hand this message's text back to the composer. */
  onEdit: () => void;
}) {
  const [copied, setCopied] = useState(false);
  // The image tapped open in the full-size viewer (session images only — a
  // tile with no live URL isn't openable, so it stays static).
  const [viewing, setViewing] = useState<Attachment | null>(null);

  function handleCopy() {
    if (!content) return;
    try { navigator.clipboard?.writeText(content); } catch { /* best-effort */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col items-end gap-1 group" style={{ animation: "msg-in 200ms ease-out both" }}>
      {attachments && attachments.length > 0 && (
        <div className="flex flex-wrap justify-end gap-2 max-w-[85%] mb-0.5">
          {attachments.map((a) => (
            <AttachmentChip
              key={a.id}
              attachment={a}
              onOpen={a.url ? () => setViewing(a) : undefined}
            />
          ))}
        </div>
      )}

      {viewing && <AttachmentLightbox attachment={viewing} onClose={() => setViewing(null)} />}
      {content && (
        <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-[24px] text-foreground break-words bg-surface-raised">
          {content}
        </div>
      )}
      {content && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
          <button
            onClick={onEdit}
            aria-label="Edit message"
            className="p-1.5 rounded-lg hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-colors duration-100"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={handleCopy}
            aria-label={copied ? "Copied" : "Copy message"}
            className="p-1.5 rounded-lg hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-colors duration-100"
          >
            {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
          </button>
        </div>
      )}
    </div>
  );
}
