"use client";

import { Copy } from "lucide-react";
import { showToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

/**
 * The activation-PIN chip: big spaced digits + copy. Shared by the invite
 * modal's result view and the PinDialog so the PIN always looks the same.
 */
export function PinCode({ pin }: { pin: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[8px] px-4 py-3 bg-surface-chip" style={{ border: "1px solid var(--border)" }}>
      <span className="type-h2 font-bold tracking-[0.2em] tabular-nums text-foreground">{pin}</span>
      <button
        onClick={() => { navigator.clipboard?.writeText(pin); showToast({ title: "PIN copied" }); }}
        className="flex items-center gap-1.5 type-meta font-medium text-primary hover:opacity-70 transition-opacity duration-100"
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
  return (
    <Modal open onClose={onClose} title={title} description={description}>
      <PinCode pin={pin} />
      <div className="flex justify-end">
        <Button size="cta" onClick={onClose}>
          Done
        </Button>
      </div>
    </Modal>
  );
}
