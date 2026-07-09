"use client";

import { useEffect } from "react";
import { X, ArrowRight } from "lucide-react";
import { CATEGORY_LABELS, type KCCategory } from "@/lib/knowledge-check-mock";

/**
 * Category picker for "Exam simulation". An exam follows a category, so the
 * user chooses which one to sit — then it runs the certification-exam engine in
 * practice mode. Lightweight modal (scrim + scale-in), closes on Escape and
 * outside click per the modal contract.
 */
export function KCExamSimDialog({
  open,
  categories,
  onPick,
  onClose,
}: {
  open: boolean;
  categories: KCCategory[];
  onPick: (category: KCCategory) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-scrim p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-[440px] rounded-[12px] bg-surface-raised p-6 flex flex-col gap-5"
        style={{ boxShadow: "var(--shadow-modal-panel)", animation: "modal-in 200ms cubic-bezier(0.32,0.72,0,1) both" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors duration-100"
        >
          <X size={15} />
        </button>

        <div className="flex flex-col gap-1">
          <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">Exam simulation</h2>
          <p className="text-[13px] leading-[20px] text-muted-foreground">
            Pick a category to sit its exam under real timed conditions. It&apos;s practice — no certificate is awarded.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onPick(cat)}
              className="group flex items-center justify-between gap-3 rounded-[8px] border border-border bg-surface px-4 h-[44px] text-left transition-colors duration-100 hover:bg-[var(--surface-raised)]"
            >
              <span className="text-[14px] leading-[20px] font-medium text-foreground">{CATEGORY_LABELS[cat]}</span>
              <ArrowRight size={16} strokeWidth={1.5} className="text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
