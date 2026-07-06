"use client";

import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export function FilterSelect({ value, onChange, options, placeholder, className }: FilterSelectProps) {
  const selected = options.find((o) => o.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn("relative h-[40px] pl-3 pr-8 flex items-center rounded-[8px] border border-border bg-[var(--surface-raised)] text-[14px] leading-[20px] whitespace-nowrap outline-none focus-visible:ring-2 transition-shadow duration-100 cursor-pointer", className)}
          style={{
            color: selected ? "var(--foreground)" : "var(--muted-foreground)",
            ["--tw-ring-color" as string]: "color-mix(in srgb, var(--primary) 25%, transparent)",
          }}
        >
          {selected?.label ?? placeholder}
          <ChevronDown
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="min-w-[var(--radix-dropdown-menu-trigger-width)] p-1"
      >
        {placeholder && (
          <DropdownMenuItem
            onClick={() => onChange("")}
            className={cn(
              "text-[14px] leading-[20px] cursor-pointer",
              !value && "bg-secondary text-secondary-foreground focus:bg-secondary focus:text-secondary-foreground"
            )}
          >
            {placeholder}
          </DropdownMenuItem>
        )}

        {options.map((o) => (
          <DropdownMenuItem
            key={o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              "text-[14px] leading-[20px] cursor-pointer",
              value === o.value && "bg-secondary text-secondary-foreground focus:bg-secondary focus:text-secondary-foreground"
            )}
          >
            {o.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
