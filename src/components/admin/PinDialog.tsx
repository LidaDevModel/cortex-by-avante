"use client";

import { useEffect } from "react";
import { X, Copy } from "lucide-react";
import { showToast } from "@/components/ui/toast";

/**
 * The activation-PIN chip: big spaced digits + copy. Shared by the invite
 * modal's result view and the PinDialog so the PIN always looks the same.
 */
export function PinCode({ pin }: { pin: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[8px] px-4 py-3 bg-surface-chip" style={{ border: "1px solid var(--border)" }}>
      <span className="text-[22px] leading-[28px] font-bold tracking-[0.2em] tabular-nums text-foreground">{pin}</span>
      <button
        onClick={() => { navigator.clipboard?.writeText(pin); showToast({ title: "PIN copied" }); }}
        className="flex items-center gap-1.5 text-[13px] font-medium text-primary hover:opacity-70 transition-opacity duration-100"
      >
        <Copy size={14} /> Copy
      </button>
    </div>
  );
}

/**
 * Shows an activation PIN the admin must read or hand to a colleague. A PIN is
 * content, not a confirmation — it must stay up until dismissed, so it gets a
 * dialog, never a toast. Modal chrome follows the documented spec: scrim,
 * scale-in, outside-click and Escape close, body scroll lock.
 */
export function PinDialog({ title, description, pin, onClose }: { title: string; description: string; pin: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-scrim" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="relative w-[380px] max-w-[calc(100vw-32px)] rounded-[12px] bg-surface-raised p-6 flex flex-col gap-5"
        style={{ boxShadow: "var(--shadow-modal-panel)", animation: "modal-in 200ms cubic-bezier(0.32,0.72,0,1) both" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors duration-100"
          aria-label="Close"
        >
          <X size={15} />
        </button>

        <div className="flex flex-col gap-1">
          <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">{title}</h2>
          <p className="text-[14px] leading-[20px] text-muted-foreground">{description}</p>
        </div>
        <PinCode pin={pin} />
        <div className="flex justify-end">
          <button onClick={onClose} className="h-9 px-4 rounded-lg text-[13px] font-semibold bg-primary text-primary-foreground transition-opacity duration-100 hover:opacity-90">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
