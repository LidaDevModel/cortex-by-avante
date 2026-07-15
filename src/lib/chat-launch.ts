import type { Attachment } from "@/components/chat/AttachmentChip";

/**
 * One-shot handoff for launching the chat from elsewhere (the dashboard "Ask
 * Cortex" box). Text can't carry files in a URL, so the launcher stashes the
 * message here and the chat screen picks it up on mount. Client-side navigation
 * keeps the same document alive, so image object-URLs stay valid across the hop.
 */
const KEY = "cortex-chat-launch";

export type ChatLaunch = { text: string; attachments: Attachment[] };

export function stashChatLaunch(launch: ChatLaunch) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(launch));
  } catch {
    /* storage unavailable — non-fatal */
  }
}

/** Reads and clears the pending launch (one-shot). */
export function takeChatLaunch(): ChatLaunch | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    sessionStorage.removeItem(KEY);
    return JSON.parse(raw) as ChatLaunch;
  } catch {
    return null;
  }
}
