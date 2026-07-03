import { forwardRef } from "react";
import { cn } from "@/lib/utils";

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
    return (
      <div className={cn("relative flex-1 overflow-hidden", className)}>
        <div
          ref={ref}
          onScroll={onScroll}
          className={cn("absolute inset-0 overflow-y-auto z-10 scroll-thin", innerClassName)}
          style={{ maskImage: mask, WebkitMaskImage: mask }}
        >
          {children}
        </div>
      </div>
    );
  }
);
ScrollCanvas.displayName = "ScrollCanvas";
