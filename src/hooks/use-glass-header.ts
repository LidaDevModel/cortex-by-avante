import { useCallback, useState } from "react";

const BASE = "transition-[background-color,border-color] duration-200 border-b";
const ON = "bg-surface-glass backdrop-blur-md border-border/50";
const OFF = "bg-transparent border-transparent";

/**
 * Glass-on-scroll PageHeader behavior for canvas-glow screens: transparent at
 * rest, a translucent glass bar with a hairline once the canvas has scrolled.
 * Wire `headerClassName` to <PageHeader className> and `onScroll` to the
 * screen's <ScrollCanvas>. Screens with phase-swapped canvases (e.g. Knowledge
 * check) call `reset()` when the canvas unmounts so stale glass never lingers.
 */
export function useGlassHeader(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);

  const onScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => setScrolled(e.currentTarget.scrollTop > threshold),
    [threshold]
  );
  const reset = useCallback(() => setScrolled(false), []);

  return { headerClassName: `${BASE} ${scrolled ? ON : OFF}`, onScroll, reset };
}
