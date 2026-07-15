"use client";

import { useRouter } from "next/navigation";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { BlobField } from "@/components/chat/BlobField";
import { stashChatLaunch } from "@/lib/chat-launch";
import { USER } from "@/lib/user-mock";

/**
 * Ask Cortex — the dashboard's chat entry point, styled as a miniature of the
 * chat empty state: a full-width card carrying the same drifting-blob background
 * (scaled down for the smaller surface), the same greeting + disclaimer, and the
 * shared composer. Looking like its destination makes the affordance obvious.
 * Used in both dashboard states.
 */
export function AskCortexCard() {
  const router = useRouter();
  return (
    <section
      className="relative overflow-hidden rounded-[12px] bg-surface"
      style={{ border: "1px solid var(--border)" }}
    >
      <BlobField scale={0.5} />
      <div className="relative z-10 flex flex-col items-center text-center gap-5 px-6 py-8">
        <h2 className="text-[20px] leading-none font-semibold text-primary">
          How can I help you {USER.firstName}?
        </h2>
        <div className="w-full max-w-[600px]">
          {/* Launcher: stash the message (text + any files) and hand off to the
              full chat, which picks it up on mount — files ride along intact. */}
          <ChatComposer
            onSubmit={(text, attachments) => {
              stashChatLaunch({ text, attachments });
              router.push("/chat");
            }}
          />
        </div>
        <p className="text-[12px] leading-[16px] text-muted-foreground">
          Cortex AI can make mistakes. Please check important info.
        </p>
      </div>
    </section>
  );
}
