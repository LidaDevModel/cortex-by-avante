/**
 * Mock AI response bank for the Cortex chat — a small topic bank so replies read
 * as relevant to what was actually asked, instead of one fixed block of
 * placeholder text. Matched by keyword against the user's question; falls back
 * to a general answer if nothing matches. Every citation carries a real
 * docId + sectionId so SourceChips deep-link into the Library.
 */

export type Citation = { docId: string; sectionId: string; label: string };

export type Segment = { type: "text"; text: string } | ({ type: "source" } & Citation);

export type AiParagraph = { segments: Segment[] };

type ResponseTopic = { keywords: string[]; paragraphs: AiParagraph[] };

const RESPONSE_TOPICS: ResponseTopic[] = [
  {
    keywords: ["escalat", "tier", "supervisor", "duty manager"],
    paragraphs: [
      {
        segments: [
          { type: "text", text: "Incidents are classified into three tiers, and the tier determines who needs to know and how fast. Tier 1 (minor) just needs logging in the incident register. Tier 2 (moderate risk or an actual breach) requires notifying your shift supervisor within 15 minutes of discovery." },
          { type: "source", label: "Incident Response", docId: "1", sectionId: "ir2" },
        ],
      },
      {
        segments: [
          { type: "text", text: "Tier 3 — serious harm, significant loss, or an ongoing threat — means notifying both the shift supervisor and duty manager immediately, and calling emergency services if required. If you're ever unsure which tier applies, classify upward and notify your supervisor rather than waiting." },
          { type: "source", label: "Incident Response", docId: "1", sectionId: "ir5" },
        ],
      },
    ],
  },
  {
    keywords: ["incident", "report", "log", "documentation"],
    paragraphs: [
      {
        segments: [
          { type: "text", text: "Every incident, regardless of severity, must be logged in the incident register within 30 minutes of occurring. Tier 2 and Tier 3 incidents additionally need a full written report submitted through the Avante incident reporting portal within two hours of the end of your shift." },
          { type: "source", label: "Incident Response", docId: "1", sectionId: "ir4" },
        ],
      },
      {
        segments: [
          { type: "text", text: "Keep reports factual — describe what you observed and what you did, without speculating about motive or intent. Witness statements should be taken at the time where possible, in the witness's own words." },
          { type: "source", label: "Post Orders", docId: "gd-1", sectionId: "s7" },
        ],
      },
    ],
  },
  {
    keywords: ["patrol", "perimeter", "checkpoint", "route"],
    paragraphs: [
      {
        segments: [
          { type: "text", text: "Internal patrols run every two hours on the hour, and external perimeter patrols every four hours. Use the electronic patrol wand at each checkpoint and log any anomalies in the patrol report as you go." },
          { type: "source", label: "Post Orders", docId: "gd-1", sectionId: "s3" },
        ],
      },
      {
        segments: [
          { type: "text", text: "Don't alter a patrol route without written approval from your shift supervisor — vary your pace and approach within the defined route instead, so it stays unpredictable. A missed or skipped checkpoint needs to be documented immediately with a reason." },
          { type: "source", label: "Post Orders", docId: "gd-1", sectionId: "s3a" },
        ],
      },
    ],
  },
  {
    keywords: ["access", "visitor", "badge", "gatehouse", "contractor", "id check"],
    paragraphs: [
      {
        segments: [
          { type: "text", text: "Everyone entering the site needs valid identification at the gatehouse. Contractors must be pre-approved by site management with a current access pass, and visitors are escorted at all times and signed in and out of the visitor log." },
          { type: "source", label: "Post Orders", docId: "gd-1", sectionId: "s2" },
        ],
      },
      {
        segments: [
          { type: "text", text: "Accepted ID includes government-issued photo ID, a company employee badge, or a pre-authorised visitor confirmation shown on a mobile device — reject anything expired or unclear. Visitor passes should only be issued after verifying pre-authorisation with the site contact." },
          { type: "source", label: "Post Orders", docId: "gd-1", sectionId: "s2a" },
        ],
      },
    ],
  },
  {
    keywords: ["emergency", "fire", "evacuat", "medical", "alarm", "first aid"],
    paragraphs: [
      {
        segments: [
          { type: "text", text: "On a fire alarm activation, follow the site evacuation plan posted at each fire point, notify the control room immediately, and direct staff and visitors to the designated assembly area. Don't investigate the source of the alarm yourself unless you're specifically trained and directed to." },
          { type: "source", label: "Post Orders", docId: "gd-1", sectionId: "s4" },
        ],
      },
      {
        segments: [
          { type: "text", text: "For a medical emergency, call emergency services before rendering first aid, unless there's an immediate life-threatening risk that makes first aid the priority — notify your shift supervisor at the same time, not after." },
          { type: "source", label: "Post Orders", docId: "gd-1", sectionId: "s4" },
        ],
      },
    ],
  },
  {
    keywords: ["radio", "channel", "comms", "communication"],
    paragraphs: [
      {
        segments: [
          { type: "text", text: "Channel 1 is the primary operations channel; Channel 2 is reserved for emergencies only. Run a radio check at the start of every shift — a faulty radio needs to be reported and replaced before you commence duties." },
          { type: "source", label: "Post Orders", docId: "gd-1", sectionId: "s5" },
        ],
      },
      {
        segments: [
          { type: "text", text: "Keep transmissions clear, concise, and professional, and avoid personal conversations on operational channels. Don't transmit sensitive information like names or addresses over an open channel." },
          { type: "source", label: "Post Orders", docId: "gd-1", sectionId: "s5" },
        ],
      },
    ],
  },
  {
    keywords: ["handover", "shift change", "relief", "end of shift"],
    paragraphs: [
      {
        segments: [
          { type: "text", text: "Handover has to happen face-to-face. As the outgoing officer, you're responsible for briefing the incoming officer on everything outstanding — incidents, access issues, equipment status — and both of you sign the handover log." },
          { type: "source", label: "Post Orders", docId: "gd-1", sectionId: "s8" },
        ],
      },
      {
        segments: [
          { type: "text", text: "Don't leave site until the incoming officer confirms they're ready to take over. If relief is late, notify your shift supervisor and stay on duty until you're properly relieved." },
          { type: "source", label: "Post Orders", docId: "gd-1", sectionId: "s8" },
        ],
      },
    ],
  },
];

// ─── Non-answers ──────────────────────────────────────────────────────────────
// Two deflection responses for questions we can't ground in a real source. Both
// carry ONLY text segments — no `source` — so no citation chip renders (a chip
// implies a backing section, and a non-answer has none). Copy is canonical in
// VISION's "Chat non-answers" table.

const OUT_OF_SCOPE_RESPONSE: AiParagraph[] = [
  {
    segments: [
      { type: "text", text: "I'm focused on Avante's security operations — protocols, procedures, and site guidelines. I can't help with that one. Try asking about access control, incident reporting, patrols, emergencies, or shift handover." },
    ],
  },
];

const NOT_FOUND_RESPONSE: AiParagraph[] = [
  {
    segments: [
      { type: "text", text: "That's within security operations, but I don't have anything on it in the Library yet. Try rephrasing, or ask your manager if you think it should be here." },
    ],
  },
];

// Broad Avante-domain vocabulary. A question that matches no specific topic but
// DOES hit this set is on-topic-but-uncovered (not-found); one that matches
// nothing here is off-topic entirely (out-of-scope). This mirrors a real
// retrieval-confidence gate: topic = high-confidence hit, domain-only = on-topic
// but retrieval empty, neither = off-topic. Keyword matching can't disambiguate
// homographs (e.g. "annual report" vs "incident report") — a real NLU/RAG layer
// would; acceptable for the mock.
const DOMAIN_VOCABULARY = [
  "security", "guard", "shift", "site", "safety", "supervisor", "manager",
  "duty", "uniform", "equipment", "report", "client", "visitor", "access",
  "incident", "patrol", "radio", "alarm", "emergency", "cctv", "post", "log",
  "protocol", "procedure", "escalat", "handover", "briefing", "checkpoint",
  "perimeter", "officer", "badge", "gatehouse", "evacuat", "first aid",
];

export type ResponseKind = "answer" | "not-found" | "out-of-scope";

export type ChatResponse = {
  kind: ResponseKind;
  paragraphs: AiParagraph[];
  /** Present on `not-found` — a "Browse the Library" affordance (deep link). */
  browseLibraryHref?: string;
};

/**
 * Resolves a question to a typed response via a three-tier gate:
 *   1. matches a topic       → grounded answer (with citations)
 *   2. domain vocab, no topic → not-found (on-topic, uncovered; no citation)
 *   3. neither               → out-of-scope (off-topic; no citation)
 * The `kind` is carried explicitly rather than inferred from "has sources", so a
 * real (sourced) answer can never be misread as a deflection, and the future
 * backend swaps in behind this same signature.
 */
export function resolveResponse(question: string): ChatResponse {
  const q = question.toLowerCase();
  const scored = RESPONSE_TOPICS.map(topic => ({
    topic,
    score: topic.keywords.filter(kw => q.includes(kw)).length,
  })).filter(s => s.score > 0);

  if (scored.length > 0) {
    scored.sort((a, b) => b.score - a.score);
    return { kind: "answer", paragraphs: scored[0].topic.paragraphs };
  }

  if (DOMAIN_VOCABULARY.some(kw => q.includes(kw))) {
    return { kind: "not-found", paragraphs: NOT_FOUND_RESPONSE, browseLibraryHref: "/library" };
  }

  return { kind: "out-of-scope", paragraphs: OUT_OF_SCOPE_RESPONSE };
}

/** The plain text a response streams as (source chips render only once complete). */
export function getStreamTextFor(paragraphs: AiParagraph[]): string {
  return paragraphs.map(p =>
    p.segments
      .filter((s): s is { type: "text"; text: string } => s.type === "text")
      .map(s => s.text)
      .join("")
  ).join("\n\n");
}

/** Unique citation labels in a response — used by the thinking indicator's status lines. */
export function getSourceLabelsFor(paragraphs: AiParagraph[]): string[] {
  const labels = paragraphs.flatMap(p =>
    p.segments.filter((s): s is { type: "source" } & Citation => s.type === "source").map(s => s.label)
  );
  return [...new Set(labels)];
}
