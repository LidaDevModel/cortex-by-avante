"use client";

import { useEffect, useState } from "react";
import { ThumbsUp, ThumbsDown, Volume2, ArrowUpRight } from "lucide-react";
import { type Citation, type AiParagraph, getStreamTextFor } from "@/lib/chat-mock";
import { ThinkingIndicator, StreamingCaret } from "@/components/chat/ThinkingIndicator";
import { ShareFeedbackModal } from "@/components/chat/ShareFeedbackModal";

export type FeedbackState = null | "up" | "down";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content?: string;
  streamText?: string;
  isStreaming?: boolean;
  isError?: boolean;
  paragraphs?: AiParagraph[];
  /** Citation labels for the thinking indicator's status lines. */
  sources?: string[];
  feedback?: FeedbackState;
};

function SourceChip({ label, onClick, delayMs }: { label: string; onClick: () => void; delayMs: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-0.5 mx-1 px-2 py-0.5 rounded-md text-[12px] font-medium text-primary cursor-pointer hover:bg-primary/10 transition-colors duration-100 whitespace-nowrap"
      style={{
        background: "color-mix(in srgb, var(--primary) 10%, var(--surface))",
        animation: `chip-in 150ms ease-out ${delayMs}ms both`,
      }}
    >
      {label}
      <ArrowUpRight size={10} />
    </button>
  );
}

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
  onRetry,
  onCitationClick,
}: {
  message: Message;
  onFeedback: (id: string, value: FeedbackState) => void;
  onRetry: (id: string) => void;
  onCitationClick: (citation: Citation) => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

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
    const text = message.paragraphs ? getStreamTextFor(message.paragraphs) : message.streamText ?? "";
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
        <div className="space-y-4 text-[15px] leading-[24px] text-foreground">
          {(message.paragraphs ?? []).map((para, i) => (
            <p key={i}>
              {para.segments.map((seg, j) =>
                seg.type === "text"
                  ? <span key={j}>{seg.text}</span>
                  : <SourceChip key={j} label={seg.label} delayMs={chipIndex++ * 60} onClick={() => onCitationClick(seg)} />
              )}
            </p>
          ))}
        </div>
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
          </div>
          {fb === "down" && (
            <p className="text-[12px] leading-[16px] text-muted-foreground">Feedback received</p>
          )}
        </div>
      </div>

      {showModal && (
        <ShareFeedbackModal
          onClose={() => setShowModal(false)}
          onSubmit={() => onFeedback(message.id, "down")}
        />
      )}
    </>
  );
}
