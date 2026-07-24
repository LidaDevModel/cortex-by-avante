"use client";

import { cloneElement, type ReactElement } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ADMIN_LOCK_MESSAGE } from "@/hooks/use-admin-unlocked";

/**
 * Wrap an admin action button. When `locked`, the child is disabled (VISION
 * disabled state: 50% opacity + not-allowed) and a tooltip explains why. When
 * unlocked, the child renders untouched. The child must accept `disabled`
 * (e.g. our Button); links should pass a button-based trigger.
 */
export function LockGate({
  locked,
  message = ADMIN_LOCK_MESSAGE,
  children,
}: {
  locked: boolean;
  message?: string;
  children: ReactElement<{ disabled?: boolean }>;
}) {
  if (!locked) return children;
  const disabledChild = cloneElement(children, { disabled: true });
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-not-allowed">{disabledChild}</span>
        </TooltipTrigger>
        <TooltipContent>{message}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
