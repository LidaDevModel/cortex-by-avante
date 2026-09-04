"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowDown, ChevronDown, ChevronLeft, ChevronRight, History, Pencil, SquarePen, Trash2 } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLearnerNav } from "@/lib/learner-crumbs";
import { ChatHistoryPanel, ChatHistorySheet, useConversations, type Conversation } from "@/components/chat-history-panel";
import { getTranscript, saveTranscript } from "@/lib/chat-history-store";
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
import { addFlag } from "@/lib/flags-store";
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
  // "Learning" for an admin, nothing for a field agent — see useLearnerNav.
  const { group } = useLearnerNav();
  const [isRenamingTitle, setIsRenamingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");

  // Stick-to-bottom: follows the streaming response while the user is at the
  // bottom, yields when they scroll up to read back, re-engages on return.
  const { scrollRef: messagesScrollRef, contentRef: messagesContentRef, canScrollUp: msgsCanScrollUp, canScrollDown: msgsCanScrollDown, jumpToBottom } = useStickToBottom();

  const titleInputRef = useRef<HTMLInputElement>(null);
  const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const responseCountRef = useRef(0);
  // Armed by /chat?demo=error — see startStreaming.
  const demoErrorArmedRef = useRef(false);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("demo") === "error") {
      demoErrorArmedRef.current = true;
    }
  }, []);
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

    // A deliberately failed answer, so the inline error + "Try again" state can
    // be shown in a demo. It used to fire automatically on the third response
    // of every session, which meant it interrupted whatever the presenter
    // happened to be doing at the time -- including a question they were using
    // to make a different point.
    //
    // Now it is armed on demand: open /chat?demo=error and the NEXT answer
    // fails halfway through. Nothing appears in the conversation, so the
    // trigger is invisible on screen.
    //
    // To restore the old automatic behaviour, set DEMO_ERROR_ON_NTH to 3.
    const DEMO_ERROR_ON_NTH: number | null = null;
    const armedByUrl = demoErrorArmedRef.current;
    if (armedByUrl) demoErrorArmedRef.current = false;
    const shouldFail =
      armedByUrl ||
      (DEMO_ERROR_ON_NTH !== null && responseCountRef.current === DEMO_ERROR_ON_NTH);
    const errorAt = shouldFail ? Math.floor(fullText.length * 0.5) : -1;

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

/**
 * Mock response latency. Named so a real integration cannot inherit these by
 * accident, which is how a demo delay becomes a production delay.
 *
 * When a backend lands, THINK_MS should become the **minimum** time the
 * thinking indicator stays on screen — a floor, so a fast answer does not
 * flash — and never a delay added on top of a real round trip. It cannot be
 * written that way yet: there is no request to race against.
 */
const MOCK_LATENCY = { appendMs: 80, thinkMs: 1400, retryThinkMs: 800 } as const;

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
      setTimeout(() => startStreaming(aiId, response), MOCK_LATENCY.thinkMs);
    }, MOCK_LATENCY.appendMs);
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
    setTimeout(() => startStreaming(msgId, response), MOCK_LATENCY.retryThinkMs);
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
        // Stop keeps what arrived. It used to swap in the FULL response, so a
        // button labelled Stop actually revealed the whole answer -- complete
        // with citation chips implying a finished, sourced reply. Owner's call
        // (2026-09-02): Stop means stop.
        return [...prev.slice(0, -1), {
          ...last,
          isStreaming: false,
          isStopped: true,
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

  // Negative feedback files a flag for admin review: the answer plus the
  // nearest preceding user question, the modal's reason, and the answer's
  // first citation (so the admin can jump straight to the source content).
  function handleFlag(msgId: string, reason: string, note?: string) {
    const idx = messages.findIndex(m => m.id === msgId);
    if (idx < 0) return;
    const flagged = messages[idx];
    const answer = getStreamTextFor(flagged.blocks ?? []) || flagged.streamText || "";
    let question = "";
    for (let i = idx - 1; i >= 0; i--) {
      if (messages[i].role === "user") { question = messages[i].content ?? ""; break; }
    }
    let source: { docId: string; label: string } | undefined;
    for (const block of flagged.blocks ?? []) {
      if (block.type !== "text") continue;
      const cit = block.segments.find(s => s.type === "source");
      if (cit && cit.type === "source") { source = { docId: cit.docId, label: cit.label }; break; }
    }
    addFlag({ question, answer, reason, note, source });
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
    archiveConversation(conversationTitle || firstUser?.content || "New conversation", messages);
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
    // Save what is on screen before replacing it. Starting a NEW conversation
    // already archived the old one; opening a PAST one did not, so switching
    // silently discarded whatever the guard had just asked. The title guard
    // stops a conversation re-archiving itself when it is reopened.
    const firstUser = messages.find((m) => m.role === "user");
    const currentTitle = conversationTitle || firstUser?.content;
    if (currentTitle && currentTitle !== conversation.title) {
      archiveConversation(currentTitle, messages);
    }
    setConversationTitle(conversation.title);

    /* A REAL restore. This used to feed the conversation's TITLE back to the
       resolver as a fresh question and render the result — so nothing was
       restored, the answer could differ from the one originally given, and a
       title that is not a Library topic ("Morning briefing notes") came back
       as a deflection. Now the stored transcript is simply put back on screen.

       A conversation from the seeded demo list has no transcript the first
       time it is opened. It is materialised once, from the title, and STORED —
       so every later open shows the same words, which is the property the
       history panel was asserting all along. */
    const stored = getTranscript(conversation.id);
    if (stored) {
      setMessages(stored);
      jumpToBottom();
      return;
    }

    const response = chatProvider.getResponse(
      [{ role: "user", text: conversation.title }],
      { detail: detailLevel }
    );
    const restored: Message[] = [
      { id: `u-restored-${conversation.id}`, role: "user", content: conversation.title },
      {
        id: `a-restored-${conversation.id}`,
        role: "assistant",
        blocks: response.blocks,
        browseLibraryHref: response.browseLibraryHref,
        diagram: response.diagram,
        streamText: getStreamTextFor(response.blocks),
      },
    ];
    setMessages(restored);
    saveTranscript(conversation.id, restored);
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
            className="lg:hidden -ml-2 flex items-center gap-0.5 h-11 pl-1 pr-2 type-label font-medium text-muted-foreground hover:text-foreground transition-colors duration-100 shrink-0"
          >
            <ChevronLeft size={18} strokeWidth={2} />
            Home
          </Link>

          {/* Group crumb. This header IS the breadcrumb row — same 56px height,
              same padding, same sidebar toggle as PageHeader — so for an admin
              it should read like the rest of their Learning screens rather than
              starting mid-sentence with a conversation name. Desktop only: on
              mobile this row carries the back affordance instead, per VISION's
              mobile-header rule, and a field agent gets no group at all
              because AI Chat is top-level in their sidebar. */}
          {group.length > 0 && (
            <span className="hidden md:flex items-center gap-1.5 shrink-0">
              <span className="type-label text-muted-foreground">{group[0].label}</span>
              <ChevronRight size={14} strokeWidth={1.5} className="shrink-0 text-muted-foreground opacity-60" />
            </span>
          )}

          {conversationTitle ? (
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
                className="type-label font-medium text-foreground bg-transparent border border-primary rounded px-2 py-0.5 outline-none focus:ring-1 focus:ring-primary min-w-0 max-w-[280px]"
              />
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 min-w-0 h-11 md:h-auto type-label font-medium text-foreground hover:text-primary transition-colors duration-100 max-w-[280px]">
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
          ) : (
            /* No conversation yet: name the screen so the row agrees with the
               sidebar's highlighted item instead of sitting empty. */
            <span className="hidden md:inline type-label font-medium text-foreground">
              AI Chat
            </span>
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
                className="flex items-center justify-center gap-1.5 h-11 md:h-9 min-w-11 md:min-w-0 px-3 md:px-2.5 rounded-lg border type-meta font-medium transition-colors duration-100 shrink-0 hover:bg-[var(--surface-raised)]"
                style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
              >
                <SquarePen size={15} strokeWidth={1.75} />
                <span className="hidden sm:inline">New chat</span>
              </button>
            )}
            {/* History trigger — paired with the rail below, which now holds
                until `lg`: at 768px a chat column plus a rail leaves neither
                enough room. Flip both together or this range loses history. */}
            <button
              type="button"
              onClick={() => setHistorySheetOpen(true)}
              aria-label="Old conversations"
              className="lg:hidden flex items-center justify-center w-11 h-11 -mr-2 rounded-lg text-foreground/50 hover:text-foreground/80 transition-colors duration-100"
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
                className="flex items-center justify-center size-11 md:size-9 rounded-full border border-border bg-surface-glass"
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
                        : <AiMessage key={msg.id} message={msg} onFeedback={handleFeedback} onFlag={handleFlag} onRetry={handleRetry} onShowDiagram={handleShowDiagram} />
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
                  <p className="type-caption text-muted-foreground">
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
                <h1 className="type-h2 leading-none text-primary">
                  How can I help you {USER.firstName}?
                </h1>
              </div>
              <div className="w-full relative">
                <ChatComposer onSubmit={handleSubmit} isResponding={isAiResponding} onStop={handleStopResponse} detailLevel={detailLevel} onDetailLevelChange={setDetailLevel} draft={draft ?? undefined} />
              </div>
              <p className="type-caption text-muted-foreground -mt-4">
                Cortex AI can make mistakes. Please check important info.
              </p>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Desktop: inline history rail. Mobile: sheet (below). */}
      <div ref={historyRailRef} className="relative z-10 hidden lg:flex shrink-0">
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
