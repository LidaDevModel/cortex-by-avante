import { PASS_MARK } from "./exam-mock";
import { daysSince } from "./utils";

export type ModuleStatus = "not-started" | "in-progress" | "completed";
export type ModuleCategory = "first-aid" | "escalations" | "clients" | "incidents";

/**
 * A recorded certification for a module. Present only once the module's exam
 * has been passed (score ≥ PASS_MARK, out of 100). `status: "completed"` means
 * the module's chapters are read; a certification is the separate second stage.
 * The two are deliberately independent — a completed-but-uncertified module is
 * the "quickest win" on the readiness board.
 */
export type Certification = {
  score: number; // 0-100, always ≥ PASS_MARK when present
  date: string; // ISO date the certification was issued
};

/** Two-stage requirement state, derived from status + certification. */
export type RequirementState = "not-started" | "in-progress" | "ready-to-certify" | "certified";

/** Binary certification tier — Ace at exactly 100, Certified otherwise. */
export type CertificationTier = "certified" | "ace";

export type Module = {
  id: string;
  title: string;
  chapters: number;
  hours: number;
  progress: number; // 0-100
  status: ModuleStatus;
  required: boolean;
  category: ModuleCategory;
  /** When this module was assigned to the user — powers the recency feed. ISO date. */
  assignedDate: string;
  /** Present once the certification exam has been passed. Absent otherwise. */
  certification?: Certification;
};

export const MODULES: Module[] = [
  { id: "1", title: "Escalation Procedures 1", chapters: 6, hours: 2, progress: 33, status: "in-progress", required: true, category: "escalations", assignedDate: "2026-05-12" },
  { id: "2", title: "First Aid Awareness 1", chapters: 6, hours: 2, progress: 90, status: "in-progress", required: false, category: "first-aid", assignedDate: "2026-04-20" },
  { id: "3", title: "Incident Response 1", chapters: 6, hours: 2, progress: 100, status: "completed", required: true, category: "incidents", assignedDate: "2026-05-01", certification: { score: 92, date: "2026-06-22" } },
  { id: "4", title: "Client Protocols 1", chapters: 6, hours: 2, progress: 100, status: "completed", required: true, category: "clients", assignedDate: "2026-04-28" },
  { id: "5", title: "Security Protocols 1", chapters: 6, hours: 2, progress: 0, status: "not-started", required: true, category: "incidents", assignedDate: "2026-07-05" },
  { id: "6", title: "Guard Duty Fundamentals", chapters: 4, hours: 1, progress: 60, status: "in-progress", required: true, category: "clients", assignedDate: "2026-05-18" },
  { id: "7", title: "Emergency Procedures 1", chapters: 5, hours: 2, progress: 0, status: "not-started", required: false, category: "escalations", assignedDate: "2026-06-30" },
  { id: "8", title: "First Aid Awareness 2", chapters: 6, hours: 2, progress: 100, status: "completed", required: true, category: "first-aid", assignedDate: "2026-03-15", certification: { score: 100, date: "2026-06-10" } },
  { id: "9", title: "Client Protocols 2", chapters: 4, hours: 1, progress: 100, status: "completed", required: false, category: "clients", assignedDate: "2026-04-10", certification: { score: 88, date: "2026-05-28" } },
  { id: "10", title: "Radio Communications", chapters: 4, hours: 1, progress: 100, status: "completed", required: false, category: "incidents", assignedDate: "2026-03-20", certification: { score: 95, date: "2026-05-20" } },
  { id: "11", title: "Workplace Safety Basics", chapters: 5, hours: 2, progress: 100, status: "completed", required: false, category: "first-aid", assignedDate: "2026-03-05", certification: { score: 100, date: "2026-05-12" } },
];

export function getModuleById(id: string): Module | undefined {
  return MODULES.find((m) => m.id === id);
}

/* ─── Certification & shift-readiness ───
   Readiness gates shift eligibility: a Field Agent is on-shift only once every
   required module for the role is certified. These helpers are the single
   source of truth — the dashboard, honor cards, and exam results all read them
   rather than re-deriving from raw status. */

/** True when the module has a recorded certification. */
export function isCertified(m: Module): boolean {
  return m.certification !== undefined;
}

/** Certification tier, or null when the module isn't certified. Ace = exactly 100. */
export function getTier(m: Module): CertificationTier | null {
  if (!m.certification) return null;
  return m.certification.score === 100 ? "ace" : "certified";
}

/** The two-stage requirement state. Certified wins; a completed-but-uncertified
    module is "ready-to-certify" (the quickest win to close a readiness gap). */
export function getRequirementState(m: Module): RequirementState {
  if (isCertified(m)) return "certified";
  if (m.status === "completed") return "ready-to-certify";
  if (m.status === "in-progress") return "in-progress";
  return "not-started";
}

/** Every required module for the role. */
export function getRequiredModules(): Module[] {
  return MODULES.filter((m) => m.required);
}

/** Every module with a certification — required or optional — most recent first.
    Powers the certifications shelf, which shows all earned certs regardless of
    whether the module counts toward shift readiness. */
export function getCertifiedModules(): Module[] {
  return MODULES.filter(isCertified).sort((a, b) =>
    b.certification!.date.localeCompare(a.certification!.date)
  );
}

/** True when every required module is certified — i.e. the agent is cleared for shift. */
export function isShiftReady(modules: Module[] = MODULES): boolean {
  return modules.filter((m) => m.required).every(isCertified);
}

/** Estimated minutes left to finish a module's reading, from progress. */
export function getRemainingMinutes(m: Module): number {
  return Math.round(m.hours * 60 * (1 - m.progress / 100));
}

/** Modules assigned within the last `days` days — the module half of the recency feed. */
export function getRecentModules(days = 14): Module[] {
  return MODULES.filter((m) => {
    const d = daysSince(m.assignedDate);
    return d >= 0 && d <= days;
  }).sort((a, b) => daysSince(a.assignedDate) - daysSince(b.assignedDate));
}

/* ─── Module reading content ───
   One canonical chapter set shared by every module for the demo — each module's
   meta (title, progress, category) comes from MODULES above, so the detail
   screen never duplicates it. Replace per-module when real content is authored. */

export type QuizOption = { id: string; text: string };
export type Quiz = { question: string; options: QuizOption[]; correctId: string };
export type Chapter = {
  id: string;
  num: number;
  title: string;
  body: string;
  quiz?: Quiz;
  isFinalQuiz?: boolean;
};

export const MODULE_CHAPTERS: Chapter[] = [
  {
    id: "1",
    num: 1,
    title: "Introduction",
    body: `Effective escalation procedures are the backbone of any professional security operation. When incidents arise, the speed and clarity of your response directly determines how quickly order is restored and how much risk is contained.\n\nThis module provides a comprehensive framework for identifying, classifying, and escalating security events. You will learn to distinguish between situations that require immediate action, those that warrant monitoring, and those that must be passed up the chain of command without delay.\n\nBy the end of this module, you will be able to apply these procedures confidently, communicate clearly with supervisors and emergency services, and document each event in a way that supports accountability and continuous improvement.`,
  },
  {
    id: "2",
    num: 2,
    title: "Identifying Security Threats",
    body: `Threat identification is the first and most critical step in the escalation chain. A missed or misclassified threat can have serious consequences — for the site, for bystanders, and for your team.\n\nThreats are generally classified into three tiers: Tier 1 (low risk, monitor only), Tier 2 (elevated risk, requires supervisor notification), and Tier 3 (immediate risk, requires emergency response). Common indicators include unusual behaviour, unauthorised access attempts, suspicious packages, and verbal or physical altercations.\n\nTrust your training. If something feels wrong, it usually is. Always err on the side of caution and escalate earlier rather than later — you will never be penalised for taking a threat seriously.`,
    quiz: {
      question: "Which of the following is a Tier 3 threat requiring immediate emergency response?",
      options: [
        { id: "a", text: "A visitor waiting in the lobby beyond their appointment time" },
        { id: "b", text: "A physical altercation in progress on-site" },
        { id: "c", text: "An employee badge-in outside of normal working hours" },
        { id: "d", text: "A delivery vehicle parked in a loading bay after hours" },
      ],
      correctId: "b",
    },
  },
  {
    id: "3",
    num: 3,
    title: "Communication Protocols",
    body: `Clear communication is non-negotiable during a security incident. Ambiguous or incomplete information delays response and increases risk. Every communication you make — whether by radio, phone, or written log — must follow a consistent structure.\n\nThe SMEAC format (Situation, Mission, Execution, Administration, Command) is the standard for verbal briefings. For radio communications, use the NATO phonetic alphabet where clarity is essential, and always confirm receipt before ending a transmission.\n\nWhen communicating with emergency services, lead with location and nature of incident, then casualties or ongoing threats, then site access information. Keep it brief. Dispatchers are trained to ask follow-up questions — do not overwhelm them with detail upfront.`,
    quiz: {
      question: "What does the 'S' in the SMEAC communication format stand for?",
      options: [
        { id: "a", text: "Safety" },
        { id: "b", text: "Situation" },
        { id: "c", text: "Summary" },
        { id: "d", text: "Suspect" },
      ],
      correctId: "b",
    },
  },
  {
    id: "4",
    num: 4,
    title: "Escalation Pathways",
    body: `Every site has a defined escalation pathway — a chain of contacts and decision points that determines who is notified, in what order, and by what method. Knowing your site's pathway before an incident occurs is essential.\n\nTypically, escalation flows from the responding guard to the shift supervisor, from supervisor to the site manager or duty manager, and from there to client representatives and emergency services as required. Some clients require notification at every tier; others only at Tier 2 and above.\n\nYour site briefing document contains the specific escalation pathway for your assignment. Review it at the start of every shift. If you are unsure who to contact, your shift supervisor is always the correct first point of escalation.`,
    quiz: {
      question: "If you are unsure who to contact during an incident, who should your first escalation point always be?",
      options: [
        { id: "a", text: "The client representative" },
        { id: "b", text: "Emergency services directly" },
        { id: "c", text: "Your shift supervisor" },
        { id: "d", text: "The duty manager" },
      ],
      correctId: "c",
    },
  },
  {
    id: "5",
    num: 5,
    title: "Documentation Requirements",
    body: `Accurate documentation is not just a procedural obligation — it is a critical tool for accountability, legal protection, and operational improvement. Every incident, no matter how minor, must be recorded.\n\nAn incident report must capture: the date, time, and location; a factual description of events in chronological order; the names or descriptions of individuals involved; actions taken by security personnel; and any injuries, property damage, or losses.\n\nUse plain, factual language. Avoid opinions, assumptions, or emotional language. Write what you observed, not what you inferred. A well-written incident report can be used in legal proceedings — accuracy and objectivity are paramount.`,
    quiz: {
      question: "What is the correct language standard for writing an incident report?",
      options: [
        { id: "a", text: "Descriptive and expressive, to capture the full atmosphere of the incident" },
        { id: "b", text: "Plain and factual, recording only what was directly observed" },
        { id: "c", text: "Brief and informal, to save time during busy shifts" },
        { id: "d", text: "Technical and detailed, including your assessment of intent" },
      ],
      correctId: "b",
    },
  },
  {
    id: "6",
    num: 6,
    title: "Post-Incident Review",
    body: `Every significant incident should be followed by a structured review. The purpose of a post-incident review is not to assign blame — it is to identify what worked, what did not, and what changes would improve outcomes in future.\n\nReviews are typically conducted by the shift supervisor within 24 hours of the incident. They involve the responding personnel, relevant witnesses, and in some cases a client representative. The output is an action log with specific, time-bound improvements.\n\nParticipating constructively in post-incident reviews is part of your professional responsibility. Honest reflection on your own performance, including things you would do differently, demonstrates the kind of professional maturity Avante expects from every team member.`,
    quiz: {
      question: "What is the primary purpose of a post-incident review?",
      options: [
        { id: "a", text: "To assign blame for failures in the response" },
        { id: "b", text: "To identify improvements and update procedures" },
        { id: "c", text: "To satisfy insurance documentation requirements" },
        { id: "d", text: "To determine if disciplinary action is required" },
      ],
      correctId: "b",
    },
  },
  {
    id: "final",
    num: 7,
    title: "Final Quiz",
    body: "",
    isFinalQuiz: true,
  },
];
