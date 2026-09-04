"use client";

import type { Message } from "@/components/chat/AiMessage";

/**
 * Chat transcripts — what Cortex actually said.
 *
 * THE BUG THIS EXISTS FOR. The history panel stored only a TITLE. Opening a
 * saved conversation fed that title back to the resolver as a brand-new
 * question and rendered the result as a two-message exchange. Nothing was
 * restored, because nothing had been kept. "Morning briefing notes" came back
 * as "I don't have anything on it in the Library yet" — a saved conversation
 * rendering as a deflection. In a product where a guard may have acted on an
 * answer mid-shift, the conversation IS the record: it has to be reviewable.
 *
 * RETENTION (decision D5). Guards share phones, so history must not be a pile
 * of everyone's questions on one device. Two rules:
 *   - keyed PER PERSON, by the signed-in email
 *   - anything older than 90 days is dropped on read
 * The owner's decision is per-person storage on the SERVER. A mock cannot do
 * that, so this is the honest client half behind one seam: swap the four
 * exported functions for API calls and nothing above them changes.
 *
 * A transcript is stored as the app's own `Message[]`, so restoring is
 * literally setting state — no re-rendering, no re-resolving, no chance of a
 * different answer than the one that was given.
 */

const PREFIX = "cortex-chat-transcripts";
export const RETENTION_DAYS = 90;

type Stored = {
  /** ISO date the conversation was saved. Drives retention and grouping. */
  savedAt: string;
  messages: Message[];
};

type Bag = Record<string, Stored>;

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

/** Storage key for the signed-in person. Falls back to a shared key only when
    there is no session, which in practice means the demo's own screens. */
function keyFor(): string {
  try {
    const raw = localStorage.getItem("cortex-session");
    const email = raw ? (JSON.parse(raw)?.email as string | undefined) : undefined;
    return email ? `${PREFIX}:${email.toLowerCase()}` : PREFIX;
  } catch {
    return PREFIX;
  }
}

function daysSinceIso(iso: string): number {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return Number.POSITIVE_INFINITY;
  return (Date.now() - then) / 86_400_000;
}

/** Reads the bag and drops anything past retention. Pruning on READ means it
    happens without a scheduler, and a transcript can never outlive the window
    just because nobody wrote that day. */
function read(): Bag {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(keyFor());
    const bag = raw ? (JSON.parse(raw) as Bag) : {};
    if (!bag || typeof bag !== "object") return {};
    const kept: Bag = {};
    let dropped = false;
    for (const [id, entry] of Object.entries(bag)) {
      if (!entry || !Array.isArray(entry.messages)) continue;
      if (daysSinceIso(entry.savedAt) > RETENTION_DAYS) {
        dropped = true;
        continue;
      }
      kept[id] = entry;
    }
    if (dropped) write(kept);
    return kept;
  } catch {
    return {};
  }
}

function write(bag: Bag) {
  try {
    localStorage.setItem(keyFor(), JSON.stringify(bag));
  } catch {
    /* storage full or unavailable — history is a convenience, never fatal */
  }
}

/** Store (or replace) a conversation's transcript. */
export function saveTranscript(id: string, messages: Message[], savedAt = new Date().toISOString()) {
  if (!messages.length) return;
  const bag = read();
  bag[id] = { savedAt, messages };
  write(bag);
  emit();
}

/** The stored transcript, or null when there is none (or it has expired). */
export function getTranscript(id: string): Message[] | null {
  return read()[id]?.messages ?? null;
}

/** When it was saved — used to group the list by day. */
export function getSavedAt(id: string): string | null {
  return read()[id]?.savedAt ?? null;
}

export function deleteTranscript(id: string) {
  const bag = read();
  if (!(id in bag)) return;
  delete bag[id];
  write(bag);
  emit();
}

export function subscribeTranscripts(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
