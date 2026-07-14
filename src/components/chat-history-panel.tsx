"use client";

import { useState, useRef, useEffect } from "react";
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

export type Conversation = {
  id: string;
  title: string;
  group: "Today" | "Yesterday" | "Last 7 days" | "Last 30 days";
};

const MOCK_CONVERSATIONS: Conversation[] = [
  { id: "1", title: "Security Protocols", group: "Today" },
  { id: "2", title: "Morning briefing notes", group: "Today" },
  { id: "3", title: "Safety Guidelines for Guards", group: "Yesterday" },
  { id: "4", title: "Queries & Responses", group: "Yesterday" },
  { id: "5", title: "Guard Duty FAQs", group: "Last 7 days" },
  { id: "6", title: "Security Rules Overview", group: "Last 7 days" },
  { id: "7", title: "Emergency Procedures", group: "Last 7 days" },
  { id: "8", title: "Guard Best Practices", group: "Last 7 days" },
  { id: "9", title: "Shift handover checklist", group: "Last 7 days" },
  { id: "10", title: "Incident Reporting", group: "Last 30 days" },
  { id: "11", title: "Security Guard Training Topics", group: "Last 30 days" },
  { id: "12", title: "Access Control Rules", group: "Last 30 days" },
  { id: "13", title: "Security Guard Communication", group: "Last 30 days" },
  { id: "14", title: "Patrol Procedures", group: "Last 30 days" },
  { id: "15", title: "Security Guard Responses", group: "Last 30 days" },
  { id: "16", title: "Conduct Standards", group: "Last 30 days" },
  { id: "17", title: "Guard Conflict Resolution", group: "Last 30 days" },
  { id: "18", title: "Visitor Management", group: "Last 30 days" },
  { id: "19", title: "Security Guard Emergency", group: "Last 30 days" },
  { id: "20", title: "Fire evacuation protocol", group: "Last 30 days" },
  { id: "21", title: "CCTV monitoring guidelines", group: "Last 30 days" },
  { id: "22", title: "Lone worker policy", group: "Last 30 days" },
  { id: "23", title: "First aid responsibilities", group: "Last 30 days" },
];

const GROUPS = ["Today", "Yesterday", "Last 7 days", "Last 30 days"] as const;

/** Conversation list state, lifted so the desktop rail and the mobile sheet
    (both mounted, breakpoint-swapped) share one source of truth. */
export function useConversations() {
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const rename = (id: string, title: string) =>
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)));
  const remove = (id: string) => setConversations((prev) => prev.filter((c) => c.id !== id));
  return { conversations, rename, remove };
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
        className="w-full text-[13px] text-foreground bg-transparent border border-primary rounded px-2 py-0.5 outline-none focus:ring-1 focus:ring-primary"
      />
    );
  }

  return (
    <div
      className="group flex items-center gap-1 px-2 py-2 rounded-lg cursor-pointer hover:bg-sidebar-accent transition-colors duration-100"
      onClick={() => onSelect(conversation)}
    >
      <span className="flex-1 text-[13px] text-primary truncate min-w-0">
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
          <SearchInput value={search} onChange={setSearch} placeholder="Search..." />
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
              <p className="px-2 pt-3 text-[13px] text-muted-foreground">
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
                    <p className="px-2 pt-3 pb-1 text-[13px] font-medium text-foreground/70">
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
        <span className="text-[13px] font-semibold" style={fadeStyle}>
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
          <SheetTitle className="flex items-center gap-2.5 text-[14px] leading-[20px] font-semibold text-primary">
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
