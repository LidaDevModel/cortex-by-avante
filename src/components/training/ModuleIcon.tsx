import { ModuleIllustration } from "@/components/training/ModuleIllustration";
import type { ModuleCategory } from "@/lib/training-mock";

/**
 * Ambient bloom for a module row — the row-level half of the ModuleIcon
 * pattern. Render it as the FIRST child of the row, next to <ModuleIcon />.
 *
 * WHY THIS IS NOT INSIDE ModuleIcon ANY MORE. It used to be: a glow box inside
 * the icon wrapper, oversized (top/bottom -48px) so its hard edge fell outside
 * the row's overflow-hidden clip. That holds only while the row is ONE flex
 * line tall. The wrapper was `self-stretch`, and a flex item stretches within
 * its own flex line, not the whole container — so the moment a row wrapped
 * (the readiness board's primary and ready-to-certify rows, whose CTA is
 * full-width on mobile) the wrapper stayed 40px, the glow reached only 48px
 * past line 1, and its edge landed 13px INSIDE the row: a visible band across
 * the bottom padding. NewRequirementCard hit the same wall and worked around
 * it by dropping ModuleIcon altogether.
 *
 * Anchored to the row instead, the vertical overshoot is measured from the row
 * itself, so it cannot fall short at any row height or line count. Same recipe
 * as the certification detail card's full-card glow layer.
 *
 * Contract with the consuming row: the row must be `relative overflow-hidden`
 * (the bleed clips at its rounded corners) and its content must sit at
 * `relative z-10` so it paints above the bloom.
 */
export function ModuleGlow() {
  return (
    <span
      aria-hidden
      // Vertical: -48px past the row top and bottom, so the ellipse's soft
      // boundary is always outside the clip whatever the row's height.
      // Horizontal: left-anchored and 790px wide — the icon column plus the
      // 750px fade run the icon-anchored version used, so the bloom keeps the
      // width and falloff it has always had rather than rescaling per row.
      className="absolute -inset-y-12 left-[-16px] w-[790px] pointer-events-none z-0"
      style={{ background: "var(--illustration-glow-side-card)" }}
    />
  );
}

/**
 * Compact module icon for dashboard rows — the category illustration floats
 * directly on the row surface (no boxed tile, no visible edge). The ambient
 * bloom that sits under it is <ModuleGlow />, rendered by the row; see above
 * for why the two are separate.
 */
export function ModuleIcon({ category, size = 40 }: { category: ModuleCategory; size?: number }) {
  return (
    <span
      className="relative z-10 flex items-center justify-center shrink-0"
      style={{ width: size }}
    >
      <ModuleIllustration category={category} width={size} height={size} className="flex" />
    </span>
  );
}
