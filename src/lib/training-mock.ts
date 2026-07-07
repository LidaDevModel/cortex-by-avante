export type ModuleStatus = "not-started" | "in-progress" | "completed";
export type ModuleCategory = "first-aid" | "escalations" | "clients" | "incidents";

export type Module = {
  id: string;
  title: string;
  chapters: number;
  hours: number;
  progress: number; // 0-100
  status: ModuleStatus;
  required: boolean;
  category: ModuleCategory;
};

export const MODULES: Module[] = [
  { id: "1", title: "Escalation Procedures 1", chapters: 6, hours: 2, progress: 10, status: "in-progress", required: true, category: "escalations" },
  { id: "2", title: "First Aid Awareness 1", chapters: 6, hours: 2, progress: 90, status: "in-progress", required: false, category: "first-aid" },
  { id: "3", title: "Incident Response 1", chapters: 6, hours: 2, progress: 37, status: "in-progress", required: true, category: "incidents" },
  { id: "4", title: "Client Protocols 1", chapters: 6, hours: 2, progress: 90, status: "in-progress", required: true, category: "clients" },
  { id: "5", title: "Security Protocols 1", chapters: 6, hours: 2, progress: 0, status: "not-started", required: true, category: "incidents" },
  { id: "6", title: "Guard Duty Fundamentals", chapters: 4, hours: 1, progress: 0, status: "not-started", required: true, category: "clients" },
  { id: "7", title: "Emergency Procedures 1", chapters: 5, hours: 2, progress: 0, status: "not-started", required: false, category: "escalations" },
  { id: "8", title: "First Aid Awareness 2", chapters: 6, hours: 2, progress: 100, status: "completed", required: true, category: "first-aid" },
  { id: "9", title: "Client Protocols 2", chapters: 4, hours: 1, progress: 0, status: "not-started", required: false, category: "clients" },
];
