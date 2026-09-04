"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const FEEDBACK_OPTIONS = ["Incomplete", "Wrong info", "Other"] as const;
type FeedbackOption = typeof FEEDBACK_OPTIONS[number];

export function ShareFeedbackModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  /** Called with the chosen reason and the free text (when "Other"). */
  onSubmit: (reason: FeedbackOption, note?: string) => void;
}) {
  const [selected, setSelected] = useState<FeedbackOption | null>(null);
  const [otherText, setOtherText] = useState("");

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  function handleSubmit() {
    if (!selected) return;
    onSubmit(selected, selected === "Other" ? otherText : undefined);
    onClose();
  }

  const canSubmit = selected !== null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-scrim"
      onClick={handleBackdrop}
    >
      <div
        className="relative w-[340px] rounded-[12px] bg-surface-raised p-6 flex flex-col gap-5"
        style={{
          boxShadow: "var(--shadow-modal-panel)",
          animation: "modal-in 200ms cubic-bezier(0.32,0.72,0,1) both",
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors duration-100"
          aria-label="Close"
        >
          <X size={15} />
        </button>

        <div className="flex flex-col gap-1">
          <h2 className="type-body font-semibold leading-[24px] text-foreground">Share feedback</h2>
          <p className="type-meta text-muted-foreground">Help us improve Cortex AI</p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {FEEDBACK_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => setSelected(opt)}
                className="px-3 py-1.5 rounded-full type-meta font-medium border transition-colors duration-100"
                style={
                  selected === opt
                    ? { background: "color-mix(in srgb, var(--primary) 10%, var(--surface))", borderColor: "var(--primary)", color: "var(--primary)" }
                    : { background: "transparent", borderColor: "var(--border)", color: "var(--foreground)" }
                }
              >
                {opt}
              </button>
            ))}
          </div>

          {selected === "Other" && (
            <input
              autoFocus
              value={otherText}
              onChange={e => setOtherText(e.target.value)}
              placeholder="Tell us more…"
              className="w-full h-10 rounded-lg border border-border bg-surface-raised px-3 type-meta text-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors duration-100"
            />
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="type-meta font-medium text-muted-foreground hover:text-foreground transition-colors duration-100 px-1"
          >
            Cancel
          </button>
          <Button size="cta" onClick={handleSubmit} disabled={!canSubmit}>
            Submit feedback
          </Button>
        </div>
      </div>
    </div>
  );
}
