"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { useMobileNavVisible } from "@/hooks/use-mobile-nav";

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
    // Browse screens sit under the floating mobile nav — clear its footprint
    // (pill + gap + safe area) so the last content can scroll fully into view.
    // Focused-task screens (nav hidden) keep the full height.
    const navVisible = useMobileNavVisible();
    return (
      <div className={cn("relative flex-1 overflow-hidden", className)}>
        <div
          ref={ref}
          onScroll={onScroll}
          className={cn(
            "absolute inset-0 overflow-y-auto z-10 scroll-thin",
            navVisible && "pb-[calc(88px+env(safe-area-inset-bottom))] md:pb-0",
            innerClassName
          )}
          style={{ maskImage: mask, WebkitMaskImage: mask, animation: "screen-in 200ms ease-out both" }}
        >
          {children}
        </div>
      </div>
    );
  }
);
ScrollCanvas.displayName = "ScrollCanvas";
