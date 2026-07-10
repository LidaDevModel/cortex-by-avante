import { ModuleIllustration } from "@/components/training/ModuleIllustration";
import type { ModuleCategory } from "@/lib/training-mock";

/**
 * Compact module icon for dashboard rows — the small horizontal ModuleCard's
 * treatment: the category illustration floats directly on the card surface with
 * an ambient glow anchored to the icon zone that bleeds rightward under the row
 * content and fades out (no boxed tile, no visible edge).
 *
 * Contract with the consuming row (same as ModuleCard): the row must be
 * `relative overflow-hidden` (the bleed clips at the row's rounded corners) and
 * its text/action content must sit at `relative z-10` so it paints above the
 * fading bloom. The wrapper is `self-stretch`, so the glow spans the full row
 * height while the illustration stays vertically centered.
 */
export function ModuleIcon({ category, size = 40 }: { category: ModuleCategory; size?: number }) {
  return (
    <span
      className="relative self-stretch flex items-center justify-center shrink-0"
      style={{ width: size }}
    >
      {/* ModuleCard practice: the glow box extends far beyond the row bounds so
          its hard edge always falls OUTSIDE the row's overflow-hidden clip —
          inside the row you only ever see the smooth fade, which either
          completes naturally (wide rows) or terminates at the row's own rounded
          edge (narrow rows). A small box would put a visible gradient step
          mid-surface, worst in dark mode. */}
      <span
        className="absolute pointer-events-none z-0"
        style={{
          top: -48,
          bottom: -48,
          left: -16,
          width: "calc(100% + 750px)",
          background: "var(--illustration-glow-side-card)",
        }}
      />
      <ModuleIllustration category={category} width={size} height={size} className="relative z-10 flex" />
    </span>
  );
}
