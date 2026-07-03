export type SubSection = {
  id: string;
  title: string;
  body: string;
  paragraphs?: string[];
  points?: string[];
  note?: string;
};

export type PageContent = {
  paragraphs?: string[];
  points?: string[];
  note?: string;
};

export type TocSection = {
  id: string;
  num: string;
  title: string;
  page: number;
  body: string;
  paragraphs?: string[];
  points?: string[];
  note?: string;
  subsections?: SubSection[];
  continuationPages?: PageContent[];
};

export type LibraryDoc = {
  id: string;
  name: string;
  kind: "document" | "folder";
  content: string;
  lastModified: string;
  toc?: TocSection[];
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
      {
        id: "gd-1",
        name: "Post Orders",
        kind: "document",
        content: "8 pages",
        lastModified: "2026-06-25",
        toc: [
          {
            id: "s1", num: "1", title: "Scope and Purpose", page: 1,
            body: "Post orders define the specific duties, responsibilities, and authority of security personnel assigned to a site. Every officer must read and sign these orders before beginning their first shift. The orders are site-specific and supersede general company procedures where they differ.",
            paragraphs: [
              "These orders apply exclusively to the Guard Duty site and take effect from the date of issue. They remain in force until formally revised by Avante Security management or the client representative.",
              "Officers assigned to this site are required to familiarise themselves with the full contents of this document and confirm their understanding by signing the acknowledgement form held at the control room.",
            ],
            note: "Any conflict between these orders and verbal instructions from a client representative must be reported to your shift supervisor immediately. Do not act on verbal instructions that contradict this document without written authorisation.",
          },
          {
            id: "s2", num: "2", title: "Access Control Procedures", page: 2,
            body: "All persons entering the site must present valid identification at the gatehouse. Contractors must be pre-approved by site management and hold a current contractor access pass. Visitors are to be escorted at all times and must sign the visitor log on arrival and departure.",
            paragraphs: [
              "Accepted forms of identification include: government-issued photo ID, company employee badge, or a pre-authorised visitor confirmation email displayed on a mobile device. Expired or unclear identification must be rejected.",
              "Vehicles accessing the secure compound must be searched in accordance with the vehicle search procedure. Officers must log the registration number, driver name, and purpose of entry for every vehicle.",
            ],
            points: [
              "Challenge every unescorted person in a restricted zone, regardless of apparent authority.",
              "Do not allow tailgating through any controlled access point.",
              "Contractors must surrender their access pass on departure.",
              "Report any refused-entry incidents to the shift supervisor within 15 minutes.",
            ],
            subsections: [
              {
                id: "s2a",
                title: "Gatehouse Procedures",
                body: "The gatehouse is the primary control point for all personnel and vehicle access. Officers stationed at the gatehouse must remain alert throughout their post and must not leave the gatehouse unattended at any time.",
                points: [
                  "Log every arrival and departure in the site access register.",
                  "Issue visitor passes only after verifying pre-authorisation with the site contact.",
                  "Retain a photocopy or photograph of visitor ID where the client requires it.",
                  "Raise the barrier only after the vehicle has been cleared for entry.",
                ],
              },
              {
                id: "s2b",
                title: "Vehicle Search Protocol",
                body: "Vehicle searches are conducted on a random basis and whenever an officer has reasonable grounds for suspicion. Searches must be carried out by two officers wherever possible.",
                points: [
                  "Request the driver to open the boot, bonnet, and all passenger compartments.",
                  "Use the under-vehicle mirror to check the underside of all vehicles.",
                  "Do not conduct a search alone when contraband or a security threat is suspected — call for backup.",
                  "Record all searches in the vehicle search log, whether or not contraband is found.",
                ],
                note: "Officers do not have the power to detain a vehicle or driver. If a driver refuses a search, deny entry and notify the shift supervisor immediately.",
              },
            ],
            continuationPages: [
              {
                paragraphs: [
                  "Access rights are reviewed monthly by the site manager. Officers must not grant access based on a name they recognise — all access must be verified against the current authorised access list held at the gatehouse.",
                  "Where an individual's access rights cannot be verified, they must be directed to wait in the designated holding area while the shift supervisor contacts the site manager for confirmation. Officers must not leave an unverified visitor unattended.",
                ],
                points: [
                  "Temporary access requests must be submitted in writing by a department head before the individual arrives.",
                  "Lost or forgotten passes: issue a single-day temporary pass only after verbal authorisation from a site manager.",
                  "Terminated employees: their access rights are revoked immediately on notification from HR. Do not allow entry under any circumstances.",
                  "Contractors working after hours require a separate after-hours access authorisation in addition to their standard pass.",
                ],
                note: "Access control logs are retained for 90 days and may be reviewed by the client's security team at any time. Ensure all entries are legible and timestamped accurately.",
              },
            ],
          },
          {
            id: "s3", num: "3", title: "Patrol Requirements", page: 3,
            body: "Internal patrols are conducted every two hours on the hour. External perimeter patrols are conducted every four hours. Officers must use the electronic patrol wand at each checkpoint and log any anomalies in the patrol report.",
            paragraphs: [
              "Patrol routes must not be altered without written approval from the shift supervisor. Officers are expected to vary their pace and approach within the defined route to avoid predictable patterns.",
              "All patrol checkpoints must be scanned in sequence. A missed or skipped checkpoint must be documented immediately with a reason. Three consecutive missed checkpoints on a single route constitute a reportable deviation.",
            ],
            points: [
              "Check all fire exits, doors, and windows for signs of forced entry.",
              "Report any lighting failures, CCTV blind spots, or obstructions to the patrol route.",
              "Do not use a personal mobile phone while conducting a patrol.",
              "Complete the patrol report before beginning the next patrol cycle.",
            ],
            subsections: [
              {
                id: "s3a",
                title: "Internal Patrol Route",
                body: "The internal patrol covers all occupied floors, stairwells, plant rooms, and common areas. Officers must check each room designated on the patrol map and note any discrepancies — lights left on, doors left unlocked, equipment out of place.",
                points: [
                  "Ground floor: reception, server room corridor, loading bay, plant room.",
                  "First floor: open-plan office, meeting rooms, kitchen area, roof access door.",
                  "Stairwells A and B: check for propped doors or unauthorised items.",
                  "Report any occupied spaces outside of normal working hours.",
                ],
              },
              {
                id: "s3b",
                title: "External Perimeter Patrol",
                body: "The external patrol covers the full site boundary fence, car park, delivery yard, and external plant equipment. Officers must carry a torch during hours of darkness and wear high-visibility gear when crossing vehicle access routes.",
                points: [
                  "Check all fence sections for damage, cutting, or evidence of climbing.",
                  "Inspect the delivery yard gate — confirm locked after last delivery of the day.",
                  "Check the external CCTV cameras for obvious physical damage or repositioning.",
                  "Note any vehicles parked outside normal areas and report if unrecognised.",
                ],
                note: "External patrols during severe weather must be authorised by the shift supervisor. Do not patrol externally in conditions that present a safety risk without explicit sign-off.",
              },
            ],
          },
          {
            id: "s4", num: "4", title: "Emergency Response", page: 4,
            body: "In the event of a fire alarm activation, officers are to follow the site evacuation plan posted at each fire point. The control room must be notified immediately. Officers must direct staff and visitors to the designated assembly areas and prevent re-entry until the all-clear is given.",
            paragraphs: [
              "Officers must not investigate the source of a fire alarm activation unless specifically trained and directed to do so by the shift supervisor. The primary responsibility is safe evacuation and assembly point management.",
              "In the event of a medical emergency, officers should call emergency services (999) before rendering first aid, unless immediate life-threatening risk makes first aid the priority. The shift supervisor must be notified simultaneously.",
            ],
            points: [
              "Fire: activate nearest break-glass point, notify control room, initiate evacuation.",
              "Medical: call 999, notify shift supervisor, apply first aid if trained.",
              "Security breach: lock down affected zone, notify supervisor, do not pursue.",
              "Bomb threat: do not use radios near suspect device, evacuate 100m clear zone.",
            ],
            note: "Assembly point locations are displayed on the site map in the control room and at every fire exit. Officers must confirm their own location to the shift supervisor after any evacuation.",
            continuationPages: [
              {
                paragraphs: [
                  "Officers must not re-enter a building after evacuation unless directed to do so by a senior fire officer from the attending fire service. This applies even when the officer believes the alarm to be a false activation.",
                  "Following any emergency evacuation, a post-incident review must be completed by the shift supervisor within 24 hours. The review must document response times, any issues encountered, and corrective actions identified.",
                ],
                points: [
                  "Assembly point A (main car park): responsible officer — post 1.",
                  "Assembly point B (rear delivery yard): responsible officer — post 2.",
                  "Roll call must be completed within 5 minutes of the alarm activation.",
                  "Missing persons must be reported to the incident commander immediately — do not delay to search independently.",
                  "Vulnerable persons (mobility impaired, temporary pass holders): check the refuge points on floors 1 and 2.",
                ],
                note: "A full evacuation drill is conducted every six months. Officers must treat drills with the same urgency as live events. Non-compliance during a drill is treated as non-compliance during a live emergency.",
              },
            ],
          },
          {
            id: "s5", num: "5", title: "Communication Protocols", page: 5,
            body: "Radio communications must follow the site communication plan. All officers are to maintain radio contact throughout their shift. Channel 1 is the primary operations channel. Channel 2 is reserved for emergencies only.",
            paragraphs: [
              "Officers must complete a radio check at the start of every shift. Any radio found to be faulty must be reported immediately and a replacement obtained before the officer commences duties. Shifts cannot begin without a functioning radio.",
              "All radio transmissions must be clear, concise, and professional. Personal conversations on operational channels are prohibited. Officers should use phonetic alphabet where clarity is essential.",
            ],
            points: [
              "Check-in intervals: every 30 minutes on foot patrol, every 60 minutes at static posts.",
              "Missed check-in: supervisor must attempt contact within 5 minutes. If no response, escalate to Tier 2.",
              "Channel 2 activation: state your name, location, and nature of emergency.",
              "Do not transmit sensitive information (names, addresses) over open radio channels.",
            ],
          },
          {
            id: "s6", num: "6", title: "Prohibited Items", page: 6,
            body: "The following items are prohibited on site: personal mobile phones in operational areas, food and drink in the control room, personal headphones while on patrol, and any item specifically prohibited by the client. Officers are subject to random searches in line with the site security policy.",
            paragraphs: [
              "The client has designated the following areas as phone-free zones: the server room, the data centre corridor, and the executive floor. Officers working in or patrolling these areas must store their personal devices in the locker room before commencing duties.",
              "Searches of officers are conducted by a senior supervisor of the same gender. Refusal to submit to a search constitutes a breach of site security policy and must be reported to the duty manager immediately.",
            ],
            points: [
              "Prohibited: personal mobile phones in operational areas.",
              "Prohibited: food and drink in the control room and server room.",
              "Prohibited: personal headphones or earphones while on patrol.",
              "Prohibited: recording devices (cameras, voice recorders) unless issued by Avante.",
              "Prohibited: any item listed in the client's site-specific addendum.",
            ],
          },
          {
            id: "s7", num: "7", title: "Reporting Requirements", page: 7,
            body: "All incidents, regardless of severity, must be logged in the incident register within 30 minutes of occurrence. Shift reports are to be completed before handover. Incomplete reports will be returned for correction. Officers are personally responsible for the accuracy of all documentation they sign.",
            paragraphs: [
              "The incident register is located in the control room. A digital copy must also be submitted via the Avante incident reporting portal within two hours of the end of shift. Officers without portal access must submit a paper copy to their shift supervisor.",
              "Witness statements must be obtained at the time of the incident where possible. Statements should be factual, written in plain language, and signed by the witness. Officers must not paraphrase or interpret a witness's account.",
            ],
            points: [
              "Tier 1 incidents (minor): log in register, notify supervisor at end of shift.",
              "Tier 2 incidents (moderate): log immediately, notify supervisor within 15 minutes.",
              "Tier 3 incidents (serious): log immediately, notify supervisor and duty manager, call emergency services if required.",
              "All use-of-force incidents require a separate use-of-force report filed within 1 hour.",
            ],
            note: "Falsifying or omitting information from an incident report is a disciplinary matter and may constitute a criminal offence. If you are uncertain about what to include, contact your shift supervisor before completing the form.",
          },
          {
            id: "s8", num: "8", title: "Handover Procedures", page: 8,
            body: "Shift handover must take place face-to-face. The outgoing officer is responsible for briefing the incoming officer on all outstanding matters, including incidents, access issues, and equipment status. Both officers must sign the handover log.",
            paragraphs: [
              "The outgoing officer must not leave the site until the incoming officer has confirmed they are ready to assume duty. In the event of a late relief, the outgoing officer must notify the shift supervisor and remain on duty until properly relieved.",
              "Equipment checks must be completed as part of every handover. The incoming officer takes personal responsibility for any equipment accepted without a recorded defect. Defects noted at handover are the outgoing officer's responsibility to have reported.",
            ],
            points: [
              "Brief the incoming officer on: all incidents since last handover, outstanding access requests, CCTV or equipment issues, any client instructions received.",
              "Hand over all keys, access cards, and radio equipment in person.",
              "Both officers must sign the handover log before the outgoing officer departs.",
              "A handover that cannot occur in person must be pre-authorised by the duty manager.",
            ],
          },
        ],
      },
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

export function getDocById(id: string): { doc: LibraryDoc; folder: LibraryFolder } | undefined {
  for (const folder of FOLDERS) {
    const doc = folder.documents.find((d) => d.id === id);
    if (doc) return { doc, folder };
  }
  return undefined;
}
