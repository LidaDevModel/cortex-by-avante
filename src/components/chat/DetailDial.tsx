"use client";

import { useRef } from "react";
import { ChevronDown } from "lucide-react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { type DetailLevel } from "@/lib/chat-mock";

const LEVELS: { value: DetailLevel; label: string; description: string }[] = [
  { value: "concise", label: "Concise", description: "Just the essentials." },
  { value: "standard", label: "Standard", description: "A balanced answer." },
  { value: "detailed", label: "Detailed", description: "Full walkthrough with context." },
];

/**
 * Answer-detail dial — a quiet "Standard ⌄" trigger in the composer toolbar that
 * opens a popover with a three-stop snap slider (Shorter ↔ More detail) and a
 * live description. Mirrors the Claude "Effort" control, in Cortex tokens.
 */
export function DetailDial({
  value,
  onChange,
}: {
  value: DetailLevel;
  onChange: (level: DetailLevel) => void;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const index = Math.max(0, LEVELS.findIndex((l) => l.value === value));
  const current = LEVELS[index];
  const pct = (index / (LEVELS.length - 1)) * 100;

  function setFromClientX(clientX: number) {
    const rail = railRef.current;
    if (!rail) return;
    const rect = rail.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const i = Math.round(frac * (LEVELS.length - 1));
    if (LEVELS[i].value !== value) onChange(LEVELS[i].value);
  }

  function onPointerDown(e: React.PointerEvent) {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setFromClientX(e.clientX);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (e.buttons !== 1) return; // only while dragging
    setFromClientX(e.clientX);
  }
  function onKeyDown(e: React.KeyboardEvent) {
    if ((e.key === "ArrowLeft" || e.key === "ArrowDown") && index > 0) {
      e.preventDefault();
      onChange(LEVELS[index - 1].value);
    } else if ((e.key === "ArrowRight" || e.key === "ArrowUp") && index < LEVELS.length - 1) {
      e.preventDefault();
      onChange(LEVELS[index + 1].value);
    }
  }

  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label={`Answer detail: ${current.label}`}
          className="inline-flex items-center gap-1 h-8 px-2 rounded-[6px] text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-100"
        >
          {current.label}
          <ChevronDown size={14} strokeWidth={1.75} />
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side="top"
          align="end"
          sideOffset={10}
          className="z-[60] w-[264px] rounded-[12px] p-4 bg-surface outline-none [corner-shape:squircle]"
          style={{
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-floating)",
            animation: "msg-in 150ms ease-out both",
          }}
        >
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-[13px] font-semibold text-foreground">Answer detail</span>
            <span className="text-[12px] font-medium text-primary">{current.label}</span>
          </div>

          <div
            role="slider"
            tabIndex={0}
            aria-valuemin={0}
            aria-valuemax={LEVELS.length - 1}
            aria-valuenow={index}
            aria-valuetext={current.label}
            aria-label="Answer detail"
            onKeyDown={onKeyDown}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            className="relative h-9 flex items-center cursor-pointer rounded-[8px] outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_25%,transparent)]"
          >
            <div ref={railRef} className="relative w-full h-1.5 rounded-full" style={{ background: "var(--progress-track)" }}>
              <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct}%`, background: "var(--primary)" }} />
              {LEVELS.map((l, i) => {
                const p = (i / (LEVELS.length - 1)) * 100;
                return (
                  <span
                    key={l.value}
                    className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                    style={{ left: `${p}%`, background: i <= index ? "var(--primary)" : "var(--border)" }}
                  />
                );
              })}
              <span
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-surface"
                style={{ left: `${pct}%`, border: "1px solid var(--border)", boxShadow: "var(--shadow-thumb)" }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] leading-[14px] text-muted-foreground">Shorter</span>
            <span className="text-[11px] leading-[14px] text-muted-foreground">More detail</span>
          </div>

          <p className="mt-3 text-[12px] leading-[16px] text-muted-foreground">{current.description}</p>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
