"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Keeps a scroll container pinned to the bottom as its content grows — the
 * "watch it generate" behavior for streaming chat.
 *
 * Model: follows the bottom while the user is at (or returns to) the bottom;
 * releases the instant the user scrolls up to read back; re-engages when they
 * scroll back down. It never animates and never restores a saved offset — it
 * only ever sets `scrollTop = scrollHeight`, and only while pinned — so it can't
 * fight a user scroll or snap them to a stale position.
 *
 * Why direction-aware rather than a suppress-timer (the file viewer's pattern):
 * timing windows for "is this my scroll or the user's" have bitten this codebase
 * twice. Deriving intent from scroll *direction* needs no magic interval — our
 * own downward jumps read as "still at the bottom", and only a genuine upward
 * move releases.
 *
 * The container/content are wired with **callback refs** (not ref objects) so
 * the scroll listener and ResizeObserver attach the moment the nodes mount —
 * important here because the scroll surface only renders once a conversation
 * exists, well after the hook first runs.
 */

const AT_BOTTOM_PX = 64; // within this of the bottom counts as "at the bottom" → pinned
const UP_INTENT_PX = 4; // an upward move larger than this (while not at bottom) releases

export function useStickToBottom() {
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);
  const [contentEl, setContentEl] = useState<HTMLElement | null>(null);
  const pinnedRef = useRef(true);
  const lastTopRef = useRef(0);

  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const syncEdges = useCallback(() => {
    if (!scrollEl) return;
    setCanScrollUp(scrollEl.scrollTop > 4);
    setCanScrollDown(scrollEl.scrollTop + scrollEl.clientHeight < scrollEl.scrollHeight - 4);
  }, [scrollEl]);

  /** Imperatively return to the bottom and re-pin (send, scroll-to-bottom button). */
  const jumpToBottom = useCallback(() => {
    pinnedRef.current = true;
    if (!scrollEl) return; // container not mounted yet — pin stays true, so first growth follows
    scrollEl.scrollTop = scrollEl.scrollHeight;
    lastTopRef.current = scrollEl.scrollTop;
    syncEdges();
  }, [scrollEl, syncEdges]);

  // Direction-aware pin, updated only by real scroll events.
  useEffect(() => {
    if (!scrollEl) return;
    lastTopRef.current = scrollEl.scrollTop;
    const onScroll = () => {
      const top = scrollEl.scrollTop;
      const atBottom = top + scrollEl.clientHeight >= scrollEl.scrollHeight - AT_BOTTOM_PX;
      if (atBottom) {
        pinnedRef.current = true;
      } else if (top < lastTopRef.current - UP_INTENT_PX) {
        pinnedRef.current = false; // user scrolled up to read back
      }
      lastTopRef.current = top;
      syncEdges();
    };
    scrollEl.addEventListener("scroll", onScroll, { passive: true });
    syncEdges();
    return () => scrollEl.removeEventListener("scroll", onScroll);
  }, [scrollEl, syncEdges]);

  // Follow content growth while pinned. ResizeObserver catches every height
  // change (each stream tick, image load, layout shift). Re-stamping lastTopRef
  // after our own jump keeps the resulting scroll event reading as "still at the
  // bottom" rather than an upward move.
  useEffect(() => {
    if (!scrollEl || !contentEl) return;
    const ro = new ResizeObserver(() => {
      if (pinnedRef.current) {
        scrollEl.scrollTop = scrollEl.scrollHeight;
        lastTopRef.current = scrollEl.scrollTop;
      }
      syncEdges();
    });
    ro.observe(contentEl);
    return () => ro.disconnect();
  }, [scrollEl, contentEl, syncEdges]);

  return {
    scrollRef: setScrollEl,
    contentRef: setContentEl,
    canScrollUp,
    canScrollDown,
    jumpToBottom,
  };
}
