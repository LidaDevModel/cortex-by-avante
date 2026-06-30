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
        scenarioText:
          "You notice an unattended bag near the main entrance. There are no visible markings and no one claims ownership. It has been there for approximately 10 minutes. What do you do?",
        options: [
          {
            id: "n1a",
            text: "Open the bag to identify the contents",
            nextNodeId: "n2",
            isOptimal: false,
            explanation:
              "Handling an unattended bag directly is unsafe. The correct action is to maintain distance and notify your supervisor.",
          },
          {
            id: "n1b",
            text: "Establish a safety perimeter and notify your supervisor immediately",
            nextNodeId: "n2",
            isOptimal: true,
            explanation:
              "Correct. Establishing a perimeter and escalating to your supervisor is the standard protocol for unattended items.",
          },
          {
            id: "n1c",
            text: "Wait another 10 minutes to see if someone collects it",
            nextNodeId: "n2",
            isOptimal: false,
            explanation:
              "Delaying action on a potential Tier 2 incident increases risk. Immediate escalation is required.",
          },
        ],
      },
      {
        id: "n2",
        type: "decision",
        label: "Evacuation order",
        scenarioText:
          "Your supervisor has ordered a partial evacuation of the east wing. A staff member insists they need to retrieve a laptop from their desk before leaving. You have approximately 90 seconds before the zone must be clear. What do you do?",
        options: [
          {
            id: "n2a",
            text: "Allow them to retrieve the laptop quickly since there is still time",
            nextNodeId: "n3",
            isOptimal: false,
            explanation:
              "Allowing re-entry during an active evacuation order violates safety protocol regardless of time remaining.",
          },
          {
            id: "n2b",
            text: "Direct them to evacuate immediately and inform your supervisor of the delay",
            nextNodeId: "n3",
            isOptimal: true,
            explanation:
              "Correct. Personal items are never a valid reason to delay evacuation. Reporting the interaction is also protocol.",
          },
          {
            id: "n2c",
            text: "Retrieve the laptop yourself to resolve the situation quickly",
            nextNodeId: "n3",
            isOptimal: false,
            explanation:
              "Guards must not re-enter evacuation zones. Your own safety and the timeline of evacuation take precedence.",
          },
        ],
      },
      {
        id: "n3",
        type: "decision",
        label: "Post-incident",
        scenarioText:
          "The incident has been resolved. Your shift ends in 30 minutes. You have not yet completed the incident report. What is your next action?",
        options: [
          {
            id: "n3a",
            text: "Complete the incident report before your shift ends",
            nextNodeId: "n4",
            isOptimal: true,
            explanation:
              "Correct. Incident reports must be completed within the same shift where possible and within 4 hours of the incident.",
          },
          {
            id: "n3b",
            text: "Hand over verbally to the incoming guard and submit the report tomorrow",
            nextNodeId: "n4",
            isOptimal: false,
            explanation:
              "Verbal handovers do not satisfy the documentation requirement. A written report is mandatory within 4 hours.",
          },
          {
            id: "n3c",
            text: "Ask your supervisor if the report can be skipped given the minor nature of the incident",
            nextNodeId: "n4",
            isOptimal: false,
            explanation:
              "All incidents, regardless of severity, require a formal written report. This is non-negotiable under Avante protocol.",
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
