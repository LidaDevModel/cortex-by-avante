"use client"

import * as React from "react"
import { Dialog as SheetPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        // .sheet-scrim carries the fade at the panel's own durations (220ms
        // in / 180ms out). It used to fade in 100ms against a 200ms panel,
        // so the dim lifted while the panel was still half on screen.
        "sheet-scrim fixed inset-0 z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs",
        className
      )}
      {...props}
    />
  )
}

/* Whether this sheet shows a close button. It is declared on `SheetContent`
   (where it always was) but RENDERED by `SheetHeader`, so the icon, the title
   and the close sit on one row with a shared vertical centre.

   Before, the button was `position: absolute; top: 12px` against the panel,
   while the title was laid out inside a header padded `16px 16px 0`. Their
   centres were 34px and 26px from the panel top — the button 8px low in every
   sheet that showed one. The 44px target had made it worse: at 32px its centre
   happened to land near the title's.

   Notifications had already worked around this by turning the shared button
   off and rendering its own inside the header row. That workaround is what
   this makes standard. */
const SheetCloseContext = React.createContext(false);

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          // z-[55]: explicitly above the overlay (z-50) — Radix can portal the
          // overlay after the content, and at equal z the overlay's backdrop
          // blur would wash the panel itself. Toasts stay above at z-[60].
                    // .sheet-panel slides the panel fully off its edge on VISION's
          // panel curve. It replaces the stock fade-plus-40px-nudge, which
          // dissolved the panel in place instead of dismissing it.
          "sheet-panel fixed z-[55] flex flex-col gap-4 bg-popover bg-clip-padding text-sm text-popover-foreground shadow-lg data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm",
          className
        )}
        {...props}
      >
        <SheetCloseContext.Provider value={showCloseButton}>
          {children}
        </SheetCloseContext.Provider>
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

/**
 * The header ROW: whatever the caller puts in it on the left, the close button
 * on the right, one shared vertical centre.
 *
 * Children keep stacking (a title over a description) inside their own column,
 * so `items-center` centres the close against a single-line title without
 * pulling it into the middle of a two-line block. Only single-line headers
 * show a close button in practice — the two that stack a description both
 * pass `showCloseButton={false}`.
 */
function SheetHeader({ className, children, ...props }: React.ComponentProps<"div">) {
  const showClose = React.useContext(SheetCloseContext)
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex items-center justify-between gap-2 p-4", className)}
      {...props}
    >
      <div className="flex flex-col gap-1.5 min-w-0">{children}</div>
      {showClose && (
        <SheetPrimitive.Close data-slot="sheet-close" asChild>
          <Button
            variant="ghost"
            /* 44px, the thumb floor. `-mr-1.5` pulls the button's own padding
               back so its ICON lines up with the header's right edge, without
               shrinking the target. */
            className="-mr-1.5 size-11 shrink-0"
            size="icon-sm"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </Button>
        </SheetPrimitive.Close>
      )}
    </div>
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("font-heading font-medium text-foreground", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
