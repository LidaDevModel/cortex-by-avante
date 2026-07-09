"use client";

import { ArrowRight } from "lucide-react";
import { ModuleIllustration } from "@/components/training/ModuleIllustration";
import type { Module } from "@/lib/training-mock";

/**
 * Exam-simulation setup — the same full-canvas phase treatment as the custom
 * "Configure your check" screen (centered card on the glow canvas), not a modal.
 *
 * The exam is per module, so the user picks a module to rehearse. Scoped to
 * in-progress modules: you simulate the exam for something you're actively
 * working on, to gauge readiness before the real certification.
 */
export function KCExamSimConfig({
  modules,
  onSelect,
  onCancel,
}: {
  modules: Module[];
  onSelect: (moduleId: string) => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8">
      <div
        className="w-full max-w-[440px] flex flex-col gap-6 rounded-[12px] p-6"
        style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
      >
        <div className="flex flex-col gap-1">
          <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">Exam simulation</h2>
          <p className="text-[13px] leading-[20px] text-muted-foreground">
            Practice the timed exam for a module you&apos;re currently working on. It&apos;s practice — no certificate is awarded.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {modules.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              className="group flex items-center gap-3 rounded-[8px] border border-border bg-surface px-3 py-2.5 text-left transition-colors duration-100 hover:bg-[var(--surface-raised)]"
            >
              <ModuleIllustration category={m.category} width={32} height={32} className="shrink-0" />
              <span className="flex flex-col min-w-0 flex-1">
                <span className="text-[14px] leading-[20px] font-medium text-foreground truncate">{m.title}</span>
                <span className="text-[12px] leading-[16px] text-muted-foreground tabular-nums">{m.progress}% complete</span>
              </span>
              <ArrowRight size={16} strokeWidth={1.5} className="shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>

        <button
          onClick={onCancel}
          className="text-[13px] leading-[20px] text-muted-foreground hover:text-foreground transition-colors duration-100 text-center py-1"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
