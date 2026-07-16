"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  exitLabel: string;
  onExit: () => void;
  /** Safe/cancel action label. Defaults to the focused-task wording. */
  cancelLabel?: string;
};

/**
 * Confirm-before-exit for focused tasks (exam, knowledge check). On mobile it's
 * a bottom sheet — thumb-reachable, sliding up from the edge; on desktop it's a
 * centered alert dialog. Outside-tap / Escape both cancel (safe: you stay in
 * the task). The safe action (Keep going) sits lowest on mobile — closest to
 * the thumb — with the destructive exit above it.
 */
export function ExitConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  exitLabel,
  onExit,
  cancelLabel = "Keep going",
}: Props) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="rounded-t-[16px] bg-surface gap-0 px-6 pt-3 pb-[calc(24px+env(safe-area-inset-bottom))]"
        >
          {/* Grab handle — the bottom-sheet affordance */}
          <div aria-hidden className="mx-auto mb-4 h-1 w-9 rounded-full bg-border" />
          <SheetHeader className="p-0 gap-1.5 text-left">
            <SheetTitle className="text-[18px] leading-[24px] font-semibold text-foreground">
              {title}
            </SheetTitle>
            <SheetDescription className="text-[14px] leading-[20px] text-muted-foreground">
              {description}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-2 pt-6">
            <Button variant="destructive" size="cta" className="w-full" onClick={onExit}>
              {exitLabel}
            </Button>
            <Button size="cta" className="w-full" onClick={() => onOpenChange(false)}>
              {cancelLabel}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="destructive" onClick={onExit}>
            {exitLabel}
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
