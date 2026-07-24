"use client";

import { FilePlus2, BookOpen, type LucideIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

export type NewContentKind = "file" | "module";

const OPTIONS: { kind: NewContentKind; icon: LucideIcon; title: string; desc: string }[] = [
  { kind: "file", icon: FilePlus2, title: "File", desc: "Add a document to the Library" },
  { kind: "module", icon: BookOpen, title: "Module", desc: "Create a training module" },
];

function OptionList({ onChoose }: { onChoose: (k: NewContentKind) => void }) {
  return (
    <div className="flex flex-col gap-2">
      {OPTIONS.map((o) => (
        <button
          key={o.kind}
          type="button"
          onClick={() => onChoose(o.kind)}
          className="group flex items-center gap-3 rounded-[8px] border border-border p-3 text-left transition-colors duration-100 hover:bg-[var(--surface-lifted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <span
            className="flex h-10 w-10 items-center justify-center rounded-[8px] shrink-0 text-primary"
            style={{ background: "color-mix(in srgb, var(--primary) 10%, transparent)" }}
          >
            <o.icon size={18} strokeWidth={1.5} />
          </span>
          <span className="flex flex-col min-w-0">
            <span className="text-[14px] leading-[20px] font-semibold text-foreground">{o.title}</span>
            <span className="text-[12px] leading-[16px] text-muted-foreground">{o.desc}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

/**
 * Chooser for the Home "New content" action — pick File or Module, then the
 * caller routes to that flow. Desktop: centred alert dialog; mobile: bottom
 * sheet (thumb-reachable), mirroring ExitConfirmDialog. Escape / Cancel close.
 */
export function NewContentDialog({
  open,
  onOpenChange,
  onChoose,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChoose: (kind: NewContentKind) => void;
}) {
  const isMobile = useIsMobile();
  const choose = (k: NewContentKind) => {
    onOpenChange(false);
    onChoose(k);
  };

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="rounded-t-[16px] bg-surface gap-0 px-6 pt-3 pb-[calc(24px+env(safe-area-inset-bottom))]"
        >
          <div aria-hidden className="mx-auto mb-4 h-1 w-9 rounded-full bg-border" />
          <SheetHeader className="p-0 gap-1.5 text-left">
            <SheetTitle className="text-[18px] leading-[24px] font-semibold text-foreground">Add content</SheetTitle>
            <SheetDescription className="text-[14px] leading-[20px] text-muted-foreground">
              What would you like to add?
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            <OptionList onChoose={choose} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="gap-4">
        <AlertDialogHeader className="gap-1.5">
          <AlertDialogTitle className="text-[20px] leading-[28px] font-semibold text-foreground">Add content</AlertDialogTitle>
          <AlertDialogDescription className="text-[14px] leading-[20px] text-muted-foreground">
            What would you like to add?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <OptionList onChoose={choose} />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
