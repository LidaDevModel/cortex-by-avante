"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

/**
 * The VISION error/notification helper. Screens call `showToast({ title,
 * description })`; the shell-mounted <Toaster /> renders them bottom-right
 * (desktop) / bottom (mobile, raised clear of the floating nav) on a neutral
 * surface with a close affordance.
 */

export type ToastInput = {
  title: string;
  description?: string;
  /** Auto-dismiss delay. Defaults to 5000ms. */
  durationMs?: number;
  /** Optional single action (e.g. Undo). Runs, then dismisses the toast. */
  action?: { label: string; onClick: () => void };
};

type Toast = ToastInput & { id: number };

type Listener = (toasts: Toast[]) => void;

let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<Listener>();

function emit() {
  for (const l of listeners) l([...toasts]);
}

export function showToast(input: ToastInput) {
  const toast: Toast = { id: nextId++, durationMs: 5000, ...input };
  toasts = [...toasts, toast];
  emit();
  return toast.id;
}

export function dismissToast(id: number) {
  toasts = toasts.filter(t => t.id !== id);
  emit();
}

function ToastCard({ toast }: { toast: Toast }) {
  useEffect(() => {
    const id = setTimeout(() => dismissToast(toast.id), toast.durationMs);
    return () => clearTimeout(id);
  }, [toast.id, toast.durationMs]);

  return (
    <div
      role="status"
      className="pointer-events-auto relative w-[320px] rounded-[12px] border border-border bg-surface-raised p-4 pr-10 flex flex-col gap-1"
      style={{
        boxShadow: "var(--shadow-modal-panel)",
        animation: "msg-in 200ms ease-out both",
      }}
    >
      <button
        onClick={() => dismissToast(toast.id)}
        aria-label="Dismiss notification"
        className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors duration-100"
      >
        <X size={13} />
      </button>
      <p className="text-[14px] leading-[20px] font-semibold text-foreground">{toast.title}</p>
      {toast.description && (
        <p className="text-[13px] leading-[18px] text-muted-foreground">{toast.description}</p>
      )}
      {toast.action && (
        <button
          onClick={() => { toast.action!.onClick(); dismissToast(toast.id); }}
          className="self-start mt-1 text-[13px] leading-[18px] font-semibold text-primary hover:opacity-70 transition-opacity duration-100"
        >
          {toast.action.label}
        </button>
      )}
    </div>
  );
}

export function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(() => {
    const listener: Listener = next => setItems(next);
    listeners.add(listener);
    // Sync with toasts already in the store — a toast fired right before a
    // navigation must survive into the next layout's Toaster.
    listener([...toasts]);
    return () => { listeners.delete(listener); };
  }, []);

  if (items.length === 0) return null;

  // One slot: bottom-right on desktop, bottom-centre on mobile — raised
  // (bottom-24) so it clears the floating nav cluster and the chat composer.
  return (
    <div className="pointer-events-none fixed z-[60] flex flex-col gap-2 bottom-24 inset-x-4 items-center md:inset-x-auto md:right-6 md:bottom-6 md:items-end">
      {items.map(t => <ToastCard key={t.id} toast={t} />)}
    </div>
  );
}
