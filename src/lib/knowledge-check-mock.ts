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

/** Which dashboard/start preset produced an attempt, when it came from one. */
export type KCPreset = "daily5" | "weak" | "examSim" | "custom";

export type KCAttempt = {
  id: string;
  date: string;
  categories: KCCategory[];
  formats: KCFormat[];
  score: number;
  total: number;
  questions: KCQuestion[];
  answers: Record<string, KCAnswer>;
  /** The preset that launched this attempt, if any — lets the dashboard show
      "Daily 5 done today" without fingerprinting question counts. */
  preset?: KCPreset;
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
        id: "b1-d1", type: "decision", label: "Access check", nextId: "b1-d2a",
        scenarioText: "You observe an individual in the restricted server room not wearing a site ID badge. They claim to be from IT. What do you do?",
        options: [
          { id: "b1-d1-a", text: "Request photo ID and verify with the control room before letting them remain.", nextNodeId: "b1-d2a", isCorrect: true, isOptimal: true, explanation: "" },
          { id: "b1-d1-b", text: "Accept their explanation and allow them to continue.", nextNodeId: "b1-d2b", isCorrect: false, isOptimal: false, explanation: "" },
        ],
      },
      {
        id: "b1-d2a", type: "decision", label: "Verification",
        scenarioText: "Control room confirms the individual is not on the approved visitor list. They insist their manager approved the visit verbally. What do you do next?",
        nextId: "b1-d3",
        options: [
          { id: "b1-d2a-a", text: "Escort them to a waiting area while you contact their named manager to confirm.", nextNodeId: "b1-d3", isCorrect: true, isOptimal: true, explanation: "" },
          { id: "b1-d2a-b", text: "Remove them immediately without attempting to verify the manager's claim.", nextNodeId: "b1-d3", isCorrect: false, isOptimal: false, explanation: "" },
        ],
      },
      {
        id: "b1-d2b", type: "decision", label: "Recovery",
        scenarioText: "The individual accesses a restricted system before you can intervene. Your supervisor asks how they were admitted without verification. How do you respond?",
        nextId: "b1-d3",
        options: [
          { id: "b1-d2b-a", text: "Give a full and accurate account and commit to following ID protocol going forward.", nextNodeId: "b1-d3", isCorrect: true, isOptimal: true, explanation: "" },
          { id: "b1-d2b-b", text: "Explain that the person seemed credible and the situation resolved itself.", nextNodeId: "b1-d3", isCorrect: false, isOptimal: false, explanation: "" },
        ],
      },
      {
        id: "b1-d3", type: "decision", label: "Documentation",
        scenarioText: "The manager confirms the visit was legitimate but unregistered. Your shift ends in 20 minutes. What is your final action before leaving?",
        nextId: "b1-end",
        options: [
          { id: "b1-d3-a", text: "File a written incident report and ask the manager to complete the visitor registration retroactively.", nextNodeId: "b1-end", isCorrect: true, isOptimal: true, explanation: "" },
          { id: "b1-d3-b", text: "Leave a verbal note with your relief — the manager confirmed verbally and no harm occurred.", nextNodeId: "b1-end", isCorrect: false, isOptimal: false, explanation: "" },
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
        id: "b2-d1", type: "decision", label: "First response", nextId: "b2-d2a",
        scenarioText: "During a routine patrol you find a staff member slumped at their desk and unresponsive. A colleague says they saw the person fall asleep earlier. What do you do?",
        options: [
          { id: "b2-d1-a", text: "Attempt to rouse them, and if unresponsive, call emergency services immediately.", nextNodeId: "b2-d2a", isCorrect: true, isOptimal: true, explanation: "" },
          { id: "b2-d1-b", text: "Leave them to sleep and check again in 30 minutes.", nextNodeId: "b2-d2b", isCorrect: false, isOptimal: false, explanation: "" },
        ],
      },
      {
        id: "b2-d2a", type: "decision", label: "While waiting",
        scenarioText: "Emergency services are on the way. The person is breathing but unconscious. Another staff member offers to help. What do you instruct them to do?",
        nextId: "b2-d3",
        options: [
          { id: "b2-d2a-a", text: "Keep bystanders back and clear a path to the entrance for paramedics.", nextNodeId: "b2-d3", isCorrect: true, isOptimal: true, explanation: "" },
          { id: "b2-d2a-b", text: "Ask them to move the person to a more comfortable position.", nextNodeId: "b2-d3", isCorrect: false, isOptimal: false, explanation: "" },
        ],
      },
      {
        id: "b2-d2b", type: "decision", label: "Escalation",
        scenarioText: "When you return 30 minutes later the person is now on the floor. A colleague has called emergency services. Your supervisor asks why you did not act immediately. What do you say?",
        nextId: "b2-d3",
        options: [
          { id: "b2-d2b-a", text: "Acknowledge that waiting was the wrong call and that you should have assessed and escalated immediately.", nextNodeId: "b2-d3", isCorrect: true, isOptimal: true, explanation: "" },
          { id: "b2-d2b-b", text: "Explain that you assessed the situation and judged there was no immediate risk at the time.", nextNodeId: "b2-d3", isCorrect: false, isOptimal: false, explanation: "" },
        ],
      },
      {
        id: "b2-d3", type: "decision", label: "Documentation",
        scenarioText: "Paramedics have taken over. Your supervisor asks you to document the incident. When should you complete the report?",
        nextId: "b2-end",
        options: [
          { id: "b2-d3-a", text: "Before the end of your shift, while details are fresh.", nextNodeId: "b2-end", isCorrect: true, isOptimal: true, explanation: "" },
          { id: "b2-d3-b", text: "The next business day, once you have had time to recover from the incident.", nextNodeId: "b2-end", isCorrect: false, isOptimal: false, explanation: "" },
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
        id: "b3-d1", type: "decision", label: "Breach report", nextId: "b3-d2a",
        scenarioText: "A colleague reports a minor access breach verbally at shift end. Your relief has arrived. What do you do first?",
        options: [
          { id: "b3-d1-a", text: "Complete a written incident report before leaving, then brief your relief fully.", nextNodeId: "b3-d2a", isCorrect: true, isOptimal: true, explanation: "" },
          { id: "b3-d1-b", text: "Leave the verbal report with your relief and head home.", nextNodeId: "b3-d2b", isCorrect: false, isOptimal: false, explanation: "" },
        ],
      },
      {
        id: "b3-d2a", type: "decision", label: "Evidence",
        scenarioText: "While documenting, you notice CCTV footage covering the breach period is due to be overwritten in two hours. What is the correct action?",
        nextId: "b3-d3",
        options: [
          { id: "b3-d2a-a", text: "Inform your supervisor and request the footage be preserved before you leave.", nextNodeId: "b3-d3", isCorrect: true, isOptimal: true, explanation: "" },
          { id: "b3-d2a-b", text: "Note the timestamp in your report and trust that the system retains footage automatically.", nextNodeId: "b3-d3", isCorrect: false, isOptimal: false, explanation: "" },
        ],
      },
      {
        id: "b3-d2b", type: "decision", label: "Escalation",
        scenarioText: "The next shift discovers the breach was not documented and escalates to management. Your supervisor asks why no report was filed. What do you say?",
        nextId: "b3-d3",
        options: [
          { id: "b3-d2b-a", text: "Acknowledge the error and commit to completing all required documentation before leaving in future.", nextNodeId: "b3-d3", isCorrect: true, isOptimal: true, explanation: "" },
          { id: "b3-d2b-b", text: "Explain that the breach was minor and a verbal handover should have been sufficient.", nextNodeId: "b3-d3", isCorrect: false, isOptimal: false, explanation: "" },
        ],
      },
      {
        id: "b3-d3", type: "decision", label: "Involvement",
        scenarioText: "The investigation reveals the breach may involve a senior staff member. You are asked whether you want to add a formal statement. What do you do?",
        nextId: "b3-end",
        options: [
          { id: "b3-d3-a", text: "Provide a full written statement with an accurate account of what was reported to you.", nextNodeId: "b3-end", isCorrect: true, isOptimal: true, explanation: "" },
          { id: "b3-d3-b", text: "Decline — you only have second-hand information and do not want to implicate anyone unfairly.", nextNodeId: "b3-end", isCorrect: false, isOptimal: false, explanation: "" },
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
    const visitedNodes = question.nodes.filter(n => n.type === "decision" && answer.decisions[n.id]);
    const correct = visitedNodes.filter(n => {
      const chosenId = answer.decisions[n.id];
      return n.options?.find(o => o.id === chosenId)?.isCorrect ?? false;
    }).length;
    return { correct, total: visitedNodes.length };
  }
  return { correct: 0, total: questionTotal(question) };
}

function questionTotal(question: KCQuestion): number {
  if (question.type === "matching") return question.pairs.length;
  if (question.type === "branching") return 3; // 3 visited decisions per scenario (path length is always 3)
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
      // Walk the actual path so only visited nodes get a decision recorded
      const startNode = q.nodes.find(n => n.id === q.startNodeId);
      let currentId = startNode?.nextId ?? q.startNodeId;
      while (currentId) {
        const node = q.nodes.find(n => n.id === currentId);
        if (!node || node.type === "end") break;
        if (node.type === "decision") {
          const correctOpt = node.options?.find(o => o.isCorrect);
          const wrongOpt = node.options?.find(o => !o.isCorrect);
          const chosen = isCorrect ? correctOpt : wrongOpt;
          if (!chosen) break;
          decisions[node.id] = chosen.id;
          currentId = chosen.nextNodeId;
        } else {
          currentId = node.nextId ?? "";
        }
      }
      answers[q.id] = { type: "branching", decisions, isCompleted: true };
    }
  });

  const { score, total } = computeKCScore(questions, answers);
  return { id, date, categories, formats, score, total, questions, answers };
}

export const MOCK_ATTEMPTS: KCAttempt[] = [
  mockAttempt("kc-hist-1",  "2026-06-28T10:30:00Z", ["mc", "matching"],            ["escalations"],                              "mixed"),
  mockAttempt("kc-hist-2",  "2026-06-25T14:15:00Z", ["mc"],                        ["incidents"],                                "good"),
  mockAttempt("kc-hist-3",  "2026-06-20T09:00:00Z", ["mc", "matching", "branching"],["escalations", "first-aid"],               "poor"),
  mockAttempt("kc-hist-4",  "2026-06-15T11:00:00Z", ["mc"],                        ["clients"],                                  "good"),
  mockAttempt("kc-hist-5",  "2026-06-10T08:45:00Z", ["mc", "branching"],           ["escalations"],                             "poor"),
  mockAttempt("kc-hist-6",  "2026-06-05T16:20:00Z", ["matching"],                  ["first-aid", "incidents"],                  "mixed"),
  mockAttempt("kc-hist-7",  "2026-05-30T13:00:00Z", ["mc", "matching", "branching"],["escalations", "incidents", "clients", "first-aid"], "good"),
  mockAttempt("kc-hist-8",  "2026-05-22T09:30:00Z", ["mc"],                        ["escalations"],                             "mixed"),
  mockAttempt("kc-hist-9",  "2026-05-18T11:45:00Z", ["mc", "matching"],            ["clients", "incidents"],                    "good"),
  mockAttempt("kc-hist-10", "2026-05-12T08:00:00Z", ["branching"],                 ["first-aid"],                               "mixed"),
  mockAttempt("kc-hist-11", "2026-05-07T15:30:00Z", ["mc"],                        ["incidents"],                               "poor"),
  mockAttempt("kc-hist-12", "2026-04-30T10:00:00Z", ["mc", "matching"],            ["escalations"],                             "good"),
  mockAttempt("kc-hist-13", "2026-04-24T14:00:00Z", ["mc", "branching"],           ["clients"],                                 "mixed"),
  mockAttempt("kc-hist-14", "2026-04-18T09:15:00Z", ["matching", "branching"],     ["first-aid", "escalations"],               "poor"),
  mockAttempt("kc-hist-15", "2026-04-10T13:30:00Z", ["mc"],                        ["escalations", "incidents", "clients", "first-aid"], "good"),
  mockAttempt("kc-hist-16", "2026-04-03T11:00:00Z", ["mc", "matching"],            ["incidents"],                               "mixed"),
  mockAttempt("kc-hist-17", "2026-03-27T16:45:00Z", ["mc"],                        ["clients"],                                 "poor"),
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
