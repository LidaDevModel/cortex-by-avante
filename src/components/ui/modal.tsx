"use client";

import { useEffect, useRef } from "react";
import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/*
 * Modal — the app's centred dialog, on Radix `Dialog`.
 *
 * WHY IT EXISTS. Four admin dialogs were hand-rolled as
 * `<div className="fixed inset-0">`: InviteUserModal, NamePromptModal,
 * PinDialog and RoleChangeDialog. They looked right and closed on an outside
 * click, but they were not dialogs to anything but the eye —
 *
 *   - no `role="dialog"` and no `aria-modal`, so a screen reader was never told
 *     one had opened; the page behind stayed the "current" context
 *   - no focus trap, so Tab walked straight out of the dialog into the page
 *     underneath it, still visible through the scrim
 *   - no focus restore, so dismissing one dropped focus back to the top of the
 *     document
 *   - no Escape
 *   - the close affordance was 28px, under VISION's 44px hit target
 *
 * Radix hands all of that over for free. This wrapper keeps the shape those
 * four already had — centred card, scrim, close top-right, outside-click
 * closes — so nothing moves on screen, and adds VISION's modal timings
 * (backdrop 160ms, card 0.96 -> 1 over 200ms on its own curve) and the 44px
 * close target.
 *
 * For a DESTRUCTIVE confirm use `ExitConfirmDialog` (Radix AlertDialog) instead:
 * an alertdialog interrupts, which is right when the answer matters and wrong
 * for a form.
 */

export function Modal({
  open,
  onClose,
  title,
  /** Announced with the title. Pass one whenever the dialog has body copy. */
  description,
  /** Hide the ✕ when the footer's own Cancel is the only intended way out. */
  showClose = true,
  className,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  showClose?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  /*
   * Focus restore, done here rather than left to Radix.
   *
   * Radix restores focus to the element that opened the dialog — but only while
   * it is still mounted to do it. Every caller of this component mounts it
   * conditionally (`{prompt && <NamePromptModal …/>}`) because the dialog's
   * content depends on data that does not exist when it is closed. So closing
   * unmounts the whole tree in the same tick and Radix's restore never runs:
   * focus landed on <body>, which drops a keyboard user at the top of the
   * document — the exact fault this migration was meant to fix.
   *
   * Capturing the previously-focused element on mount and returning focus on
   * unmount fixes it without forcing every call site to hold null-safe state.
   * This cleanup runs after Radix's (child effects clean up first), so it has
   * the last word.
   */
  const restoreTo = useRef<HTMLElement | null>(null);
  useEffect(() => {
    restoreTo.current = document.activeElement as HTMLElement | null;
    return () => {
      const el = restoreTo.current;
      // Only if it is still in the document — a row action can remove its own
      // trigger, and focusing a detached node silently does nothing.
      if (el && document.contains(el)) el.focus();
    };
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        {/* VISION: backdrop 160ms ease-out. Radix owns the outside-click. */}
        <Dialog.Overlay
          className="fixed inset-0 z-50 bg-scrim data-[state=open]:animate-[scrim-in_160ms_ease-out_both]"
        />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            "w-[380px] max-w-[calc(100vw-32px)] rounded-[12px] bg-surface-raised p-6",
            "flex flex-col gap-5 outline-none",
            // VISION: card scales 0.96 -> 1 over 200ms, cubic-bezier(0.32,0.72,0,1)
            "data-[state=open]:animate-[modal-in_200ms_cubic-bezier(0.32,0.72,0,1)_both]",
            className
          )}
          style={{ boxShadow: "var(--shadow-modal-panel)" }}
        >
          <Dialog.Title className="text-[20px] leading-[28px] font-semibold text-foreground">
            {title}
          </Dialog.Title>

          {description ? (
            <Dialog.Description className="text-[14px] leading-[20px] text-muted-foreground -mt-3">
              {description}
            </Dialog.Description>
          ) : (
            // Radix warns without one, and a dialog with no description should
            // say so rather than leave assistive tech guessing.
            <Dialog.Description className="sr-only">{title}</Dialog.Description>
          )}

          {children}

          {showClose && (
            <Dialog.Close
              aria-label="Close"
              // 44px target (was 28px), the glyph stays small.
              className="absolute top-2.5 right-2.5 w-11 h-11 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors duration-100"
            >
              <X size={15} />
            </Dialog.Close>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
