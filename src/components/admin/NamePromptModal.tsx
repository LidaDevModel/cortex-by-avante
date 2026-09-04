"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

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

  function submit() {
    const v = value.trim();
    if (!v) return;
    // The caller owns what happens next: a create-and-navigate flow keeps the
    // modal mounted until the next route renders (no flash of the list behind
    // it), while a stay-on-page flow closes itself. So we never auto-close here.
    onSubmit(v);
  }

  return (
    <Modal open onClose={onClose} title={title}>
      <label className="flex flex-col gap-1.5">
        <span className="type-label font-semibold text-foreground">{label}</span>
        <Input autoFocus value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
      </label>

      <div className="flex items-center justify-between">
        {/* min-h-11: a tertiary text link is still a tap target. VISION keeps it
            a link visually; only the target grows. */}
        <button
          onClick={onClose}
          className="min-h-11 -ml-1 px-1 type-meta font-medium text-muted-foreground hover:text-foreground transition-colors duration-100"
        >
          Cancel
        </button>
        <Button size="cta" onClick={submit} disabled={!value.trim()}>
          {submitLabel}
        </Button>
      </div>
    </Modal>
  );
}
