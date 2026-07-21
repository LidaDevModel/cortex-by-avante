"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ThumbsUp, ThumbsDown, Volume2, ArrowUpRight, Library, Copy, Check, Workflow } from "lucide-react";
import { type ResponseBlock, type DiagramBlock as DiagramBlockData, getStreamTextFor } from "@/lib/chat-mock";
import { ThinkingIndicator, StreamingCaret } from "@/components/chat/ThinkingIndicator";
import { ShareFeedbackModal } from "@/components/chat/ShareFeedbackModal";
import { CitationChip } from "@/components/chat/CitationChip";
import { DiagramBlock } from "@/components/chat/DiagramBlock";
import { type Attachment } from "@/components/chat/AttachmentChip";

export type FeedbackState = null | "up" | "down";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content?: string;
  /** Files/photos the user attached to this message (user messages only). */
  attachments?: Attachment[];
  streamText?: string;
  isStreaming?: boolean;
  isError?: boolean;
  /** The settled response as ordered blocks (text · diagram). */
  blocks?: ResponseBlock[];
  /** Citation labels for the thinking indicator's status lines. */
  sources?: string[];
  /** Present on a `not-found` deflection — renders a "Browse the Library" link. */
  browseLibraryHref?: string;
  /** The diagram available for this answer — shows "Show me a diagram" until
      it's revealed into this message's blocks. */
  diagram?: DiagramBlockData;
  feedback?: FeedbackState;
};

function FeedbackBtn({
  type,
  active,
  onClick,
}: {
  type: "up" | "down";
  active: boolean;
  onClick: () => void;
}) {
  const Icon = type === "up" ? ThumbsUp : ThumbsDown;
  return (
    <button
      onClick={onClick}
      className={`p-1.5 rounded-lg transition-colors duration-100 ${active ? "bg-accent-subtle" : ""}`}
      aria-label={type === "up" ? "Helpful" : "Not helpful"}
      aria-pressed={active}
    >
      <Icon
        size={14}
        className={active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}
      />
    </button>
  );
}

export function AiMessage({
  message,
  onFeedback,
  onFlag,
  onRetry,
  onShowDiagram,
}: {
  message: Message;
  onFeedback: (id: string, value: FeedbackState) => void;
  /** Negative feedback files a flag for admin review (reason + optional note). */
  onFlag?: (id: string, reason: string, note?: string) => void;
  onRetry: (id: string) => void;
  /** Reveal the topic's diagram into this message. */
  onShowDiagram?: (id: string) => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const text = message.blocks ? getStreamTextFor(message.blocks) : message.streamText ?? "";
    if (!text) return;
    try { navigator.clipboard?.writeText(text); } catch { /* best-effort */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  // Stop read-aloud if the message unmounts mid-speech.
  useEffect(() => {
    return () => {
      if (isSpeaking) window.speechSynthesis?.cancel();
    };
  }, [isSpeaking]);

  function handleReadAloud() {
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }
    const text = message.blocks ? getStreamTextFor(message.blocks) : message.streamText ?? "";
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    synth.cancel();
    synth.speak(utterance);
    setIsSpeaking(true);
  }

  if (message.isStreaming && !message.streamText) {
    return (
      <div className="flex items-start pt-1" style={{ animation: "msg-in 200ms ease-out both" }}>
        <ThinkingIndicator sources={message.sources} />
      </div>
    );
  }

  if (message.isStreaming && message.streamText) {
    return (
      <div className="flex flex-col gap-3 w-full">
        <p className="text-[15px] leading-[24px] text-foreground whitespace-pre-wrap">
          {message.streamText}
          <StreamingCaret />
        </p>
      </div>
    );
  }

  if (message.isError) {
    return (
      <div className="flex flex-col gap-3 w-full" style={{ animation: "msg-in 200ms ease-out both" }}>
        {message.streamText && (
          <p className="text-[15px] leading-[24px] text-foreground whitespace-pre-wrap">
            {message.streamText}
          </p>
        )}
        <div className="flex items-center gap-2">
          <p className="text-[13px] leading-[20px] text-muted-foreground">
            Cortex couldn't get a response. Try again in a moment.
          </p>
          <button
            onClick={() => onRetry(message.id)}
            className="shrink-0 text-[13px] font-medium text-primary hover:underline transition-colors duration-100"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const fb = message.feedback ?? null;
  let chipIndex = 0;

  return (
    <>
      <div className="flex flex-col gap-3 w-full">
        {/* Walk the response blocks by type. Text blocks render their segments
            (with inline citation chips); diagram blocks are rendered by the
            sandboxed renderer in Stage 2. */}
        <div className="flex flex-col gap-4">
          {(message.blocks ?? []).map((block, i) => {
            if (block.type === "text") {
              return (
                <p key={i} className="text-[15px] leading-[24px] text-foreground">
                  {block.segments.map((seg, j) =>
                    seg.type === "text"
                      ? <span key={j}>{seg.text}</span>
                      : <CitationChip key={j} docId={seg.docId} sectionId={seg.sectionId} label={seg.label} delayMs={chipIndex++ * 60} />
                  )}
                </p>
              );
            }
            return <DiagramBlock key={i} svg={block.svg} caption={block.caption} />;
          })}
        </div>
        {message.browseLibraryHref && (
          <Link
            href={message.browseLibraryHref}
            className="inline-flex items-center gap-1.5 self-start text-[13px] font-medium text-primary hover:underline transition-colors duration-100"
            style={{ animation: "msg-in 200ms ease-out 150ms both" }}
          >
            <Library size={14} strokeWidth={1.5} />
            Browse the Library
            <ArrowUpRight size={13} />
          </Link>
        )}

        {/* "Show me a diagram" — offered whenever the topic has a diagram that
            wasn't already rendered into this message (covers the user who's
            struggling, without relying on how they phrased it). */}
        {message.diagram && !(message.blocks ?? []).some((b) => b.type === "diagram") && (
          <button
            type="button"
            onClick={() => onShowDiagram?.(message.id)}
            className="inline-flex items-center gap-1.5 self-start h-9 px-3 rounded-[8px] text-[13px] font-medium border transition-colors duration-100 hover:bg-[var(--surface-lifted)]"
            style={{ borderColor: "var(--primary)", color: "var(--primary)", animation: "msg-in 200ms ease-out 150ms both" }}
          >
            <Workflow size={14} strokeWidth={1.5} />
            Show me a diagram
          </button>
        )}
        <div className="flex flex-col gap-1.5" style={{ animation: "msg-in 200ms ease-out 150ms both" }}>
          <div className="flex items-center gap-1">
            <FeedbackBtn
              type="up"
              active={fb === "up"}
              onClick={() => onFeedback(message.id, fb === "up" ? null : "up")}
            />
            <FeedbackBtn
              type="down"
              active={fb === "down"}
              onClick={() => {
                if (fb === "down") { onFeedback(message.id, null); return; }
                setShowModal(true);
              }}
            />
            <button
              onClick={handleReadAloud}
              aria-label={isSpeaking ? "Stop reading aloud" : "Read aloud"}
              aria-pressed={isSpeaking}
              className={`p-1.5 rounded-lg transition-colors duration-100 ${
                isSpeaking
                  ? "bg-accent-subtle text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
              }`}
            >
              <Volume2 size={14} />
            </button>
            <button
              onClick={handleCopy}
              aria-label={copied ? "Copied" : "Copy message"}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors duration-100"
            >
              {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
            </button>
          </div>
          {fb === "down" && (
            <p className="text-[12px] leading-[16px] text-muted-foreground">Feedback received</p>
          )}
        </div>
      </div>

      {showModal && (
        <ShareFeedbackModal
          onClose={() => setShowModal(false)}
          onSubmit={(reason, note) => {
            onFeedback(message.id, "down");
            onFlag?.(message.id, reason, note);
          }}
        />
      )}
    </>
  );
}
