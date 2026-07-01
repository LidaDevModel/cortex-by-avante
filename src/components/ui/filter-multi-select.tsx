"use client";

import { ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

interface FilterMultiSelectProps {
  values: string[];
  onChange: (values: string[]) => void;
  options: Option[];
  placeholder: string;
  className?: string;
}

export function FilterMultiSelect({ values, onChange, options, placeholder, className }: FilterMultiSelectProps) {
  function toggle(value: string) {
    onChange(
      values.includes(value) ? values.filter((v) => v !== value) : [...values, value]
    );
  }

  const label =
    values.length === 0
      ? placeholder
      : values.length === options.length
      ? placeholder
      : values.length === 1
      ? options.find((o) => o.value === values[0])?.label ?? placeholder
      : `${values.length} selected`;

  const isFiltered = values.length > 0 && values.length < options.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "relative h-[40px] pl-3 pr-8 flex items-center rounded-[8px] border border-border bg-[var(--surface-raised)] text-[14px] leading-[20px] whitespace-nowrap outline-none focus-visible:ring-2 transition-shadow duration-100 cursor-pointer",
            className
          )}
          style={{
            color: isFiltered ? "var(--foreground)" : "var(--muted-foreground)",
            ["--tw-ring-color" as string]: "rgba(26,74,46,0.25)",
          }}
        >
          {label}
          <ChevronDown
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="min-w-max p-1"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {options.map((o) => {
          const checked = values.includes(o.value);
          return (
            <button
              key={o.value}
              onClick={() => toggle(o.value)}
              className={cn(
                "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-sm text-[14px] leading-[20px] text-left cursor-pointer transition-colors duration-100",
                "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <span
                className="shrink-0 w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors duration-100"
                style={
                  checked
                    ? { background: "var(--primary)", borderColor: "var(--primary)" }
                    : { borderColor: "var(--border)" }
                }
              >
                {checked && <Check size={10} strokeWidth={3} style={{ color: "var(--primary-foreground)" }} />}
              </span>
              <span>{o.label}</span>
            </button>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
