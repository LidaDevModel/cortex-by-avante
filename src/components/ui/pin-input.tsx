"use client";

import { useRef } from "react";

/**
 * Segmented one-time-PIN input. Digits stay visible (the PIN is single-use and
 * low-secrecy; visibility prevents mistyping in the field). Mobile-first
 * mechanics: numeric keypad, OS one-time-code suggestion, auto-advance,
 * backspace steps back, and pasting the whole code fills every box.
 */
export function PinInput({
  length = 6,
  value,
  onChange,
  error = false,
  disabled = false,
}: {
  length?: number;
  /** Current digits, e.g. "48" while partially entered. */
  value: string;
  onChange: (next: string) => void;
  /** Paints the field-error ring on every box. */
  error?: boolean;
  disabled?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const focusBox = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  function handleChange(i: number, raw: string) {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return;
    // Multi-digit input here means a paste or an OS code suggestion — fill from box i.
    const next = (value.slice(0, i) + digits).slice(0, length);
    onChange(next);
    focusBox(next.length >= length ? length - 1 : next.length);
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (value[i]) {
        onChange(value.slice(0, i) + value.slice(i + 1));
      } else if (i > 0) {
        onChange(value.slice(0, i - 1) + value.slice(i));
        focusBox(i - 1);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusBox(i - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusBox(i + 1);
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!digits) return;
    onChange(digits);
    focusBox(digits.length >= length ? length - 1 : digits.length);
  }

  return (
    <div className="flex gap-2" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={length} // allows paste/OS-fill through a single box
          value={value[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          aria-label={`PIN digit ${i + 1}`}
          className={`h-10 w-10 rounded-[8px] border border-input bg-surface text-center text-[16px] font-semibold tabular-nums text-foreground outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 ${
            error ? "field-error" : ""
          }`}
        />
      ))}
    </div>
  );
}
