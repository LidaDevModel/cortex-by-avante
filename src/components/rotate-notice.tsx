"use client";

import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * "Turn your phone upright" — shown only on a PHONE HELD SIDEWAYS.
 *
 * Every layout switch in the app tests width alone and hands the desktop
 * layout to anything wider than 1024. A modern phone in landscape is wider
 * than that (iPhone 14 is 844 across, 15 Pro Max is 932), so rotating the
 * phone traded a thumb-reachable nav for a 256px sidebar over about 334px of
 * usable height — the chat transcript came down to roughly two lines. Portrait
 * is the supported orientation on a phone, and this says so.
 *
 * WHY IT CAN BE DISMISSED. WCAG 1.3.4 (Orientation, AA) requires that content
 * not be restricted to a single display orientation unless the orientation is
 * essential. A guard who has propped a phone in a landscape cradle, or who
 * uses a device fixed in landscape, must not be shut out. So this steers
 * firmly and then gets out of the way, and `use-nav-shape` treats a short
 * viewport as compact so the landscape they continue into keeps the phone nav
 * rather than the sidebar.
 *
 * THE GATE. `(orientation: landscape) and (max-height: 500px)` catches a
 * phone sideways (390–430 tall) and no tablet (768+) or laptop. It is read
 * through `matchMedia` in an effect rather than a stylesheet rule, because a
 * stylesheet rule lost the cascade to Tailwind's own `hidden` utility on the
 * element — and every other viewport question in this app is already answered
 * this way (see `use-nav-shape`). Starts false, so the server render and the
 * first client render agree and nothing flashes.
 */
const QUERY = "(orientation: landscape) and (max-height: 500px)";

export function RotateNotice() {
  const [phoneSideways, setPhoneSideways] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const onChange = () => {
      setPhoneSideways(mql.matches);
      // Turning back to portrait clears the dismissal, so the next rotation
      // is answered again rather than remembering a choice made on a
      // different task. Done here rather than in a second effect keyed on the
      // orientation, which would be a setState cascade.
      if (!mql.matches) setDismissed(false);
    };
    mql.addEventListener("change", onChange);
    onChange();
    return () => mql.removeEventListener("change", onChange);
  }, []);

  if (!phoneSideways || dismissed) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-4 px-8 text-center"
      style={{ background: "var(--background)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rotate-title"
    >
      <span
        aria-hidden
        className="flex items-center justify-center w-14 h-14 rounded-full bg-surface-raised text-muted-foreground"
      >
        <RotateCcw size={24} strokeWidth={1.5} />
      </span>
      <div className="flex flex-col gap-1">
        <p id="rotate-title" className="type-h2 font-semibold text-foreground">
          Turn your phone upright
        </p>
        <p className="type-body text-muted-foreground max-w-[36ch]">
          Cortex is built for portrait on a phone. Sideways leaves too little room to read.
        </p>
      </div>
      <Button variant="cta-secondary" size="cta" onClick={() => setDismissed(true)}>
        Continue sideways
      </Button>
    </div>
  );
}
