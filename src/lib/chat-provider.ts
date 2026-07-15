import { resolveResponse, type ChatResponse, type DetailLevel } from "@/lib/chat-mock";

/**
 * The response-source seam. The chat UI depends only on this interface, never
 * on the mock directly. The mock implements it now; a real Anthropic-API
 * provider implements the SAME interface later and is swapped in below.
 *
 * TODO(api): add `AnthropicChatProvider implements ChatResponseProvider` (its
 * getResponse will be async — the call sites already treat the result as the
 * single source of the assistant turn, so wiring it is a localized change) and
 * point `chatProvider` at it.
 */

/** One conversation turn as the provider sees it (API-shaped). */
export type ProviderMessage = { role: "user" | "assistant"; text: string };

export type ResponseOptions = { detail: DetailLevel };

export interface ChatResponseProvider {
  getResponse(messages: ProviderMessage[], options: ResponseOptions): ChatResponse;
}

/** Mock provider — resolves against the local topic bank using the last user turn. */
export const mockChatProvider: ChatResponseProvider = {
  getResponse(messages, options) {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    return resolveResponse(lastUser?.text ?? "", options.detail);
  },
};

/** The active provider the chat talks to. Swap to the API provider later. */
export const chatProvider: ChatResponseProvider = mockChatProvider;

// The response contract, re-exported so the UI imports it from the seam.
export type {
  ChatResponse,
  ResponseBlock,
  TextBlock,
  DiagramBlock,
  Segment,
  Citation,
  DetailLevel,
  ResponseKind,
} from "@/lib/chat-mock";
