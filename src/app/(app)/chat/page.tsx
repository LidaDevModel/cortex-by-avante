"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowDown, ChevronDown, Pencil, Trash2 } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ChatHistoryPanel, type Conversation } from "@/components/chat-history-panel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { CitationPanel, type Citation } from "@/components/chat/CitationPanel";
import { UserMessage } from "@/components/chat/UserMessage";
import { AiMessage, type Message, type FeedbackState } from "@/components/chat/AiMessage";
import {
  type AiParagraph,
  pickResponseFor,
  getStreamTextFor,
  getSourceLabelsFor,
} from "@/lib/chat-mock";
import { USER } from "@/lib/user-mock";

export default function ChatPage() {
  const [showHistory, setShowHistory] = useState(false);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationTitle, setConversationTitle] = useState<string | null>(null);
  const [isRenamingTitle, setIsRenamingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");

  const [msgsCanScrollUp, setMsgsCanScrollUp] = useState(false);
  const [msgsCanScrollDown, setMsgsCanScrollDown] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const responseCountRef = useRef(0);
  const currentParagraphsRef = useRef<AiParagraph[]>([]);
  // While the user is reading older messages we must not fight their scroll —
  // auto-follow only when they're already pinned to the bottom.
  const pinnedToBottomRef = useRef(true);

  const hasConversation = messages.length > 0;

  useEffect(() => {
    if (isRenamingTitle) titleInputRef.current?.focus();
  }, [isRenamingTitle]);

  useEffect(() => {
    if (!pinnedToBottomRef.current) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "instant", block: "end" });
  }, [messages]);

  // Clear any in-flight stream when leaving the screen.
  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, []);

  // Consume a prefilled query passed via ?q= (e.g. from the dashboard "Ask Cortex" entry)
  // and send it once on mount, then strip it from the URL so a refresh doesn't resend.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q && q.trim()) {
      handleSubmit(q.trim());
      window.history.replaceState({}, "", "/chat");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateMsgsScroll = () => {
    const el = messagesScrollRef.current;
    if (!el) return;
    const atTop = el.scrollTop <= 4;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
    pinnedToBottomRef.current = el.scrollTop + el.clientHeight >= el.scrollHeight - 80;
    setMsgsCanScrollUp(!atTop);
    setMsgsCanScrollDown(!atBottom);
  };

  useEffect(() => {
    const el = messagesScrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateMsgsScroll, { passive: true });
    updateMsgsScroll();
    return () => el.removeEventListener("scroll", updateMsgsScroll);
  }, [hasConversation]);

  function generateTitle(text: string) {
    const t = text.trim();
    return t.length > 45 ? t.slice(0, 45) + "…" : t;
  }

  function scrollToBottom(behavior: ScrollBehavior = "smooth") {
    pinnedToBottomRef.current = true;
    messagesEndRef.current?.scrollIntoView({ behavior });
  }

  function startStreaming(msgId: string, paragraphs: AiParagraph[]) {
    currentParagraphsRef.current = paragraphs;
    const fullText = getStreamTextFor(paragraphs);
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
            ? { ...m, streamText: fullText, isStreaming: false, paragraphs }
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

  function queueAiResponse(paragraphs: AiParagraph[]) {
    setTimeout(() => {
      const aiId = `a${Date.now()}`;
      setMessages(prev => [...prev, {
        id: aiId,
        role: "assistant",
        isStreaming: true,
        streamText: "",
        sources: getSourceLabelsFor(paragraphs),
      }]);
      setTimeout(() => startStreaming(aiId, paragraphs), 1400);
    }, 80);
  }

  function handleRetry(msgId: string) {
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    setIsAiResponding(true);
    const msgIdx = messages.findIndex(m => m.id === msgId);
    const precedingUserMsg = [...messages.slice(0, msgIdx)].reverse().find(m => m.role === "user");
    const paragraphs = pickResponseFor(precedingUserMsg?.content ?? "");
    setMessages(prev => prev.map(m =>
      m.id === msgId
        ? { ...m, isError: false, isStreaming: true, streamText: "", sources: getSourceLabelsFor(paragraphs) }
        : m
    ));
    setTimeout(() => startStreaming(msgId, paragraphs), 800);
  }

  function handleSubmit(text: string) {
    setIsAiResponding(true);

    if (messages.length === 0) setConversationTitle(generateTitle(text));

    const userMsg: Message = { id: `u${Date.now()}`, role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    scrollToBottom();
    queueAiResponse(pickResponseFor(text));
  }

  function handleStopResponse() {
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    setIsAiResponding(false);
    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last?.isStreaming) {
        return [...prev.slice(0, -1), { ...last, isStreaming: false, paragraphs: currentParagraphsRef.current }];
      }
      return prev;
    });
  }

  function handleEditMessage(msgId: string, newContent: string) {
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    setIsAiResponding(true);
    const paragraphs = pickResponseFor(newContent);
    setMessages(prev => {
      const idx = prev.findIndex(m => m.id === msgId);
      if (idx === -1) return prev;
      return prev.slice(0, idx + 1).map(m =>
        m.id === msgId ? { ...m, content: newContent } : m
      );
    });
    queueAiResponse(paragraphs);
  }

  function handleFeedback(msgId: string, value: FeedbackState) {
    setMessages(prev => prev.map(m =>
      m.id === msgId ? { ...m, feedback: value } : m
    ));
  }

  function handleDeleteConversation() {
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    setMessages([]);
    setConversationTitle(null);
    setIsAiResponding(false);
  }

  // Restore a past conversation from the history panel as a completed exchange.
  function handleSelectConversation(conversation: Conversation) {
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    setIsAiResponding(false);
    const paragraphs = pickResponseFor(conversation.title);
    setConversationTitle(conversation.title);
    setMessages([
      { id: `u-restored-${conversation.id}`, role: "user", content: conversation.title },
      {
        id: `a-restored-${conversation.id}`,
        role: "assistant",
        paragraphs,
        streamText: getStreamTextFor(paragraphs),
      },
    ]);
    pinnedToBottomRef.current = true;
  }

  function saveTitle() {
    const t = titleDraft.trim();
    if (t) setConversationTitle(t);
    setIsRenamingTitle(false);
  }

  return (
    <div className="relative flex flex-1 overflow-hidden">
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
      {!hasConversation && (
        /* Shared clip container — overflow:hidden with card radius so blobs never bleed outside */
        <div
          className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
          style={{ borderRadius: "var(--radius-card)" }}
        >
          {/* Left blob — 80%×80%, starts -10% left so the edge is always off-screen even at max translation */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: "80%", height: "80%",
              top: "10%", left: "-10%",
              background: "radial-gradient(ellipse 70% 70% at 40% 50%, var(--blob-1) 0%, transparent 70%)",
              animation: "blob-1 9s ease-in-out infinite",
              willChange: "transform",
            }}
          />
          {/* Right blob — 80%×80%, ends -10% right for the same reason */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: "80%", height: "80%",
              top: "10%", right: "-10%",
              background: "radial-gradient(ellipse 70% 70% at 60% 50%, var(--blob-2) 0%, transparent 70%)",
              animation: "blob-2 12s ease-in-out infinite",
              willChange: "transform",
            }}
          />
        </div>
      )}

        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center gap-2 px-4 h-14 shrink-0" style={{ background: "color-mix(in srgb, var(--surface) 30%, transparent)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
          <SidebarTrigger className="-ml-1" />

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
                  <button className="flex items-center gap-1 text-[14px] font-medium text-foreground hover:text-primary transition-colors duration-100 max-w-[280px]">
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
                bottom: 112,
                background: "linear-gradient(to top, var(--surface) 30%, transparent)",
                opacity: msgsCanScrollDown ? 1 : 0,
              }}
            />
            {/* Scroll-to-bottom button */}
            <div
              className="absolute left-1/2 -translate-x-1/2 z-20 transition-all duration-200"
              style={{
                bottom: 120,
                opacity: msgsCanScrollDown ? 1 : 0,
                pointerEvents: msgsCanScrollDown ? "auto" : "none",
              }}
            >
              <button
                onClick={() => scrollToBottom()}
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
              <div className="min-h-full flex flex-col">
                <div className="flex-1 px-6 pt-8 pb-4">
                  <div className="max-w-[560px] mx-auto flex flex-col gap-8">
                    {messages.map(msg =>
                      msg.role === "user"
                        ? <UserMessage key={msg.id} content={msg.content!} onEdit={newContent => handleEditMessage(msg.id, newContent)} />
                        : <AiMessage key={msg.id} message={msg} onFeedback={handleFeedback} onRetry={handleRetry} onCitationClick={setActiveCitation} />
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Sticky input — same centering as messages above */}
                <div className="sticky bottom-0 px-6 pb-6 pt-2 flex flex-col items-center gap-2 bg-surface">
                  <div className="w-full max-w-[560px] relative">
                    <ChatComposer onSubmit={handleSubmit} isResponding={isAiResponding} onStop={handleStopResponse} />
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
            className="relative flex-1 flex flex-col items-center justify-start overflow-hidden px-6 pt-[30vh]"
          >
            <div className="relative z-10 w-full max-w-[560px] flex flex-col items-center text-center gap-8" style={{ animation: "msg-in 200ms ease-out both" }}>
              <div className="flex flex-col items-center gap-2">
                <h1 className="text-[20px] leading-none font-semibold text-primary">
                  How can I help you {USER.firstName}?
                </h1>
              </div>
              <div className="w-full relative">
                <ChatComposer onSubmit={handleSubmit} isResponding={isAiResponding} onStop={handleStopResponse} />
              </div>
              <p className="text-[12px] text-muted-foreground -mt-4">
                Cortex AI can make mistakes. Please check important info.
              </p>
            </div>
          </div>
        )}
        </div>
      </div>

      <div className="relative z-10 flex shrink-0">
      <ChatHistoryPanel
        isOpen={showHistory}
        onToggle={() => setShowHistory(v => !v)}
        onSelect={handleSelectConversation}
      />
      </div>

      <CitationPanel citation={activeCitation} onOpenChange={(open) => !open && setActiveCitation(null)} />
    </div>
  );
}
