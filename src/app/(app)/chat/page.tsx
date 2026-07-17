"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowDown, ChevronDown, ChevronLeft, History, Pencil, SquarePen, Trash2 } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ChatHistoryPanel, ChatHistorySheet, useConversations, type Conversation } from "@/components/chat-history-panel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { BlobField } from "@/components/chat/BlobField";
import { UserMessage } from "@/components/chat/UserMessage";
import { AiMessage, type Message, type FeedbackState } from "@/components/chat/AiMessage";
import { type Attachment } from "@/components/chat/AttachmentChip";
import { takeChatLaunch } from "@/lib/chat-launch";
import {
  type ChatResponse,
  type DetailLevel,
  getStreamTextFor,
  getSourceLabelsFor,
} from "@/lib/chat-mock";
import { chatProvider, type ProviderMessage } from "@/lib/chat-provider";
import { USER } from "@/lib/user-mock";
import { useStickToBottom } from "@/hooks/use-stick-to-bottom";

// The active conversation is held in sessionStorage so it survives navigating
// out to a citation source (and back via "Back to conversation") — the chat is
// otherwise ephemeral and any navigation would drop it.
const CHAT_STORAGE_KEY = "cortex-active-chat";

function loadPersistedChat(): { messages: Message[]; title: string | null } {
  if (typeof window === "undefined") return { messages: [], title: null };
  try {
    const raw = sessionStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return { messages: [], title: null };
    const parsed = JSON.parse(raw);
    // Persisted messages are always settled; strip any transient flags defensively.
    const messages: Message[] = (parsed.messages ?? []).map((m: Message) => ({ ...m, isStreaming: false }));
    return { messages, title: parsed.title ?? null };
  } catch {
    return { messages: [], title: null };
  }
}

export default function ChatPage() {
  const [showHistory, setShowHistory] = useState(false);
  const historyRailRef = useRef<HTMLDivElement>(null);
  // Mobile: history lives in a sheet (the inline rail would eat the chat column).
  const [historySheetOpen, setHistorySheetOpen] = useState(false);
  const { conversations, rename: renameConversation, remove: removeConversation, archive: archiveConversation } = useConversations();
  const [isAiResponding, setIsAiResponding] = useState(false);

  // How explanatory answers should be — a lasting per-device preference.
  const [detailLevel, setDetailLevelState] = useState<DetailLevel>("standard");
  useEffect(() => {
    const saved = localStorage.getItem("cortex-chat-detail");
    if (saved === "concise" || saved === "standard" || saved === "detailed") setDetailLevelState(saved);
  }, []);
  const setDetailLevel = (level: DetailLevel) => {
    setDetailLevelState(level);
    localStorage.setItem("cortex-chat-detail", level);
  };

  // A composer prefill request (from editing a past message).
  const [draft, setDraft] = useState<{ text: string; token: number } | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationTitle, setConversationTitle] = useState<string | null>(null);
  const [isRenamingTitle, setIsRenamingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");

  // Stick-to-bottom: follows the streaming response while the user is at the
  // bottom, yields when they scroll up to read back, re-engages on return.
  const { scrollRef: messagesScrollRef, contentRef: messagesContentRef, canScrollUp: msgsCanScrollUp, canScrollDown: msgsCanScrollDown, jumpToBottom } = useStickToBottom();

  const titleInputRef = useRef<HTMLInputElement>(null);
  const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const responseCountRef = useRef(0);
  const currentResponseRef = useRef<ChatResponse | null>(null);

  const hasConversation = messages.length > 0;

  // The sticky input bar's height drives the bottom fade + scroll-to-bottom
  // button so they float just above the composer at ANY height — it grows with
  // attachments and multi-line drafts. Default (112) matches the one-line bar so
  // the first paint is right before the observer measures. Measured, not a magic
  // per-element offset.
  const inputBarRef = useRef<HTMLDivElement>(null);
  const [inputBarH, setInputBarH] = useState(112);
  useEffect(() => {
    const el = inputBarRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setInputBarH(el.offsetHeight));
    ro.observe(el);
    setInputBarH(el.offsetHeight);
    return () => ro.disconnect();
  }, [hasConversation]);

  useEffect(() => {
    if (isRenamingTitle) titleInputRef.current?.focus();
  }, [isRenamingTitle]);

  // Clear any in-flight stream when leaving the screen.
  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, []);

  // On mount: a launch/?q= starts a fresh question; otherwise the conversation
  // persists — restore it so navigating away and back (including a citation
  // round-trip) lands you where you were. Starting fresh is the explicit "New
  // conversation" action, never an automatic side effect of navigating.
  useEffect(() => {
    const launch = takeChatLaunch();
    if (launch && (launch.text.trim() || launch.attachments?.length)) {
      handleSubmit(launch.text.trim(), launch.attachments ?? []);
      return;
    }
    const q = new URLSearchParams(window.location.search).get("q");
    if (q && q.trim()) {
      handleSubmit(q.trim());
      window.history.replaceState({}, "", "/chat");
    } else {
      const persisted = loadPersistedChat();
      if (persisted.messages.length) {
        setMessages(persisted.messages);
        setConversationTitle(persisted.title);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist the settled conversation (never mid-stream) so it survives navigation.
  useEffect(() => {
    if (isAiResponding) return;
    try {
      if (messages.length) {
        sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({ messages, title: conversationTitle }));
      } else {
        sessionStorage.removeItem(CHAT_STORAGE_KEY);
      }
    } catch {
      /* storage full / unavailable — non-fatal */
    }
  }, [messages, conversationTitle, isAiResponding]);

  // Desktop history rail: collapse on an outside click (the mobile sheet already
  // dismisses on outside tap). The rail's own toggle lives inside the ref, so it
  // still opens/closes normally.
  useEffect(() => {
    if (!showHistory) return;
    function onPointerDown(e: PointerEvent) {
      const node = e.target as Node;
      if (historyRailRef.current?.contains(node)) return;
      // The per-item rename/delete menus render in a Radix portal outside the
      // rail — don't treat interacting with those as an outside click.
      const el = node instanceof Element ? node : node.parentElement;
      if (el?.closest('[data-radix-popper-content-wrapper],[role="menu"]')) return;
      setShowHistory(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [showHistory]);

  function generateTitle(text: string) {
    const t = text.trim();
    return t.length > 45 ? t.slice(0, 45) + "…" : t;
  }

  function startStreaming(msgId: string, response: ChatResponse) {
    currentResponseRef.current = response;
    const { blocks, browseLibraryHref } = response;
    const fullText = getStreamTextFor(blocks);
    let idx = 0;
    responseCountRef.current += 1;
    const errorAt = responseCountRef.current === 3
      ? Math.floor(fullText.length * 0.5)
      : -1;

    streamIntervalRef.current = setInterval(() => {
      idx += 4;

      if (errorAt > 0 && idx >= errorAt) {
        if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
        setIsAiResponding(false);
        setMessages(prev => prev.map(m =>
          m.id === msgId ? { ...m, isStreaming: false, isError: true } : m
        ));
        return;
      }

      if (idx >= fullText.length) {
        if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
        setMessages(prev => prev.map(m =>
          m.id === msgId
            ? { ...m, streamText: fullText, isStreaming: false, blocks, browseLibraryHref, diagram: response.diagram }
            : m
        ));
        setIsAiResponding(false);
      } else {
        setMessages(prev => prev.map(m =>
          m.id === msgId ? { ...m, streamText: fullText.slice(0, idx) } : m
        ));
      }
    }, 30);
  }

  function queueAiResponse(response: ChatResponse) {
    setTimeout(() => {
      const aiId = `a${Date.now()}`;
      setMessages(prev => [...prev, {
        id: aiId,
        role: "assistant",
        isStreaming: true,
        streamText: "",
        sources: getSourceLabelsFor(response.blocks),
      }]);
      setTimeout(() => startStreaming(aiId, response), 1400);
    }, 80);
  }

  function handleRetry(msgId: string) {
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    setIsAiResponding(true);
    const msgIdx = messages.findIndex(m => m.id === msgId);
    const precedingUserMsg = [...messages.slice(0, msgIdx)].reverse().find(m => m.role === "user");
    const response = chatProvider.getResponse(
      [{ role: "user", text: precedingUserMsg?.content ?? "" }],
      { detail: detailLevel }
    );
    setMessages(prev => prev.map(m =>
      m.id === msgId
        ? { ...m, isError: false, isStreaming: true, streamText: "", sources: getSourceLabelsFor(response.blocks) }
        : m
    ));
    setTimeout(() => startStreaming(msgId, response), 800);
  }

  function handleSubmit(text: string, attachments: Attachment[] = []) {
    setIsAiResponding(true);

    if (messages.length === 0) {
      setConversationTitle(generateTitle(text || attachments[0]?.name || "Shared files"));
    }

    const userMsg: Message = {
      id: `u${Date.now()}`,
      role: "user",
      content: text || undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
    };
    // Build the conversation for the provider (API-shaped) and answer.
    const convo: ProviderMessage[] = [
      ...messages.map((m) => ({ role: m.role, text: m.content ?? getStreamTextFor(m.blocks ?? []) })),
      { role: "user" as const, text },
    ];
    setMessages(prev => [...prev, userMsg]);
    jumpToBottom();

    queueAiResponse(chatProvider.getResponse(convo, { detail: detailLevel }));
  }

  function handleStopResponse() {
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    setIsAiResponding(false);
    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last?.isStreaming) {
        const resp = currentResponseRef.current;
        return [...prev.slice(0, -1), {
          ...last,
          isStreaming: false,
          blocks: resp?.blocks ?? [],
          browseLibraryHref: resp?.browseLibraryHref,
          diagram: resp?.diagram,
        }];
      }
      return prev;
    });
  }

  // Editing a message copies its text back into the composer as a fresh draft
  // (no rewind — the original stays; re-sending appends a new message).
  function handleEditToInput(content: string) {
    setDraft({ text: content, token: Date.now() });
  }

  function handleFeedback(msgId: string, value: FeedbackState) {
    setMessages(prev => prev.map(m =>
      m.id === msgId ? { ...m, feedback: value } : m
    ));
  }

  // Reveal this answer's diagram (the "Show me a diagram" affordance). No-op if
  // there's none or one is already shown.
  function handleShowDiagram(msgId: string) {
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId || !m.diagram) return m;
      if ((m.blocks ?? []).some(b => b.type === "diagram")) return m;
      return { ...m, blocks: [...(m.blocks ?? []), m.diagram] };
    }));
  }

  function handleDeleteConversation() {
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    setMessages([]);
    setConversationTitle(null);
    setIsAiResponding(false);
  }

  // Explicit "New conversation" — file the current exchange under history (so
  // it's never lost) and reset to a fresh chat. The only way a conversation
  // ends; navigating away just leaves it be.
  function handleNewConversation() {
    if (!hasConversation) return;
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    setIsAiResponding(false);
    const firstUser = messages.find((m) => m.role === "user");
    archiveConversation(conversationTitle || firstUser?.content || "New conversation");
    setMessages([]);
    setConversationTitle(null);
    try {
      sessionStorage.removeItem(CHAT_STORAGE_KEY);
    } catch {
      /* non-fatal */
    }
  }

  // Restore a past conversation from the history panel as a completed exchange.
  function handleSelectConversation(conversation: Conversation) {
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    setIsAiResponding(false);
    const response = chatProvider.getResponse(
      [{ role: "user", text: conversation.title }],
      { detail: detailLevel }
    );
    setConversationTitle(conversation.title);
    setMessages([
      { id: `u-restored-${conversation.id}`, role: "user", content: conversation.title },
      {
        id: `a-restored-${conversation.id}`,
        role: "assistant",
        blocks: response.blocks,
        browseLibraryHref: response.browseLibraryHref,
        diagram: response.diagram,
        streamText: getStreamTextFor(response.blocks),
      },
    ]);
    jumpToBottom();
  }

  function saveTitle() {
    const t = titleDraft.trim();
    if (t) setConversationTitle(t);
    setIsRenamingTitle(false);
  }

  return (
    <div className="relative flex flex-1 overflow-hidden">
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
      {!hasConversation && <BlobField />}

        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center gap-2 px-4 h-14 shrink-0" style={{ background: "color-mix(in srgb, var(--surface) 30%, transparent)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
          <SidebarTrigger className="-ml-1" />
          {/* Chat is a focused-task screen — the mobile nav yields, so the way
              back is explicit: chevron + destination, always Home (one
              guaranteed exit, regardless of how the user arrived). */}
          <Link
            href="/dashboard"
            className="md:hidden -ml-2 flex items-center gap-0.5 h-11 pl-1 pr-2 text-[14px] leading-[20px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-100 shrink-0"
          >
            <ChevronLeft size={18} strokeWidth={2} />
            Home
          </Link>

          {conversationTitle && (
            isRenamingTitle ? (
              <input
                ref={titleInputRef}
                value={titleDraft}
                onChange={e => setTitleDraft(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={e => {
                  if (e.key === "Enter") saveTitle();
                  if (e.key === "Escape") setIsRenamingTitle(false);
                }}
                className="text-[14px] font-medium text-foreground bg-transparent border border-primary rounded px-2 py-0.5 outline-none focus:ring-1 focus:ring-primary min-w-0 max-w-[280px]"
              />
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 min-w-0 text-[14px] font-medium text-foreground hover:text-primary transition-colors duration-100 max-w-[280px]">
                    <span className="truncate">{conversationTitle}</span>
                    <ChevronDown size={14} className="text-muted-foreground shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-36">
                  <DropdownMenuItem
                    onClick={() => { setTitleDraft(conversationTitle); setIsRenamingTitle(true); }}
                  >
                    <Pencil size={13} className="mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDeleteConversation}
                    variant="destructive"
                  >
                    <Trash2 size={13} className="mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          )}

          <div className="ml-auto flex items-center gap-1.5">
            {/* New conversation — an outlined action (not a ghost utility icon),
                so it never reads as a twin of the history control. Only shown
                inside a conversation; the empty screen is already a new chat. */}
            {hasConversation && (
              <button
                type="button"
                onClick={handleNewConversation}
                aria-label="New conversation"
                className="flex items-center gap-1.5 h-9 px-2.5 rounded-lg border text-[13px] leading-[20px] font-medium transition-colors duration-100 shrink-0 hover:bg-[var(--surface-raised)]"
                style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
              >
                <SquarePen size={15} strokeWidth={1.75} />
                <span className="hidden sm:inline">New chat</span>
              </button>
            )}
            {/* Mobile-only history trigger — the desktop rail is hidden below md */}
            <button
              type="button"
              onClick={() => setHistorySheetOpen(true)}
              aria-label="Old conversations"
              className="md:hidden flex items-center justify-center w-11 h-11 -mr-2 rounded-lg text-foreground/50 hover:text-foreground/80 transition-colors duration-100"
            >
              <History size={16} strokeWidth={1.5} />
            </button>
          </div>
        </header>

        {/* Screen-reader announcement for response state */}
        <span className="sr-only" role="status" aria-live="polite">
          {isAiResponding ? "Cortex is responding" : ""}
        </span>

        <div className={`flex-1 flex flex-col overflow-hidden ${hasConversation ? "bg-surface" : "bg-transparent"}`}>
        {hasConversation ? (
          /* ── Conversation view ── */
          <div className="relative flex-1 min-h-0">
            {/* Bottom fade — sits above the sticky input (overlay, not border-adjacent) */}
            <div
              className="absolute left-0 h-20 pointer-events-none z-10 transition-opacity duration-200"
              style={{
                right: 12,
                bottom: inputBarH,
                background: "linear-gradient(to top, var(--surface) 30%, transparent)",
                opacity: msgsCanScrollDown ? 1 : 0,
              }}
            />
            {/* Scroll-to-bottom button */}
            <div
              className="absolute left-1/2 -translate-x-1/2 z-20 transition-all duration-200"
              style={{
                bottom: inputBarH + 8,
                opacity: msgsCanScrollDown ? 1 : 0,
                pointerEvents: msgsCanScrollDown ? "auto" : "none",
              }}
            >
              <button
                onClick={jumpToBottom}
                aria-label="Scroll to latest message"
                className="flex items-center justify-center w-9 h-9 rounded-full border border-border bg-surface-glass"
                style={{
                  backdropFilter: "blur(4px)",
                  boxShadow: "var(--shadow-floating)",
                }}
              >
                <ArrowDown size={15} className="text-foreground" />
              </button>
            </div>

            {/* Single scroll container — top fade via mask-image (no border gap) */}
            <div
              ref={messagesScrollRef}
              className="h-full overflow-y-auto"
              style={{
                scrollbarGutter: "stable",
                maskImage: msgsCanScrollUp ? "linear-gradient(to bottom, transparent 0px, black 64px, black 100%)" : "none",
                WebkitMaskImage: msgsCanScrollUp ? "linear-gradient(to bottom, transparent 0px, black 64px, black 100%)" : "none",
              }}
            >
              <div ref={messagesContentRef} className="min-h-full flex flex-col">
                <div className="flex-1 px-4 sm:px-6 pt-8 pb-4">
                  <div className="max-w-[560px] mx-auto flex flex-col gap-8">
                    {messages.map(msg =>
                      msg.role === "user"
                        ? <UserMessage key={msg.id} content={msg.content ?? ""} attachments={msg.attachments} onEdit={() => handleEditToInput(msg.content ?? "")} />
                        : <AiMessage key={msg.id} message={msg} onFeedback={handleFeedback} onRetry={handleRetry} onShowDiagram={handleShowDiagram} />
                    )}
                  </div>
                </div>

                {/* Sticky input — same centering as messages above. Bottom
                    padding clears the home-indicator safe area now that the
                    mobile nav yields on chat (nothing sits below the composer). */}
                <div ref={inputBarRef} className="sticky bottom-0 px-4 sm:px-6 pb-[calc(24px+env(safe-area-inset-bottom))] pt-2 flex flex-col items-center gap-2 bg-surface">
                  <div className="w-full max-w-[560px] relative">
                    <ChatComposer onSubmit={handleSubmit} isResponding={isAiResponding} onStop={handleStopResponse} detailLevel={detailLevel} onDetailLevelChange={setDetailLevel} draft={draft ?? undefined} />
                  </div>
                  <p className="text-[12px] text-muted-foreground">
                    Cortex AI can make mistakes. Please check important info.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ── Empty state ── */
          <div
            className="relative flex-1 flex flex-col items-center justify-start overflow-hidden px-4 sm:px-6 pt-[30vh]"
          >
            <div className="relative z-10 w-full max-w-[560px] flex flex-col items-center text-center gap-8" style={{ animation: "msg-in 200ms ease-out both" }}>
              <div className="flex flex-col items-center gap-2">
                <h1 className="text-[20px] leading-none font-semibold text-primary">
                  How can I help you {USER.firstName}?
                </h1>
              </div>
              <div className="w-full relative">
                <ChatComposer onSubmit={handleSubmit} isResponding={isAiResponding} onStop={handleStopResponse} detailLevel={detailLevel} onDetailLevelChange={setDetailLevel} draft={draft ?? undefined} />
              </div>
              <p className="text-[12px] text-muted-foreground -mt-4">
                Cortex AI can make mistakes. Please check important info.
              </p>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Desktop: inline history rail. Mobile: sheet (below). */}
      <div ref={historyRailRef} className="relative z-10 hidden md:flex shrink-0">
      <ChatHistoryPanel
        isOpen={showHistory}
        onToggle={() => setShowHistory(v => !v)}
        onSelect={(c) => { handleSelectConversation(c); setShowHistory(false); }}
        conversations={conversations}
        onRename={renameConversation}
        onDelete={removeConversation}
      />
      </div>

      <ChatHistorySheet
        open={historySheetOpen}
        onOpenChange={setHistorySheetOpen}
        onSelect={(c) => {
          handleSelectConversation(c);
          setHistorySheetOpen(false);
        }}
        conversations={conversations}
        onRename={renameConversation}
        onDelete={removeConversation}
      />
    </div>
  );
}
