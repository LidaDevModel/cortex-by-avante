"use client";

import { useState, useRef, useEffect } from "react";
import { showToast } from "@/components/ui/toast";
import { History, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { deleteTranscript, saveTranscript } from "@/lib/chat-history-store";
import type { Message } from "@/components/chat/AiMessage";

export type Conversation = {
  id: string;
  title: string;
  group: "Today" | "Yesterday" | "Last 7 days" | "Last 30 days";
};

/*
 * The demo's past conversations.
 *
 * Every title is a QUESTION that the resolver actually grounds — because
 * opening one materialises its transcript from the title (see the chat
 * screen's restore path), and a title that hits no Library topic came back as
 * "I don't have anything on it in the Library yet". A history list whose
 * entries deflect when opened is worse than no history list.
 *
 * That is also why they read as questions rather than filenames: in a real
 * product a conversation's name comes from its first message, so "Queries &
 * Responses" was never a name a guard could have produced.
 */
const MOCK_CONVERSATIONS: Conversation[] = [
  { id: "1", title: "What are the escalation tiers?", group: "Today" },
  { id: "2", title: "Who do I tell about a Tier 2 incident?", group: "Today" },
  { id: "3", title: "How do I log an incident?", group: "Yesterday" },
  { id: "4", title: "What goes in the incident report?", group: "Yesterday" },
  { id: "5", title: "How often are perimeter patrols?", group: "Last 7 days" },
  { id: "6", title: "What do I scan at each checkpoint?", group: "Last 7 days" },
  { id: "7", title: "What do I do when the fire alarm sounds?", group: "Last 7 days" },
  { id: "8", title: "First aid responsibilities on shift", group: "Last 7 days" },
  { id: "9", title: "Shift handover checklist", group: "Last 7 days" },
  { id: "10", title: "What happens at end of shift?", group: "Last 30 days" },
  { id: "11", title: "Signing in a contractor at the gatehouse", group: "Last 30 days" },
  { id: "12", title: "Visitor badge rules", group: "Last 30 days" },
  { id: "13", title: "Which radio channel for the control room?", group: "Last 30 days" },
  { id: "14", title: "Radio comms during an emergency", group: "Last 30 days" },
  { id: "15", title: "Patrol route after hours", group: "Last 30 days" },
  { id: "16", title: "ID check at the main entrance", group: "Last 30 days" },
  { id: "17", title: "Reporting an altercation on site", group: "Last 30 days" },
  { id: "18", title: "When to call emergency services", group: "Last 30 days" },
  { id: "19", title: "Evacuation assembly points", group: "Last 30 days" },
  { id: "20", title: "Access control for deliveries", group: "Last 30 days" },
];

const GROUPS = ["Today", "Yesterday", "Last 7 days", "Last 30 days"] as const;

// Conversations the user has left (archived from the chat screen) live in
// localStorage so they survive navigating away and back, and appear under
// "Today" ahead of the mock defaults. Archived ids are prefixed so rename/delete
// can write the change back to the store.
const ARCHIVE_KEY = "cortex-chat-archived";

function loadArchived(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const arr = JSON.parse(localStorage.getItem(ARCHIVE_KEY) ?? "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function persistArchived(list: Conversation[]) {
  try {
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(list.slice(0, 50)));
  } catch {
    /* storage full / unavailable — non-fatal */
  }
}

/** Conversation list state, lifted so the desktop rail and the mobile sheet
    (both mounted, breakpoint-swapped) share one source of truth. */
export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  // Merge archived conversations in after mount (they're client-only storage).
  useEffect(() => {
    const archived = loadArchived();
    if (archived.length) setConversations([...archived, ...MOCK_CONVERSATIONS]);
  }, []);
  const rename = (id: string, title: string) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)));
    if (id.startsWith("arch-")) persistArchived(loadArchived().map((c) => (c.id === id ? { ...c, title } : c)));
  };
  /**
   * Delete with an undo, not a confirmation. VISION's own care-inversion:
   * removing a section here already offers "Undo", while deleting a whole
   * conversation had no guard of any kind — one menu click and it was gone.
   * Undo beats a dialog for a reversible action; the position is restored, not
   * just the item, so the list does not reshuffle.
   */
  const remove = (id: string) => {
    let restore: (() => void) | null = null;
    setConversations((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx === -1) return prev;
      const removed = prev[idx];
      restore = () => {
        setConversations((cur) => {
          if (cur.some((c) => c.id === removed.id)) return cur;
          const next = [...cur];
          next.splice(Math.min(idx, next.length), 0, removed);
          return next;
        });
        if (removed.id.startsWith("arch-")) persistArchived([removed, ...loadArchived()]);
      };
      return prev.filter((c) => c.id !== id);
    });
    if (id.startsWith("arch-")) persistArchived(loadArchived().filter((c) => c.id !== id));
    // The transcript goes with it — otherwise a deleted conversation's text
    // would sit in storage for 90 days with nothing pointing at it.
    deleteTranscript(id);
    showToast({
      title: "Conversation deleted",
      action: { label: "Undo", onClick: () => restore?.() },
    });
  };
  // Record a just-left conversation into history (most recent first) — updates
  // the live list AND the store, so it shows under "Today" on this same return.
  /**
   * File the current exchange under history.
   *
   * `messages` is the whole point: archiving used to keep the TITLE ONLY, so
   * reopening a conversation re-asked the title as a fresh question and showed
   * whatever came back — sometimes a deflection, sometimes a different answer
   * than the one originally given. The caller already has the full array in
   * hand at this moment; it just used to discard it.
   */
  const archive = (title: string, messages: Message[] = []) => {
    const t = title.trim();
    if (!t) return;
    const convo: Conversation = { id: `arch-${Date.now()}`, title: t, group: "Today" };
    setConversations((prev) => [convo, ...prev]);
    persistArchived([convo, ...loadArchived()]);
    saveTranscript(convo.id, messages);
  };
  return { conversations, rename, remove, archive };
}

function ConversationItem({
  conversation,
  onSelect,
  onRename,
  onDelete,
}: {
  conversation: Conversation;
  onSelect: (conversation: Conversation) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [draft, setDraft] = useState(conversation.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming) inputRef.current?.focus();
  }, [isRenaming]);

  const save = () => {
    const trimmed = draft.trim();
    if (trimmed) onRename(conversation.id, trimmed);
    setIsRenaming(false);
  };

  if (isRenaming) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") setIsRenaming(false);
        }}
        className="w-full type-meta text-foreground bg-transparent border border-primary rounded px-2 py-0.5 outline-none focus:ring-1 focus:ring-primary"
      />
    );
  }

  return (
    <div
      className="group flex items-center gap-1 px-2 py-2 rounded-lg cursor-pointer hover:bg-sidebar-accent transition-colors duration-100"
      onClick={() => onSelect(conversation)}
    >
      <span className="flex-1 type-meta text-foreground truncate min-w-0">
        {conversation.title}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {/* Visible by default (touch has no hover); hover-revealed on md+ */}
          <button
            aria-label="Conversation options"
            onClick={(e) => e.stopPropagation()}
            className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-100 p-2 -my-1.5 rounded hover:bg-foreground/5 shrink-0"
          >
            <MoreHorizontal size={14} className="text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem
            onClick={() => {
              setDraft(conversation.title);
              setIsRenaming(true);
            }}
          >
            <Pencil size={13} className="mr-2" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(conversation.id)}
            variant="destructive"
          >
            <Trash2 size={13} className="mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

type HistoryListProps = {
  conversations: Conversation[];
  onSelect: (conversation: Conversation) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
};

/** Search + grouped list with scroll-aware fade masks — shared by the desktop
    rail and the mobile sheet. Expects a flex-column parent to fill. */
function HistoryBody({ conversations, onSelect, onRename, onDelete }: HistoryListProps) {
  const [search, setSearch] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    setCanScrollUp(el.scrollTop > 4);
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 4);
  };

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    handleScroll();
  }, [filtered.length]);

  return (
    <>
      {/* Search */}
      <div className="px-3 pb-3 shrink-0">
        <div className="p-[2px]">
          <SearchInput value={search} onChange={setSearch} placeholder="Search conversations" />
        </div>
      </div>

      {/* Conversation list with scroll-aware fade overlays */}
      <div className="relative flex-1 min-h-0">
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="absolute inset-0 overflow-y-auto"
          style={{
            maskImage: `linear-gradient(to bottom, transparent 0px, black ${canScrollUp ? "32px" : "0.001px"}, black calc(100% - ${canScrollDown ? "32px" : "0.001px"}), transparent 100%)`,
            WebkitMaskImage: `linear-gradient(to bottom, transparent 0px, black ${canScrollUp ? "32px" : "0.001px"}, black calc(100% - ${canScrollDown ? "32px" : "0.001px"}), transparent 100%)`,
          }}
        >
          <div className="px-2 pb-4">
            {filtered.length === 0 ? (
              <p className="px-2 pt-3 type-meta text-muted-foreground">
                {conversations.length === 0
                  ? "No previous conversations."
                  : "No conversations found."}
              </p>
            ) : (
              GROUPS.map((group) => {
                const items = filtered.filter((c) => c.group === group);
                if (!items.length) return null;
                return (
                  <div key={group}>
                    <p className="px-2 pt-3 pb-1 type-meta font-medium text-foreground/70">
                      {group}
                    </p>
                    {items.map((conv) => (
                      <ConversationItem
                        key={conv.id}
                        conversation={conv}
                        onSelect={onSelect}
                        onRename={onRename}
                        onDelete={onDelete}
                      />
                    ))}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const SLIDE_EASING = "cubic-bezier(0.32, 0.72, 0, 1)";
const SLIDE_DURATION = "220ms";

type ChatHistoryPanelProps = HistoryListProps & {
  isOpen: boolean;
  onToggle: () => void;
};

/** Desktop shell — the inline right-side rail (48px collapsed / 220px open). */
export function ChatHistoryPanel({
  isOpen,
  onToggle,
  conversations,
  onSelect,
  onRename,
  onDelete,
}: ChatHistoryPanelProps) {
  const fadeStyle: React.CSSProperties = {
    opacity: isOpen ? 1 : 0,
    transition: `opacity ${SLIDE_DURATION} ${SLIDE_EASING}`,
    pointerEvents: isOpen ? "auto" : "none",
  };

  return (
    <div
      className={cn("flex flex-col shrink-0 overflow-hidden", isOpen && "border-l border-border/40")}
      style={{
        width: isOpen ? 220 : 48,
        background: isOpen ? "color-mix(in srgb, var(--surface) 30%, transparent)" : "transparent",
        backdropFilter: isOpen ? "blur(16px)" : "none",
        WebkitBackdropFilter: isOpen ? "blur(16px)" : "none",
        transition: `width ${SLIDE_DURATION} ${SLIDE_EASING}`,
      }}
    >
      {/* Trigger row — icon always visible, label fades with panel */}
      <button
        onClick={onToggle}
        className={cn(
          "flex items-center gap-2.5 h-14 px-3.5 shrink-0 text-left overflow-hidden whitespace-nowrap",
          isOpen
            ? "text-primary"
            : "text-foreground/50 hover:text-foreground/80"
        )}
      >
        <History size={15} className="shrink-0" />
        <span className="type-meta font-semibold" style={fadeStyle}>
          Old conversations
        </span>
      </button>

      {/* Content — always mounted, fades in sync with the width slide */}
      <div className="flex flex-col flex-1 overflow-hidden" style={fadeStyle}>
        <HistoryBody
          conversations={conversations}
          onSelect={onSelect}
          onRename={onRename}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}

type ChatHistorySheetProps = HistoryListProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Mobile shell — the same history list in a right-side sheet (the inline rail
    would eat the chat column on narrow screens). */
export function ChatHistorySheet({
  open,
  onOpenChange,
  conversations,
  onSelect,
  onRename,
  onDelete,
}: ChatHistorySheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[300px] bg-surface p-0 gap-0 flex flex-col">
        <SheetHeader className="px-4 pt-4 pb-3">
          <SheetTitle className="flex items-center gap-2.5 type-label font-semibold text-foreground">
            <History size={15} className="shrink-0" />
            Old conversations
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col flex-1 overflow-hidden">
          <HistoryBody
            conversations={conversations}
            onSelect={onSelect}
            onRename={onRename}
            onDelete={onDelete}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
