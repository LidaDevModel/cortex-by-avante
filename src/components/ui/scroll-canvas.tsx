"use client";

import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useMobileNavVisible } from "@/hooks/use-mobile-nav";
import { useManageAccess } from "@/hooks/use-admin-unlocked";
import { isDrawerNav } from "@/lib/drawer-nav";

type Props = {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  fadeBottom?: number;
  onScroll?: React.UIEventHandler<HTMLDivElement>;
};

export const ScrollCanvas = forwardRef<HTMLDivElement, Props>(
  ({ children, className, innerClassName, fadeBottom = 48, onScroll }, ref) => {
    const mask = `linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - ${fadeBottom}px), transparent 100%)`;
    // Browse screens sit under the floating pill — clear its footprint (pill +
    // gap + safe area) so the last content can scroll fully into view.
    // Focused-task screens (nav hidden) keep the full height.
    //
    // The reservation follows the PILL, not the breakpoint: an admin below the
    // nav breakpoint navigates by drawer and has no pill overlapping the
    // canvas, so reserving there just left 88px of dead space at the bottom of
    // every admin screen. Width stays in CSS (`max-lg:`) so first paint is
    // correct and the padding never appears late.
    const navVisible = useMobileNavVisible();
    const canManage = useManageAccess();
    // Arriving from a drawer selection: no entrance fade. The drawer is still
    // sliding off, and two motions at once is what made that close feel wrong.
    // Read once at mount so a later re-render cannot re-trigger the fade.
    const [skipEntrance] = useState(isDrawerNav);
    return (
      <div className={cn("relative flex-1 overflow-hidden", className)}>
        <div
          ref={ref}
          onScroll={onScroll}
          className={cn(
            "absolute inset-0 overflow-y-auto z-10 scroll-thin",
            navVisible && !canManage && "max-lg:pb-[calc(88px+env(safe-area-inset-bottom))]",
            innerClassName
          )}
          style={{
            maskImage: mask,
            WebkitMaskImage: mask,
            animation: skipEntrance ? undefined : "screen-in 200ms ease-out both",
          }}
        >
          {children}
        </div>
      </div>
    );
  }
);
ScrollCanvas.displayName = "ScrollCanvas";
