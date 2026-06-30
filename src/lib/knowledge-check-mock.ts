// KC-specific branching types — structurally compatible with exam BranchingGame
export type KCBranchingOption = {
  id: string;
  text: string;
  nextNodeId: string;
  isCorrect: boolean;
  isOptimal: boolean;
  explanation: string;
};

export type KCBranchingNode = {
  id: string;
  type: "start" | "decision" | "end";
  label?: string;
  scenarioText?: string;
  options?: KCBranchingOption[];
  nextId?: string;
};

/* ─── Types ─── */

export type KCFormat = "mc" | "matching" | "branching";
export type KCCategory = "escalations" | "first-aid" | "incidents" | "clients";

export type KCMCQuestion = {
  id: string;
  type: "mc";
  question: string;
  options: string[];
  correctIndex: number;
  sourceDoc: string;
  sourceSection: string;
};

export type KCMatchingQuestion = {
  id: string;
  type: "matching";
  instruction: string;
  pairs: { id: string; term: string; definition: string }[];
  sourceDoc: string;
  sourceSection: string;
};

export type KCBranchingQuestion = {
  id: string;
  type: "branching";
  title: string;
  nodes: KCBranchingNode[];
  startNodeId: string;
  sourceDoc: string;
  sourceSection: string;
};

export type KCQuestion = KCMCQuestion | KCMatchingQuestion | KCBranchingQuestion;

export type KCMCAnswer = { type: "mc"; selectedIndex: number | null };
export type KCMatchingAnswer = { type: "matching"; matches: Record<string, string> };
export type KCBranchingAnswer = { type: "branching"; decisions: Record<string, string>; isCompleted: boolean };
export type KCAnswer = KCMCAnswer | KCMatchingAnswer | KCBranchingAnswer;

export type KCAttempt = {
  id: string;
  date: string;
  categories: KCCategory[];
  formats: KCFormat[];
  score: number;
  total: number;
  questions: KCQuestion[];
  answers: Record<string, KCAnswer>;
};

/* ─── Budget table ─── */

type Budget = { mc: number; matching: number; branching: number; total: number; time: string };

const BUDGETS: Record<string, Budget> = {
  mc: { mc: 8, matching: 0, branching: 0, total: 8, time: "~4 min" },
  matching: { mc: 0, matching: 3, branching: 0, total: 3, time: "~3 min" },
  branching: { mc: 0, matching: 0, branching: 3, total: 3, time: "~7 min" },
  "mc,matching": { mc: 5, matching: 2, branching: 0, total: 7, time: "~5 min" },
  "mc,branching": { mc: 4, matching: 0, branching: 2, total: 6, time: "~6 min" },
  "matching,branching": { mc: 0, matching: 2, branching: 2, total: 4, time: "~6 min" },
  "branching,matching": { mc: 0, matching: 2, branching: 2, total: 4, time: "~6 min" },
  "mc,matching,branching": { mc: 4, matching: 1, branching: 1, total: 6, time: "~6 min" },
  "branching,matching,mc": { mc: 4, matching: 1, branching: 1, total: 6, time: "~6 min" },
};

export function getBudget(formats: KCFormat[]): Budget {
  const key = [...formats].sort().join(",");
  return BUDGETS[key] ?? { mc: 4, matching: 1, branching: 1, total: 6, time: "~6 min" };
}

/* ─── Question banks ─── */

const MC_BANK: KCMCQuestion[] = [
  {
    id: "kc-mc-1",
    type: "mc",
    question: "Which tier of escalation requires immediate notification of emergency services?",
    options: ["Tier 1 — Monitor", "Tier 2 — Notify", "Tier 3 — Respond", "Post-incident review"],
    correctIndex: 2,
    sourceDoc: "Escalation Procedures Manual",
    sourceSection: "Section 3 — Tier Classification",
  },
  {
    id: "kc-mc-2",
    type: "mc",
    question: "What is the first action a guard should take when discovering an unattended bag?",
    options: [
      "Open the bag to inspect contents",
      "Establish a safety perimeter and notify your supervisor",
      "Wait 10 minutes to see if someone returns",
      "Move the bag to a secure area",
    ],
    correctIndex: 1,
    sourceDoc: "Suspicious Item Procedures",
    sourceSection: "Section 1 — Initial Response",
  },
  {
    id: "kc-mc-3",
    type: "mc",
    question: "How long after an incident must a security report be completed?",
    options: ["1 hour", "4 hours", "End of shift", "24 hours"],
    correctIndex: 1,
    sourceDoc: "Incident Reporting Standards",
    sourceSection: "Section 2 — Time Requirements",
  },
  {
    id: "kc-mc-4",
    type: "mc",
    question: "Which communication channel is designated for Tier 2 security incidents?",
    options: [
      "Personal mobile phone",
      "Designated radio channel with supervisor notification",
      "Email to control room",
      "Public address system",
    ],
    correctIndex: 1,
    sourceDoc: "Communication Protocols",
    sourceSection: "Section 4 — Incident Channels",
  },
  {
    id: "kc-mc-5",
    type: "mc",
    question: "During a fire evacuation, a staff member refuses to leave. What is the correct response?",
    options: [
      "Force them to leave immediately",
      "Calmly but firmly direct them to evacuate and report to your supervisor",
      "Leave without them",
      "Call the fire service before continuing",
    ],
    correctIndex: 1,
    sourceDoc: "Emergency Evacuation Procedures",
    sourceSection: "Section 3 — Non-Compliant Occupants",
  },
  {
    id: "kc-mc-6",
    type: "mc",
    question: "What does a Tier 1 security event require?",
    options: [
      "Immediate escalation to police",
      "Monitoring and documentation only",
      "Site lockdown",
      "Evacuation of all personnel",
    ],
    correctIndex: 1,
    sourceDoc: "Escalation Procedures Manual",
    sourceSection: "Section 2 — Tier 1 Incidents",
  },
  {
    id: "kc-mc-7",
    type: "mc",
    question: "When encountering a person tailgating through a secure door, you should:",
    options: [
      "Allow entry and report it later",
      "Politely challenge and request ID before entry",
      "Physically block the door",
      "Ignore if the person appears to work there",
    ],
    correctIndex: 1,
    sourceDoc: "Access Control Protocols",
    sourceSection: "Section 2 — Tailgating",
  },
  {
    id: "kc-mc-8",
    type: "mc",
    question: "A shift handover report should include which of the following?",
    options: [
      "Personal opinions about staff behaviour",
      "All incidents, observations, and unresolved tasks from the shift",
      "Only major incidents requiring police involvement",
      "Nothing — verbal briefing is sufficient",
    ],
    correctIndex: 1,
    sourceDoc: "Shift Handover Standards",
    sourceSection: "Section 1 — Report Contents",
  },
];

const MATCHING_BANK: KCMatchingQuestion[] = [
  {
    id: "kc-match-1",
    type: "matching",
    instruction: "Match each escalation tier to its correct definition.",
    pairs: [
      { id: "t1", term: "Tier 1 — Monitor", definition: "Low-risk situation requiring observation only; no immediate action needed." },
      { id: "t2", term: "Tier 2 — Notify", definition: "Elevated risk requiring supervisor notification and documented observation." },
      { id: "t3", term: "Tier 3 — Respond", definition: "Immediate threat requiring active response and emergency services if necessary." },
      { id: "t4", term: "Post-incident review", definition: "Structured debrief conducted within 24 hours to assess response and improvements." },
    ],
    sourceDoc: "Escalation Procedures Manual",
    sourceSection: "Section 3 — Tier Definitions",
  },
  {
    id: "kc-match-2",
    type: "matching",
    instruction: "Match each communication method to its correct use case.",
    pairs: [
      { id: "c1", term: "Designated radio channel", definition: "Used for Tier 2+ incident coordination and supervisor alerts." },
      { id: "c2", term: "Personal mobile phone", definition: "Used for calling emergency services when radio is unavailable." },
      { id: "c3", term: "Incident report form", definition: "Used for documenting all observations and actions taken during an event." },
    ],
    sourceDoc: "Communication Protocols",
    sourceSection: "Section 2 — Method Reference",
  },
  {
    id: "kc-match-3",
    type: "matching",
    instruction: "Match each incident type to its required initial action.",
    pairs: [
      { id: "i1", term: "Unattended suspicious item", definition: "Establish safety perimeter and notify supervisor immediately." },
      { id: "i2", term: "Unauthorised access attempt", definition: "Challenge individual, request ID, and escalate if refused." },
      { id: "i3", term: "Medical emergency", definition: "Call emergency services and apply first aid if trained." },
    ],
    sourceDoc: "Incident Response Handbook",
    sourceSection: "Section 1 — First Actions",
  },
];

const BRANCHING_BANK: KCBranchingQuestion[] = [
  {
    id: "kc-branch-1",
    type: "branching",
    title: "Unauthorised access scenario",
    startNodeId: "b1-start",
    nodes: [
      { id: "b1-start", type: "start", nextId: "b1-d1" },
      {
        id: "b1-d1", type: "decision", label: "Access check",
        scenarioText: "You observe an individual in the restricted server room not wearing a site ID badge. They claim to be from IT. What do you do?",
        options: [
          { id: "b1-d1-a", text: "Accept their explanation and allow them to continue.", nextNodeId: "b1-d2", isCorrect: false, isOptimal: false, explanation: "" },
          { id: "b1-d1-b", text: "Request photo ID and verify with the control room before letting them remain.", nextNodeId: "b1-d2", isCorrect: true, isOptimal: true, explanation: "" },
          { id: "b1-d1-c", text: "Immediately escort them out without verification.", nextNodeId: "b1-d2", isCorrect: false, isOptimal: false, explanation: "" },
        ],
      },
      {
        id: "b1-d2", type: "decision", label: "Control room",
        scenarioText: "Control room confirms the person is not on the approved visitor list for today. The individual insists their manager approved the visit verbally. What do you do next?",
        options: [
          { id: "b1-d2-a", text: "Escort them to a waiting area while you contact their named manager to confirm.", nextNodeId: "b1-d3", isCorrect: true, isOptimal: true, explanation: "" },
          { id: "b1-d2-b", text: "Allow them to remain — a verbal approval from a manager is sufficient.", nextNodeId: "b1-d3", isCorrect: false, isOptimal: false, explanation: "" },
          { id: "b1-d2-c", text: "Remove them immediately and file an incident report.", nextNodeId: "b1-d3", isCorrect: false, isOptimal: false, explanation: "" },
        ],
      },
      {
        id: "b1-d3", type: "decision", label: "Resolution",
        scenarioText: "The manager confirms the visit was legitimate but forgot to register it. The individual's work is time-sensitive. What is your final action?",
        options: [
          { id: "b1-d3-a", text: "Allow them access and ask the manager to complete the visitor registration retroactively.", nextNodeId: "b1-end", isCorrect: true, isOptimal: true, explanation: "" },
          { id: "b1-d3-b", text: "Deny access until the registration is formally completed in the system.", nextNodeId: "b1-end", isCorrect: false, isOptimal: false, explanation: "" },
          { id: "b1-d3-c", text: "Allow access without any further documentation since the manager confirmed verbally.", nextNodeId: "b1-end", isCorrect: false, isOptimal: false, explanation: "" },
        ],
      },
      { id: "b1-end", type: "end", label: "Complete" },
    ],
    sourceDoc: "Access Control Protocols",
    sourceSection: "Section 3 — ID Verification",
  },
  {
    id: "kc-branch-2",
    type: "branching",
    title: "Medical emergency response",
    startNodeId: "b2-start",
    nodes: [
      { id: "b2-start", type: "start", nextId: "b2-d1" },
      {
        id: "b2-d1", type: "decision", label: "First response",
        scenarioText: "During a routine patrol you find a staff member slumped at their desk and unresponsive. A colleague says they saw the person fall asleep earlier. What do you do?",
        options: [
          { id: "b2-d1-a", text: "Leave them to sleep and check again in 30 minutes.", nextNodeId: "b2-d2", isCorrect: false, isOptimal: false, explanation: "" },
          { id: "b2-d1-b", text: "Attempt to rouse them, and if unresponsive, call emergency services immediately.", nextNodeId: "b2-d2", isCorrect: true, isOptimal: true, explanation: "" },
          { id: "b2-d1-c", text: "Call their manager and wait for further instructions.", nextNodeId: "b2-d2", isCorrect: false, isOptimal: false, explanation: "" },
        ],
      },
      {
        id: "b2-d2", type: "decision", label: "While waiting",
        scenarioText: "Emergency services are on the way. The person is breathing but unconscious. Another staff member offers to help. What do you instruct them to do?",
        options: [
          { id: "b2-d2-a", text: "Keep bystanders back and clear a path to the entrance for paramedics.", nextNodeId: "b2-d3", isCorrect: true, isOptimal: true, explanation: "" },
          { id: "b2-d2-b", text: "Ask them to move the person to a more comfortable position.", nextNodeId: "b2-d3", isCorrect: false, isOptimal: false, explanation: "" },
          { id: "b2-d2-c", text: "Send them to the break room — bystanders can complicate the situation.", nextNodeId: "b2-d3", isCorrect: false, isOptimal: false, explanation: "" },
        ],
      },
      {
        id: "b2-d3", type: "decision", label: "Handover",
        scenarioText: "Paramedics arrive and take over. Your supervisor asks you to document the incident. When should you complete the report?",
        options: [
          { id: "b2-d3-a", text: "Before the end of your shift, while details are fresh.", nextNodeId: "b2-end", isCorrect: true, isOptimal: true, explanation: "" },
          { id: "b2-d3-b", text: "The next business day, once you have fully recovered from the incident.", nextNodeId: "b2-end", isCorrect: false, isOptimal: false, explanation: "" },
          { id: "b2-d3-c", text: "Only if the person is admitted to hospital.", nextNodeId: "b2-end", isCorrect: false, isOptimal: false, explanation: "" },
        ],
      },
      { id: "b2-end", type: "end", label: "Complete" },
    ],
    sourceDoc: "Medical Emergency Procedures",
    sourceSection: "Section 2 — Unresponsive Person",
  },
  {
    id: "kc-branch-3",
    type: "branching",
    title: "Shift handover breach",
    startNodeId: "b3-start",
    nodes: [
      { id: "b3-start", type: "start", nextId: "b3-d1" },
      {
        id: "b3-d1", type: "decision", label: "Breach report",
        scenarioText: "A colleague reports a minor access breach verbally at shift end. Your relief has arrived. What do you do first?",
        options: [
          { id: "b3-d1-a", text: "Leave the verbal report with your relief and head home.", nextNodeId: "b3-d2", isCorrect: false, isOptimal: false, explanation: "" },
          { id: "b3-d1-b", text: "Complete a written incident report before leaving, then brief your relief fully.", nextNodeId: "b3-d2", isCorrect: true, isOptimal: true, explanation: "" },
          { id: "b3-d1-c", text: "Submit the report the next time you are on shift.", nextNodeId: "b3-d2", isCorrect: false, isOptimal: false, explanation: "" },
        ],
      },
      {
        id: "b3-d2", type: "decision", label: "Escalation",
        scenarioText: "While documenting, you realise the breach may involve a senior staff member. Do you escalate before leaving?",
        options: [
          { id: "b3-d2-a", text: "Yes — notify your supervisor immediately regardless of the time.", nextNodeId: "b3-d3", isCorrect: true, isOptimal: true, explanation: "" },
          { id: "b3-d2-b", text: "No — include it in the report and let the next shift supervisor decide.", nextNodeId: "b3-d3", isCorrect: false, isOptimal: false, explanation: "" },
          { id: "b3-d2-c", text: "Wait to see if the individual comes forward themselves.", nextNodeId: "b3-d3", isCorrect: false, isOptimal: false, explanation: "" },
        ],
      },
      {
        id: "b3-d3", type: "decision", label: "Evidence",
        scenarioText: "CCTV footage covering the breach period is due to be overwritten in two hours. What is the correct action?",
        options: [
          { id: "b3-d3-a", text: "Inform your supervisor and request the footage be preserved before you leave.", nextNodeId: "b3-end", isCorrect: true, isOptimal: true, explanation: "" },
          { id: "b3-d3-b", text: "Note the timestamp in your report and trust that the system retains footage automatically.", nextNodeId: "b3-end", isCorrect: false, isOptimal: false, explanation: "" },
          { id: "b3-d3-c", text: "It is your relief's responsibility — hand over and go.", nextNodeId: "b3-end", isCorrect: false, isOptimal: false, explanation: "" },
        ],
      },
      { id: "b3-end", type: "end", label: "Complete" },
    ],
    sourceDoc: "Shift Handover Standards",
    sourceSection: "Section 2 — End-of-Shift Obligations",
  },
];

/* ─── Question generation ─── */

export function generateQuestions(formats: KCFormat[], _categories: KCCategory[]): KCQuestion[] {
  const budget = getBudget(formats);
  const questions: KCQuestion[] = [];
  if (budget.mc > 0) questions.push(...MC_BANK.slice(0, budget.mc));
  if (budget.matching > 0) questions.push(...MATCHING_BANK.slice(0, budget.matching));
  if (budget.branching > 0) questions.push(...BRANCHING_BANK.slice(0, budget.branching));
  return questions;
}

/* ─── Scoring ─── */

export function scoreQuestion(
  question: KCQuestion,
  answer: KCAnswer | undefined
): { correct: number; total: number } {
  if (!answer) return { correct: 0, total: questionTotal(question) };

  if (question.type === "mc" && answer.type === "mc") {
    return { correct: answer.selectedIndex === question.correctIndex ? 1 : 0, total: 1 };
  }
  if (question.type === "matching" && answer.type === "matching") {
    const correct = question.pairs.filter((p) => answer.matches[p.id] === p.id).length;
    return { correct, total: question.pairs.length };
  }
  if (question.type === "branching" && answer.type === "branching") {
    const decisionNodes = question.nodes.filter(n => n.type === "decision");
    const correct = decisionNodes.filter(n => {
      const chosenId = answer.decisions[n.id];
      return n.options?.find(o => o.id === chosenId)?.isCorrect ?? false;
    }).length;
    return { correct, total: decisionNodes.length };
  }
  return { correct: 0, total: questionTotal(question) };
}

function questionTotal(question: KCQuestion): number {
  if (question.type === "matching") return question.pairs.length;
  if (question.type === "branching") return question.nodes.filter(n => n.type === "decision").length;
  return 1;
}

export function computeKCScore(
  questions: KCQuestion[],
  answers: Record<string, KCAnswer>
): { score: number; total: number } {
  return questions.reduce(
    (acc, q) => {
      const r = scoreQuestion(q, answers[q.id]);
      return { score: acc.score + r.correct, total: acc.total + r.total };
    },
    { score: 0, total: 0 }
  );
}

/* ─── Mock history ─── */

function mockAttempt(
  id: string,
  date: string,
  formats: KCFormat[],
  categories: KCCategory[],
  correctnessPattern: "good" | "mixed" | "poor"
): KCAttempt {
  const questions = generateQuestions(formats, categories);
  const answers: Record<string, KCAnswer> = {};

  questions.forEach((q, i) => {
    const isCorrect =
      correctnessPattern === "good" ? true : correctnessPattern === "poor" ? false : i % 2 === 0;

    if (q.type === "mc") {
      answers[q.id] = {
        type: "mc",
        selectedIndex: isCorrect ? q.correctIndex : (q.correctIndex + 1) % q.options.length,
      };
    } else if (q.type === "matching") {
      const matches: Record<string, string> = {};
      q.pairs.forEach((p, pi) => {
        matches[p.id] = isCorrect ? p.id : q.pairs[(pi + 1) % q.pairs.length].id;
      });
      answers[q.id] = { type: "matching", matches };
    } else if (q.type === "branching") {
      const decisions: Record<string, string> = {};
      q.nodes.filter(n => n.type === "decision").forEach(n => {
        const correctOpt = n.options?.find(o => o.isCorrect);
        const wrongOpt = n.options?.find(o => !o.isCorrect);
        const chosen = isCorrect ? correctOpt : wrongOpt;
        if (chosen && n.id) decisions[n.id] = chosen.id;
      });
      answers[q.id] = { type: "branching", decisions, isCompleted: true };
    }
  });

  const { score, total } = computeKCScore(questions, answers);
  return { id, date, categories, formats, score, total, questions, answers };
}

export const MOCK_ATTEMPTS: KCAttempt[] = [
  mockAttempt("kc-hist-1", "2026-06-28T10:30:00Z", ["mc", "matching"], ["escalations"], "mixed"),
  mockAttempt("kc-hist-2", "2026-06-25T14:15:00Z", ["mc"], ["incidents"], "good"),
  mockAttempt("kc-hist-3", "2026-06-20T09:00:00Z", ["mc", "matching", "branching"], ["escalations", "first-aid"], "poor"),
];

export const CATEGORY_LABELS: Record<KCCategory, string> = {
  escalations: "Escalations",
  "first-aid": "First aid",
  incidents: "Incidents",
  clients: "Clients",
};

export const FORMAT_LABELS: Record<KCFormat, string> = {
  mc: "Multiple choice",
  matching: "Matching",
  branching: "Scenarios",
};
