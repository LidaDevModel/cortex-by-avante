import { useEffect, useState } from "react";

/**
 * Counts 0 → target over ~500ms once `start` is true; lands instantly under
 * reduced motion. Pass start=false to defer (e.g. until scrolled into view).
 */
export function useCountUp(target: number, start = true, durationMs = 500) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    let raf: number;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / durationMs);
      setValue(Math.round(t * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, start, durationMs]);
  return value;
}
