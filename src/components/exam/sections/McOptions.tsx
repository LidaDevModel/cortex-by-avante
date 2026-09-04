"use client";

import { useRef } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/*
 * McOptions — the one multiple-choice option list, shared by the certification
 * exam and the knowledge check (which already shares Matching and
 * BranchingGame from this folder; multiple choice was the one type built twice).
 *
 * WHAT THE TWO COPIES BOTH GOT WRONG. Each rendered a list of plain <button>s.
 * To assistive tech that is a set of unrelated buttons: nothing said they were
 * one question's mutually exclusive answers, nothing said how many there were,
 * and nothing said which was chosen — `aria-checked` did not exist, so a
 * screen-reader user could select an option and get no confirmation.
 *
 * It is a radio group, so it is built as one:
 *   - container `role="radiogroup"`, labelled by the question
 *   - each option `role="radio"` with `aria-checked`
 *   - ROVING TABINDEX: the group is one Tab stop, and Arrow keys move between
 *     options — the standard radio-group interaction. Tabbing through four
 *     separate buttons is not how a radio group behaves.
 *
 * AND A NON-COLOUR SELECTED INDICATOR. The exam conveyed selection with a
 * border colour, a background tint and a letter chip that filled — all colour.
 * The knowledge check had only the border and tint. Selection now also swaps
 * the letter for a CHECK GLYPH, so the state survives greyscale, low vision and
 * a printout (WCAG 1.4.1).
 */

export function McOptions({
  options,
  selectedIndex,
  onSelect,
  labelledBy,
  className,
}: {
  options: string[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  /** id of the element holding the question text. */
  labelledBy: string;
  className?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: React.KeyboardEvent, i: number) {
    const last = options.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = i === last ? 0 : i + 1;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = i === 0 ? last : i - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next === null) return;
    e.preventDefault();
    // A radio group selects on arrow, which is the expected behaviour and also
    // means the choice is announced as focus moves.
    refs.current[next]?.focus();
    onSelect(next);
  }

  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className={cn("flex flex-col gap-3", className)}>
      {options.map((option, i) => {
        const isSelected = selectedIndex === i;
        return (
          <button
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            type="button"
            role="radio"
            aria-checked={isSelected}
            // Roving tabindex: one Tab stop for the whole group. With nothing
            // chosen yet the first option is the entry point.
            tabIndex={isSelected || (selectedIndex === null && i === 0) ? 0 : -1}
            onClick={() => onSelect(i)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "w-full text-left px-4 py-3.5 rounded-[12px] border-2 type-label transition-all duration-150 cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              isSelected
                ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_8%,transparent)] text-foreground"
                : "border-border bg-[var(--surface-raised)] text-foreground hover:border-[color-mix(in_srgb,var(--primary)_40%,transparent)] hover:bg-[color-mix(in_srgb,var(--primary)_4%,transparent)]"
            )}
          >
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center type-caption font-semibold transition-all duration-150",
                  isSelected
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-border text-muted-foreground"
                )}
              >
                {/* The glyph is the non-colour cue: letter -> check. */}
                {isSelected ? <Check size={13} strokeWidth={3} /> : String.fromCharCode(65 + i)}
              </span>
              <span>{option}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
