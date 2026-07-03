export type LibraryDoc = {
  id: string;
  name: string;
  kind: "document" | "folder";
  content: string;
  lastModified: string;
};

export type LibraryFolder = {
  id: string;
  name: string;
  lastModified: string;
  documents: LibraryDoc[];
};

export const FOLDERS: LibraryFolder[] = [
  {
    id: "2",
    name: "Guard Duty",
    lastModified: "2026-06-25",
    documents: [
      { id: "gd-1", name: "Post Orders",               kind: "document", content: "8 pages",  lastModified: "2026-06-25" },
      { id: "gd-2", name: "Patrol Schedule Template",  kind: "document", content: "3 pages",  lastModified: "2026-06-20" },
    ],
  },
  {
    id: "4",
    name: "Access Control",
    lastModified: "2026-06-18",
    documents: [
      { id: "ac-1", name: "Door Access Policy",        kind: "document", content: "11 pages", lastModified: "2026-06-18" },
      { id: "ac-2", name: "Visitor Badge Procedures",  kind: "document", content: "5 pages",  lastModified: "2026-06-12" },
      { id: "ac-3", name: "Key Management Log",        kind: "document", content: "4 pages",  lastModified: "2026-06-08" },
      { id: "ac-4", name: "CCTV Access Rights",        kind: "document", content: "7 pages",  lastModified: "2026-05-30" },
      { id: "ac-5", name: "Contractor Access Form",    kind: "document", content: "2 pages",  lastModified: "2026-05-20" },
      { id: "ac-6", name: "After-Hours Protocol",      kind: "document", content: "6 pages",  lastModified: "2026-05-10" },
      { id: "ac-7", name: "Emergency Override Guide",  kind: "document", content: "9 pages",  lastModified: "2026-04-28" },
    ],
  },
  {
    id: "8",
    name: "Escalation Procedures",
    lastModified: "2026-06-05",
    documents: [
      { id: "ep-1", name: "Tier 1 Response Guide",     kind: "document", content: "6 pages",  lastModified: "2026-06-05" },
      { id: "ep-2", name: "Tier 2 Supervisor Brief",   kind: "document", content: "8 pages",  lastModified: "2026-05-28" },
      { id: "ep-3", name: "Tier 3 Emergency Protocol", kind: "document", content: "12 pages", lastModified: "2026-05-15" },
      { id: "ep-4", name: "Incident Escalation Form",  kind: "document", content: "3 pages",  lastModified: "2026-05-01" },
    ],
  },
  {
    id: "10",
    name: "Onboarding Pack",
    lastModified: "2026-05-22",
    documents: [
      { id: "op-1", name: "Welcome Guide",             kind: "document", content: "10 pages", lastModified: "2026-05-22" },
      { id: "op-2", name: "Code of Conduct",           kind: "document", content: "7 pages",  lastModified: "2026-05-18" },
      { id: "op-3", name: "Uniform Policy",            kind: "document", content: "4 pages",  lastModified: "2026-05-14" },
      { id: "op-4", name: "Payroll & Leave Info",      kind: "document", content: "5 pages",  lastModified: "2026-05-10" },
      { id: "op-5", name: "Site Induction Checklist",  kind: "document", content: "3 pages",  lastModified: "2026-05-05" },
      { id: "op-6", name: "IT & Equipment Setup",      kind: "document", content: "6 pages",  lastModified: "2026-04-28" },
      { id: "op-7", name: "Emergency Contacts",        kind: "document", content: "2 pages",  lastModified: "2026-04-20" },
      { id: "op-8", name: "Probation Review Form",     kind: "document", content: "4 pages",  lastModified: "2026-04-12" },
      { id: "op-9", name: "Training Pathway",          kind: "document", content: "8 pages",  lastModified: "2026-04-01" },
    ],
  },
  {
    id: "12",
    name: "Site Briefings",
    lastModified: "2026-05-10",
    documents: [
      { id: "sb-1", name: "City Centre Site Brief",    kind: "document", content: "9 pages",  lastModified: "2026-05-10" },
      { id: "sb-2", name: "Airport Terminal Brief",    kind: "document", content: "11 pages", lastModified: "2026-05-02" },
      { id: "sb-3", name: "Warehouse Complex Brief",   kind: "document", content: "8 pages",  lastModified: "2026-04-20" },
      { id: "sb-4", name: "Hospital Campus Brief",     kind: "document", content: "13 pages", lastModified: "2026-04-10" },
      { id: "sb-5", name: "Retail Centre Brief",       kind: "document", content: "7 pages",  lastModified: "2026-03-28" },
      { id: "sb-6", name: "Corporate HQ Brief",        kind: "document", content: "10 pages", lastModified: "2026-03-15" },
    ],
  },
  {
    id: "14",
    name: "Visitor Management",
    lastModified: "2026-04-28",
    documents: [
      { id: "vm-1", name: "Visitor Sign-In Form",      kind: "document", content: "2 pages",  lastModified: "2026-04-28" },
      { id: "vm-2", name: "Escort Policy",             kind: "document", content: "5 pages",  lastModified: "2026-04-15" },
      { id: "vm-3", name: "Restricted Areas Map",      kind: "document", content: "4 pages",  lastModified: "2026-04-05" },
    ],
  },
  {
    id: "17",
    name: "Radio Communications",
    lastModified: "2026-04-10",
    documents: [
      { id: "rc-1", name: "Radio Codes Reference",     kind: "document", content: "6 pages",  lastModified: "2026-04-10" },
      { id: "rc-2", name: "Channel Assignments",       kind: "document", content: "3 pages",  lastModified: "2026-04-03" },
      { id: "rc-3", name: "Equipment Care Guide",      kind: "document", content: "8 pages",  lastModified: "2026-03-25" },
      { id: "rc-4", name: "Comms Fault Procedure",     kind: "document", content: "5 pages",  lastModified: "2026-03-15" },
      { id: "rc-5", name: "Handset Sign-Out Log",      kind: "document", content: "2 pages",  lastModified: "2026-03-05" },
    ],
  },
  {
    id: "20",
    name: "Contractor Induction",
    lastModified: "2026-03-20",
    documents: [
      { id: "ci-1", name: "Contractor Safety Brief",    kind: "document", content: "7 pages",  lastModified: "2026-03-20" },
      { id: "ci-2", name: "Site Rules for Contractors", kind: "document", content: "5 pages",  lastModified: "2026-03-12" },
      { id: "ci-3", name: "Work Permit Template",       kind: "document", content: "3 pages",  lastModified: "2026-03-05" },
      { id: "ci-4", name: "Insurance Requirements",     kind: "document", content: "4 pages",  lastModified: "2026-02-25" },
    ],
  },
  {
    id: "22",
    name: "Incident Log Templates",
    lastModified: "2026-03-07",
    documents: [
      { id: "il-1", name: "General Incident Report",   kind: "document", content: "6 pages",  lastModified: "2026-03-07" },
      { id: "il-2", name: "Use of Force Report",       kind: "document", content: "5 pages",  lastModified: "2026-02-28" },
      { id: "il-3", name: "Near-Miss Record",          kind: "document", content: "3 pages",  lastModified: "2026-02-18" },
      { id: "il-4", name: "Property Damage Form",      kind: "document", content: "4 pages",  lastModified: "2026-02-10" },
      { id: "il-5", name: "Medical Incident Log",      kind: "document", content: "5 pages",  lastModified: "2026-02-01" },
      { id: "il-6", name: "Theft & Loss Report",       kind: "document", content: "4 pages",  lastModified: "2026-01-22" },
      { id: "il-7", name: "CCTV Evidence Request",     kind: "document", content: "3 pages",  lastModified: "2026-01-14" },
      { id: "il-8", name: "Witness Statement Form",    kind: "document", content: "2 pages",  lastModified: "2026-01-05" },
    ],
  },
];

export function getFolderById(id: string): LibraryFolder | undefined {
  return FOLDERS.find((f) => f.id === id);
}
