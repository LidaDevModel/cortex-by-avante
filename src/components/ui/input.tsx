import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        // Read-only state — a real, correct value the user can read and copy but
        // never edit here. Reads as inert, not editable: flatter fill, quieter
        // border, slightly calmed text, no shadow, default cursor. Text stays
        // selectable (copy works). Focus keeps a subtle NEUTRAL cue (not the
        // editable green ring) so keyboard users still see it.
        "read-only:bg-transparent dark:read-only:bg-transparent read-only:border-input/70 read-only:text-foreground/75 read-only:shadow-none read-only:cursor-default read-only:focus-visible:ring-1 read-only:focus-visible:ring-border read-only:focus-visible:border-input",
        className
      )}
      {...props}
    />
  )
}

export { Input }
