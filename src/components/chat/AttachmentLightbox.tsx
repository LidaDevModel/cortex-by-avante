"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FileText, X } from "lucide-react";
import { type Attachment } from "@/components/chat/AttachmentChip";

/**
 * Full-size viewer for a sent attachment. VISION modal contract: scrim
 * backdrop, scale-in, outside-click + Escape close, body-scroll lock, ≥44px
 * close. Image → the picture on the scrim. File → the document in a framed
 * panel that scrolls vertically (PDF/text render inline via the browser; other
 * types show a plain "no preview" note). Session object URLs only — a restored
 * attachment with no live URL isn't openable (its card stays static).
 */
function canPreviewInline(a: Attachment): boolean {
  return a.type === "application/pdf" || (a.type?.startsWith("text/") ?? false);
}

export function AttachmentLightbox({ attachment, onClose }: { attachment: Attachment; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (!attachment.url || typeof document === "undefined") return null;
  const { url, name, kind } = attachment;

  // Portal to <body>: the message it lives in keeps a transform (msg-in ...both),
  // which would otherwise make position:fixed resolve against the message box
  // instead of the viewport.
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      style={{ background: "var(--scrim)", animation: "scrim-in 160ms ease-out both" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={name}
    >
      {/* Close — surface chip so it's legible over the scrim in both modes; sits
          outside the content so it never covers it. ≥44px hit target. */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 z-10 flex items-center justify-center w-11 h-11 rounded-full bg-surface border border-border text-foreground hover:bg-surface-raised transition-colors duration-100"
        style={{ boxShadow: "var(--shadow-floating)" }}
      >
        <X size={18} strokeWidth={2} />
      </button>

      {kind === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element -- object URL, not a static asset
        <img
          src={url}
          alt={name}
          className="max-w-full max-h-full object-contain rounded-[12px]"
          style={{ animation: "modal-in 200ms cubic-bezier(0.32,0.72,0,1) both", boxShadow: "var(--shadow-modal-panel)" }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div
          className="relative w-full max-w-[880px] h-full max-h-[86vh] rounded-[12px] overflow-hidden bg-surface border border-border"
          style={{ animation: "modal-in 200ms cubic-bezier(0.32,0.72,0,1) both", boxShadow: "var(--shadow-modal-panel)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {canPreviewInline(attachment) ? (
            // The browser's native viewer handles vertical scroll (multi-page
            // PDFs, long text).
            <iframe src={url} title={name} className="w-full h-full border-0" />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 h-full px-6 text-center">
              <span className="flex items-center justify-center w-12 h-12 rounded-[10px] bg-surface-chip text-muted-foreground">
                <FileText size={22} strokeWidth={1.5} />
              </span>
              <p className="text-[14px] leading-[20px] font-medium text-foreground break-all max-w-full">{name}</p>
              <p className="text-[13px] leading-[18px] text-muted-foreground">Preview isn&apos;t available for this file type.</p>
            </div>
          )}
        </div>
      )}
    </div>,
    document.body
  );
}
