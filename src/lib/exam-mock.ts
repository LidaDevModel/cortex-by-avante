/**
 * Certification pass mark, out of 100. The exam scores four sections that sum
 * to 100 (see the exam page); a total ≥ PASS_MARK passes and records a
 * certification. Single source of truth — exam results, simulation copy, and
 * the certification tier logic in training-mock all read this.
 */
export const PASS_MARK = 85;

export type MCQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
};

export type MatchingPair = {
  id: string;
  term: string;
  definition: string;
};

export type MatchingExercise = {
  instruction: string;
  pairs: MatchingPair[];
};

export type ShortAnswerQuestion = {
  id: string;
  prompt: string;
  rubricHints: string[];
  aiJustification?: string; // populated after scoring
};

export type BranchingNode = {
  id: string;
  type: "start" | "decision" | "end";
  label: string;
  scenarioText?: string;
  options?: BranchingOption[];
  nextId?: string; // for end node or linear path
};

export type BranchingOption = {
  id: string;
  text: string;
  nextNodeId: string;
  isOptimal: boolean;
  explanation: string; // shown in results
};

export type BranchingScenario = {
  title: string;
  nodes: BranchingNode[];
  startNodeId: string;
};

export type ExamObject = {
  moduleId: string;
  moduleName: string;
  timeLimitSeconds: number;
  multipleChoice: MCQuestion[];
  matching: MatchingExercise;
  shortAnswer: ShortAnswerQuestion;
  branching: BranchingScenario;
};

export const MOCK_EXAM: ExamObject = {
  moduleId: "1",
  moduleName: "Escalation Procedures 1",
  timeLimitSeconds: 1800,

  multipleChoice: [
    {
      id: "mc1",
      question:
        "A Tier 3 threat requires immediate escalation. Which of the following best describes a Tier 3 incident?",
      options: [
        "A visitor who forgot their ID badge",
        "A physical altercation in progress on-site",
        "An unattended bag in a low-traffic area",
        "A malfunctioning access card reader",
      ],
      correctIndex: 1,
    },
    {
      id: "mc2",
      question:
        "When escalating an incident to a supervisor, which piece of information should be communicated first?",
      options: [
        "The names of any witnesses present",
        "Your personal assessment of the threat level",
        "The exact location and nature of the incident",
        "The time you first noticed the situation",
      ],
      correctIndex: 2,
    },
    {
      id: "mc3",
      question:
        "During a fire evacuation, a security guard discovers a staff member who refuses to leave their workstation. What is the correct course of action?",
      options: [
        "Leave the staff member and continue evacuating others",
        "Physically remove the staff member immediately",
        "Calmly but firmly direct them to evacuate and report to your supervisor",
        "Wait until the fire alarm stops before taking further action",
      ],
      correctIndex: 2,
    },
    {
      id: "mc4",
      question:
        "Which communication channel should be used for a Tier 2 security incident?",
      options: [
        "Personal mobile phone call to a colleague",
        "Verbal report to the nearest staff member",
        "Designated radio channel with supervisor notification",
        "Written incident report submitted at end of shift",
      ],
      correctIndex: 2,
    },
    {
      id: "mc5",
      question:
        "An incident report must be completed within how many hours of the incident occurring, according to standard Avante Security protocols?",
      options: ["1 hour", "4 hours", "8 hours", "24 hours"],
      correctIndex: 1,
    },
  ],

  matching: {
    instruction: "Match each escalation term to its correct definition.",
    pairs: [
      {
        id: "m1",
        term: "Tier 1 — Monitor",
        definition:
          "Low-risk situation requiring observation only; no immediate action needed.",
      },
      {
        id: "m2",
        term: "Tier 2 — Notify",
        definition:
          "Elevated risk requiring supervisor notification and documented observation.",
      },
      {
        id: "m3",
        term: "Tier 3 — Respond",
        definition:
          "Immediate threat requiring active response and emergency services if necessary.",
      },
      {
        id: "m4",
        term: "Post-incident review",
        definition:
          "Structured debrief conducted within 24 hours to assess response and identify improvements.",
      },
    ],
  },

  shortAnswer: {
    id: "sa1",
    prompt:
      "Describe the correct procedure when you witness a verbal altercation between two individuals on-site that appears to be escalating.",
    rubricHints: [
      "assess and classify the threat tier",
      "maintain a safe distance while monitoring",
      "notify your supervisor via the designated channel",
      "document the incident accurately",
    ],
  },

  branching: {
    title: "Incident response scenario",
    startNodeId: "n0",
    nodes: [
      {
        id: "n0",
        type: "start",
        label: "Start",
        nextId: "n1",
      },
      {
        id: "n1",
        type: "decision",
        label: "Suspicious package",
        nextId: "n2a",
        scenarioText:
          "You notice an unattended bag near the main entrance. There are no visible markings and no one claims ownership. It has been there for approximately 10 minutes. What do you do?",
        options: [
          {
            id: "n1a",
            text: "Establish a safety perimeter and notify your supervisor immediately",
            nextNodeId: "n2a",
            isOptimal: true,
            explanation:
              "Correct. Establishing a perimeter and escalating to your supervisor is the standard protocol for unattended items.",
          },
          {
            id: "n1b",
            text: "Open the bag to identify the contents",
            nextNodeId: "n2b",
            isOptimal: false,
            explanation:
              "Handling an unattended bag directly is unsafe. The correct action is to maintain distance and notify your supervisor.",
          },
        ],
      },
      {
        id: "n2a",
        type: "decision",
        label: "Evacuation order",
        scenarioText:
          "The area has been secured and your supervisor has ordered a partial evacuation of the east wing. A staff member insists they need to retrieve a laptop from their desk before leaving. What do you do?",
        nextId: "n3",
        options: [
          {
            id: "n2a-a",
            text: "Direct them to evacuate immediately and inform your supervisor of the delay",
            nextNodeId: "n3",
            isOptimal: true,
            explanation:
              "Correct. Personal items are never a valid reason to delay evacuation. Reporting the interaction is also protocol.",
          },
          {
            id: "n2a-b",
            text: "Allow them to retrieve the laptop quickly since the zone is not yet critical",
            nextNodeId: "n3",
            isOptimal: false,
            explanation:
              "Allowing re-entry during an active evacuation order violates safety protocol regardless of time remaining.",
          },
        ],
      },
      {
        id: "n2b",
        type: "decision",
        label: "After breach",
        scenarioText:
          "The bag contained personal items. A bystander filmed the incident. Your supervisor arrives and asks for a full account of what happened. What do you do?",
        nextId: "n3",
        options: [
          {
            id: "n2b-a",
            text: "Give a complete and accurate account, including your decision to open the bag",
            nextNodeId: "n3",
            isOptimal: true,
            explanation:
              "Correct. Accurate incident reporting is required regardless of the outcome. Omitting your actions would be a further protocol breach.",
          },
          {
            id: "n2b-b",
            text: "Focus on the outcome — no threat was found — and omit the bag search",
            nextNodeId: "n3",
            isOptimal: false,
            explanation:
              "Omitting material facts from an incident report is a disciplinary matter. The method taken must always be documented.",
          },
        ],
      },
      {
        id: "n3",
        type: "decision",
        label: "Post-incident",
        scenarioText:
          "The incident has been resolved and the zone is clear. Your shift ends in 30 minutes and the incident report has not yet been filed. What do you do?",
        nextId: "n4",
        options: [
          {
            id: "n3-a",
            text: "Complete the incident report before your shift ends while details are fresh",
            nextNodeId: "n4",
            isOptimal: true,
            explanation:
              "Correct. Incident reports must be completed within the same shift where possible and within 4 hours of the incident.",
          },
          {
            id: "n3-b",
            text: "Hand over verbally to the incoming guard and file the report tomorrow",
            nextNodeId: "n4",
            isOptimal: false,
            explanation:
              "Verbal handovers do not satisfy the documentation requirement. A written report is mandatory within 4 hours.",
          },
        ],
      },
      {
        id: "n4",
        type: "end",
        label: "End",
      },
    ],
  },
};
