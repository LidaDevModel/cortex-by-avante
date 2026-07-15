/**
 * Mock AI response bank for the Cortex chat — a small topic bank so replies read
 * as relevant to what was actually asked, instead of one fixed block of
 * placeholder text. Matched by keyword against the user's question; falls back
 * to a general answer if nothing matches. Every citation carries a real
 * docId + sectionId so SourceChips deep-link into the Library.
 */

export type Citation = { docId: string; sectionId: string; label: string };

export type Segment = { type: "text"; text: string } | ({ type: "source" } & Citation);

/** A response is an ordered list of blocks the renderer walks by type. */
export type TextBlock = { type: "text"; segments: Segment[] };
/**
 * A diagram block — holds a full SVG document string. Mock: pre-authored,
 * on-brand SVGs (Stage 2). Future API: (untrusted) model output rendered inside
 * a sandboxed iframe. Same shape either way, so the renderer never changes.
 */
export type DiagramBlock = { type: "diagram"; svg: string; caption?: string };
export type ResponseBlock = TextBlock | DiagramBlock;

import { SAMPLE_DIAGRAMS, autoStepsDiagram } from "@/lib/chat-diagrams";

/** How explanatory an answer should be — set globally from the composer. */
export type DetailLevel = "concise" | "standard" | "detailed";

/** Each topic carries three lengths of the same answer as text blocks, and may
    point at a pre-authored diagram template (rendered on an explicit request). */
type TopicVariants = { concise: TextBlock[]; standard: TextBlock[]; detailed: TextBlock[] };
type ResponseTopic = { keywords: string[]; variants: TopicVariants; diagramKey?: keyof typeof SAMPLE_DIAGRAMS };

// Block/segment builders — keep the topic bank readable.
const txt = (text: string): Segment => ({ type: "text", text });
const src = (label: string, docId: string, sectionId: string): Segment => ({ type: "source", label, docId, sectionId });
const para = (...segments: Segment[]): TextBlock => ({ type: "text", segments });

const RESPONSE_TOPICS: ResponseTopic[] = [
  {
    keywords: ["escalat", "tier", "supervisor", "duty manager"],
    diagramKey: "escalation",
    variants: {
      concise: [
        para(
          txt("Incidents are graded in three tiers: Tier 1 you just log, Tier 2 means telling your shift supervisor within 15 minutes, and Tier 3 means notifying the supervisor and duty manager immediately — plus emergency services if needed."),
          src("Incident Response", "1", "ir2"),
        ),
      ],
      standard: [
        para(
          txt("Incidents are classified into three tiers, and the tier determines who needs to know and how fast. Tier 1 (minor) just needs logging in the incident register. Tier 2 (moderate risk or an actual breach) requires notifying your shift supervisor within 15 minutes of discovery."),
          src("Incident Response", "1", "ir2"),
        ),
        para(
          txt("Tier 3 — serious harm, significant loss, or an ongoing threat — means notifying both the shift supervisor and duty manager immediately, and calling emergency services if required. If you're ever unsure which tier applies, classify upward and notify your supervisor rather than waiting."),
          src("Incident Response", "1", "ir5"),
        ),
      ],
      detailed: [
        para(
          txt("Incidents are classified into three tiers, and the tier determines who needs to know and how fast. Tier 1 (minor) just needs logging in the incident register. Tier 2 (moderate risk or an actual breach) requires notifying your shift supervisor within 15 minutes of discovery."),
          src("Incident Response", "1", "ir2"),
        ),
        para(
          txt("Tier 3 — serious harm, significant loss, or an ongoing threat — means notifying both the shift supervisor and duty manager immediately, and calling emergency services if required. If you're ever unsure which tier applies, classify upward and notify your supervisor rather than waiting."),
          src("Incident Response", "1", "ir5"),
        ),
        para(
          txt("When in doubt, escalate upward — an over-reported Tier 2 is a minor admin note, but an under-reported Tier 3 costs critical response time. Record three things every time: when you discovered it, when you notified, and who you spoke to. That timeline is the first thing an incident review looks at."),
          src("Incident Response", "1", "ir5"),
        ),
      ],
    },
  },
  {
    keywords: ["incident", "report", "log", "documentation"],
    diagramKey: "incident",
    variants: {
      concise: [
        para(
          txt("Log every incident in the incident register within 30 minutes. Tier 2 and Tier 3 also need a full written report through the Avante portal within two hours of your shift ending."),
          src("Incident Response", "1", "ir4"),
        ),
      ],
      standard: [
        para(
          txt("Every incident, regardless of severity, must be logged in the incident register within 30 minutes of occurring. Tier 2 and Tier 3 incidents additionally need a full written report submitted through the Avante incident reporting portal within two hours of the end of your shift."),
          src("Incident Response", "1", "ir4"),
        ),
        para(
          txt("Keep reports factual — describe what you observed and what you did, without speculating about motive or intent. Witness statements should be taken at the time where possible, in the witness's own words."),
          src("Post Orders", "gd-1", "s7"),
        ),
      ],
      detailed: [
        para(
          txt("Every incident, regardless of severity, must be logged in the incident register within 30 minutes of occurring. Tier 2 and Tier 3 incidents additionally need a full written report submitted through the Avante incident reporting portal within two hours of the end of your shift."),
          src("Incident Response", "1", "ir4"),
        ),
        para(
          txt("Keep reports factual — describe what you observed and what you did, without speculating about motive or intent. Witness statements should be taken at the time where possible, in the witness's own words."),
          src("Post Orders", "gd-1", "s7"),
        ),
        para(
          txt("Attach whatever evidence you have — photos, CCTV reference numbers, and the names of anyone involved or present. When you record someone else's account, note clearly that it's their statement, not your own observation, so the report keeps a clean line between fact and hearsay."),
          src("Post Orders", "gd-1", "s7"),
        ),
      ],
    },
  },
  {
    keywords: ["patrol", "perimeter", "checkpoint", "route"],
    diagramKey: "patrol",
    variants: {
      concise: [
        para(
          txt("Run internal patrols every two hours and perimeter patrols every four, scanning the patrol wand at each checkpoint and logging anything unusual as you go."),
          src("Post Orders", "gd-1", "s3"),
        ),
      ],
      standard: [
        para(
          txt("Internal patrols run every two hours on the hour, and external perimeter patrols every four hours. Use the electronic patrol wand at each checkpoint and log any anomalies in the patrol report as you go."),
          src("Post Orders", "gd-1", "s3"),
        ),
        para(
          txt("Don't alter a patrol route without written approval from your shift supervisor — vary your pace and approach within the defined route instead, so it stays unpredictable. A missed or skipped checkpoint needs to be documented immediately with a reason."),
          src("Post Orders", "gd-1", "s3a"),
        ),
      ],
      detailed: [
        para(
          txt("Internal patrols run every two hours on the hour, and external perimeter patrols every four hours. Use the electronic patrol wand at each checkpoint and log any anomalies in the patrol report as you go."),
          src("Post Orders", "gd-1", "s3"),
        ),
        para(
          txt("Don't alter a patrol route without written approval from your shift supervisor — vary your pace and approach within the defined route instead, so it stays unpredictable. A missed or skipped checkpoint needs to be documented immediately with a reason."),
          src("Post Orders", "gd-1", "s3a"),
        ),
        para(
          txt("Treat a patrol as active, not a walk-through: check that doors and windows are secure, look for signs of tampering or forced entry, and note anything out of place even if it seems minor. If you can't complete a checkpoint — a blocked area or a safety hazard — log why and raise it at handover."),
          src("Post Orders", "gd-1", "s3a"),
        ),
      ],
    },
  },
  {
    keywords: ["access", "visitor", "badge", "gatehouse", "contractor", "id check"],
    variants: {
      concise: [
        para(
          txt("Everyone entering needs valid ID at the gatehouse — contractors pre-approved with a current pass, visitors escorted and signed in and out."),
          src("Post Orders", "gd-1", "s2"),
        ),
      ],
      standard: [
        para(
          txt("Everyone entering the site needs valid identification at the gatehouse. Contractors must be pre-approved by site management with a current access pass, and visitors are escorted at all times and signed in and out of the visitor log."),
          src("Post Orders", "gd-1", "s2"),
        ),
        para(
          txt("Accepted ID includes government-issued photo ID, a company employee badge, or a pre-authorised visitor confirmation shown on a mobile device — reject anything expired or unclear. Visitor passes should only be issued after verifying pre-authorisation with the site contact."),
          src("Post Orders", "gd-1", "s2a"),
        ),
      ],
      detailed: [
        para(
          txt("Everyone entering the site needs valid identification at the gatehouse. Contractors must be pre-approved by site management with a current access pass, and visitors are escorted at all times and signed in and out of the visitor log."),
          src("Post Orders", "gd-1", "s2"),
        ),
        para(
          txt("Accepted ID includes government-issued photo ID, a company employee badge, or a pre-authorised visitor confirmation shown on a mobile device — reject anything expired or unclear. Visitor passes should only be issued after verifying pre-authorisation with the site contact."),
          src("Post Orders", "gd-1", "s2a"),
        ),
        para(
          txt("If ID doesn't match the person, has expired, or you can't verify pre-authorisation, don't grant access — hold politely and call the site contact or your supervisor. Never wave someone through because they seem to belong or are in a hurry; tailgating through a controlled entry is one of the most common breaches."),
          src("Post Orders", "gd-1", "s2a"),
        ),
      ],
    },
  },
  {
    keywords: ["emergency", "fire", "evacuat", "medical", "alarm", "first aid"],
    diagramKey: "emergency",
    variants: {
      concise: [
        para(
          txt("On a fire alarm, follow the posted evacuation plan, alert the control room, and move people to the assembly area — don't go looking for the source yourself."),
          src("Post Orders", "gd-1", "s4"),
        ),
      ],
      standard: [
        para(
          txt("On a fire alarm activation, follow the site evacuation plan posted at each fire point, notify the control room immediately, and direct staff and visitors to the designated assembly area. Don't investigate the source of the alarm yourself unless you're specifically trained and directed to."),
          src("Post Orders", "gd-1", "s4"),
        ),
        para(
          txt("For a medical emergency, call emergency services before rendering first aid, unless there's an immediate life-threatening risk that makes first aid the priority — notify your shift supervisor at the same time, not after."),
          src("Post Orders", "gd-1", "s4"),
        ),
      ],
      detailed: [
        para(
          txt("On a fire alarm activation, follow the site evacuation plan posted at each fire point, notify the control room immediately, and direct staff and visitors to the designated assembly area. Don't investigate the source of the alarm yourself unless you're specifically trained and directed to."),
          src("Post Orders", "gd-1", "s4"),
        ),
        para(
          txt("For a medical emergency, call emergency services before rendering first aid, unless there's an immediate life-threatening risk that makes first aid the priority — notify your shift supervisor at the same time, not after."),
          src("Post Orders", "gd-1", "s4"),
        ),
        para(
          txt("Know your assembly point and the fastest route to it before anything happens — in a real evacuation you won't have time to work it out. Once there, help account for people and keep them clear of access routes so emergency services can get in without obstruction."),
          src("Post Orders", "gd-1", "s4"),
        ),
      ],
    },
  },
  {
    keywords: ["radio", "channel", "comms", "communication"],
    variants: {
      concise: [
        para(
          txt("Channel 1 is for operations, Channel 2 for emergencies only. Radio-check at the start of every shift, and swap out a faulty unit before you start."),
          src("Post Orders", "gd-1", "s5"),
        ),
      ],
      standard: [
        para(
          txt("Channel 1 is the primary operations channel; Channel 2 is reserved for emergencies only. Run a radio check at the start of every shift — a faulty radio needs to be reported and replaced before you commence duties."),
          src("Post Orders", "gd-1", "s5"),
        ),
        para(
          txt("Keep transmissions clear, concise, and professional, and avoid personal conversations on operational channels. Don't transmit sensitive information like names or addresses over an open channel."),
          src("Post Orders", "gd-1", "s5"),
        ),
      ],
      detailed: [
        para(
          txt("Channel 1 is the primary operations channel; Channel 2 is reserved for emergencies only. Run a radio check at the start of every shift — a faulty radio needs to be reported and replaced before you commence duties."),
          src("Post Orders", "gd-1", "s5"),
        ),
        para(
          txt("Keep transmissions clear, concise, and professional, and avoid personal conversations on operational channels. Don't transmit sensitive information like names or addresses over an open channel."),
          src("Post Orders", "gd-1", "s5"),
        ),
        para(
          txt("Use clear call signs and confirm you've been understood — a quick 'received' beats assuming your message landed. In an emergency, state your location first and the nature of the incident second, so responders can start moving even if the rest of the transmission breaks up."),
          src("Post Orders", "gd-1", "s5"),
        ),
      ],
    },
  },
  {
    keywords: ["handover", "shift change", "relief", "end of shift"],
    variants: {
      concise: [
        para(
          txt("Handovers are face-to-face: brief the incoming officer on anything outstanding, both sign the log, and don't leave until they've taken over."),
          src("Post Orders", "gd-1", "s8"),
        ),
      ],
      standard: [
        para(
          txt("Handover has to happen face-to-face. As the outgoing officer, you're responsible for briefing the incoming officer on everything outstanding — incidents, access issues, equipment status — and both of you sign the handover log."),
          src("Post Orders", "gd-1", "s8"),
        ),
        para(
          txt("Don't leave site until the incoming officer confirms they're ready to take over. If relief is late, notify your shift supervisor and stay on duty until you're properly relieved."),
          src("Post Orders", "gd-1", "s8"),
        ),
      ],
      detailed: [
        para(
          txt("Handover has to happen face-to-face. As the outgoing officer, you're responsible for briefing the incoming officer on everything outstanding — incidents, access issues, equipment status — and both of you sign the handover log."),
          src("Post Orders", "gd-1", "s8"),
        ),
        para(
          txt("Don't leave site until the incoming officer confirms they're ready to take over. If relief is late, notify your shift supervisor and stay on duty until you're properly relieved."),
          src("Post Orders", "gd-1", "s8"),
        ),
        para(
          txt("Walk through the site log together rather than just handing it over — outstanding incidents, access issues, equipment faults, and anything to watch on the next shift. Until you're properly relieved the post remains your responsibility, so never leave it unattended; if no one arrives, escalate to your supervisor."),
          src("Post Orders", "gd-1", "s8"),
        ),
      ],
    },
  },
];

// ─── Non-answers ──────────────────────────────────────────────────────────────
// Two deflection responses for questions we can't ground in a real source. Both
// carry ONLY text segments — no `source` — so no citation chip renders (a chip
// implies a backing section, and a non-answer has none). Copy is canonical in
// VISION's "Chat non-answers" table.

const OUT_OF_SCOPE_RESPONSE: TextBlock[] = [
  para(txt("I'm focused on Avante's security operations — protocols, procedures, and site guidelines. I can't help with that one. Try asking about access control, incident reporting, patrols, emergencies, or shift handover.")),
];

const NOT_FOUND_RESPONSE: TextBlock[] = [
  para(txt("That's within security operations, but I don't have anything on it in the Library yet. Try rephrasing, or ask your manager if you think it should be here.")),
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
  blocks: ResponseBlock[];
  /** Present on `not-found` — a "Browse the Library" affordance (deep link). */
  browseLibraryHref?: string;
  /** A diagram for this answer — authored where we have one, otherwise
      synthesized from the answer text. Rendered inline on an explicit request;
      otherwise offered via the "Show me a diagram" affordance. */
  diagram?: DiagramBlock;
};

/**
 * Resolves the latest user question to a typed response via a three-tier gate:
 *   1. matches a topic       → grounded answer (with citations)
 *   2. domain vocab, no topic → not-found (on-topic, uncovered; no citation)
 *   3. neither               → out-of-scope (off-topic; no citation)
 * Exported for the mock provider — the chat UI goes through ChatResponseProvider,
 * so the future backend swaps in behind that seam without touching this.
 */
// Phrasings that explicitly request a visual (Stage 3 expands the trigger).
const DIAGRAM_REQUEST = ["diagram", "flowchart", "flow chart", "chart", "visual", "visualise", "visualize", "draw", "map out", "step by step", "step-by-step", "show me the steps", "show me the flow"];

export function resolveResponse(question: string, level: DetailLevel = "standard"): ChatResponse {
  const q = question.toLowerCase();
  const scored = RESPONSE_TOPICS.map(topic => ({
    topic,
    score: topic.keywords.filter(kw => q.includes(kw)).length,
  })).filter(s => s.score > 0);

  if (scored.length > 0) {
    scored.sort((a, b) => b.score - a.score);
    const topic = scored[0].topic;
    const blocks: ResponseBlock[] = [...topic.variants[level]];
    // Every grounded answer can produce a diagram: authored where we have a
    // template, otherwise synthesized from the concise answer.
    const d = topic.diagramKey
      ? SAMPLE_DIAGRAMS[topic.diagramKey]
      : autoStepsDiagram(getStreamTextFor(topic.variants.concise));
    const diagram: DiagramBlock = { type: "diagram", svg: d.svg, caption: d.caption };
    // Explicit "show me a diagram" renders it inline; otherwise it's offered.
    if (DIAGRAM_REQUEST.some(kw => q.includes(kw))) blocks.push(diagram);
    return { kind: "answer", blocks, diagram };
  }

  if (DOMAIN_VOCABULARY.some(kw => q.includes(kw))) {
    return { kind: "not-found", blocks: NOT_FOUND_RESPONSE, browseLibraryHref: "/library" };
  }

  return { kind: "out-of-scope", blocks: OUT_OF_SCOPE_RESPONSE };
}

/** The plain text a response streams as (diagrams and source chips render on completion). */
export function getStreamTextFor(blocks: ResponseBlock[]): string {
  return blocks
    .filter((b): b is TextBlock => b.type === "text")
    .map((b) =>
      b.segments
        .filter((s): s is { type: "text"; text: string } => s.type === "text")
        .map((s) => s.text)
        .join("")
    )
    .join("\n\n");
}

/** Unique citation labels in a response — used by the thinking indicator's status lines. */
export function getSourceLabelsFor(blocks: ResponseBlock[]): string[] {
  const labels = blocks
    .filter((b): b is TextBlock => b.type === "text")
    .flatMap((b) => b.segments.filter((s): s is { type: "source" } & Citation => s.type === "source").map((s) => s.label));
  return [...new Set(labels)];
}
