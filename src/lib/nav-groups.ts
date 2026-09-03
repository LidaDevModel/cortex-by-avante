"use client";

import { useSyncExternalStore } from "react";

/*
 * Remembered open/closed state for the sidebar's collapsible groups.
 *
 * WHY A MODULE STORE AND NOT COMPONENT STATE. The nav drawer is a Sheet, and a
 * Sheet unmounts when it closes — so every time you lift the drawer the whole
 * tree is rebuilt and any in-component state is gone. Without this, a group you
 * opened by hand was shut again the next time you opened the menu.
 *
 * WHY IT MUST BE REACTIVE. The remount is what lets a plain `defaultOpen` read
 * work — each open re-evaluates it, so the Collapsibles can stay uncontrolled.
 * But `defaultOpen` is computed in the PARENT's render, and a bare module write
 * does not re-render the parent: the remounting Sheet would then be handed the
 * value from before the toggle, and the group would spring back. Subscribing
 * makes the parent recompute, so the next mount gets the current answer.
 * (A re-render while a group is mounted is harmless — an uncontrolled
 * Collapsible ignores later `defaultOpen` changes and keeps its own state.)
 *
 * Session-scoped on purpose — not persisted. A remembered nav shape is a
 * convenience within a sitting, not a preference worth surviving a reload.
 */

export type NavGroupId = "content" | "learning" | "training";

const remembered = new Map<NavGroupId, boolean>();
const listeners = new Set<() => void>();

// Snapshot must be referentially stable between writes, so bump a version
// counter rather than handing useSyncExternalStore a fresh object each call.
let version = 0;

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** What the user last chose for this group, or undefined if they never did. */
export function navGroupOpen(id: NavGroupId): boolean | undefined {
  return remembered.get(id);
}

/** Record a manual expand/collapse and wake subscribers. */
export function setNavGroupOpen(id: NavGroupId, open: boolean) {
  if (remembered.get(id) === open) return;
  remembered.set(id, open);
  version++;
  listeners.forEach((l) => l());
}

/** Subscribe a component to group changes so its `defaultOpen` reads stay current. */
export function useNavGroups() {
  useSyncExternalStore(
    subscribe,
    () => version,
    () => 0
  );
}
