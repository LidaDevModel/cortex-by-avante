"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";

/**
 * Small single-field modal used for New folder, New document, and Rename. Modal
 * chrome follows the documented spec: scrim, scale-in, outside-click and Escape
 * close, body scroll lock, Enter submits.
 */
export function NamePromptModal({
  title,
  label,
  initial = "",
  submitLabel = "Save",
  onSubmit,
  onClose,
}: {
  title: string;
  label: string;
  initial?: string;
  submitLabel?: string;
  onSubmit: (value: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(initial);

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

  function submit() {
    const v = value.trim();
    if (!v) return;
    // The caller owns what happens next: a create-and-navigate flow keeps the
    // modal mounted until the next route renders (no flash of the list behind
    // it), while a stay-on-page flow closes itself. So we never auto-close here.
    onSubmit(v);
  }

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

        <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">{title}</h2>

        <label className="flex flex-col gap-1.5">
          <span className="text-[14px] leading-[20px] font-semibold text-foreground">{label}</span>
          <Input autoFocus value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
        </label>

        <div className="flex items-center justify-between">
          <button onClick={onClose} className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-100 px-1">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!value.trim()}
            className="h-9 px-4 rounded-lg text-[13px] font-semibold bg-primary text-primary-foreground disabled:opacity-50 transition-opacity duration-100 hover:opacity-90"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
