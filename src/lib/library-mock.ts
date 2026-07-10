import { daysSince, isWithinDays } from "./utils";

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
  /** Flagged as newly added/updated for the user's role since they last looked. */
  isNew?: boolean;
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
      {

        id: "gd-2",

        name: "Patrol Schedule Template",

        kind: "document",

        content: "3 pages",

        lastModified: "2026-06-20",
        toc: [
          {
            id: "gd-2-s1", num: "1", title: "Review Schedule", page: 1,
            body: "This section of the Patrol Schedule Template covers review schedule relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. Non-compliance with this section may result in a formal review under the site's disciplinary procedure.",
          },
          {
            id: "gd-2-s2", num: "2", title: "Standard Practice", page: 2,
            body: "This section of the Patrol Schedule Template covers standard practice relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making.",
            points: [
              "Refer unresolved issues to the duty manager without delay.",
              "Confirm the relevant checklist has been completed before sign-off.",
              "Notify the shift supervisor of any deviation from standard practice.",
              "Record the time, location, and personnel involved for every action taken.",
            ],
          },
          {
            id: "gd-2-s3", num: "3", title: "Overview", page: 3,
            body: "This section of the Patrol Schedule Template covers overview relevant to day-to-day operations. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager. Any queries relating to this section should be directed to the site manager or Avante Security management.",
          },
        ],

      },
    ],
  },
  {
    id: "4",
    name: "Access Control",
    lastModified: "2026-06-18",
    documents: [
      {

        id: "ac-1",

        name: "Door Access Policy",

        kind: "document",

        content: "11 pages",

        lastModified: "2026-06-18",
        toc: [
          {
            id: "ac-1-s1", num: "1", title: "Compliance", page: 1,
            body: "This section of the Door Access Policy covers compliance relevant to day-to-day operations. Non-compliance with this section may result in a formal review under the site's disciplinary procedure. Training on this topic is delivered during induction and refreshed annually thereafter.",
          },
          {
            id: "ac-1-s2", num: "2", title: "Reporting", page: 2,
            body: "This section of the Door Access Policy covers reporting relevant to day-to-day operations. All personnel are expected to be familiar with the contents of this section before commencing duties. Failure to document actions taken under this section may compromise the integrity of the record.",
            points: [
              "Notify the shift supervisor of any deviation from standard practice.",
              "Record the time, location, and personnel involved for every action taken.",
              "Escalate immediately if the situation falls outside your authority to resolve.",
              "Do not proceed without the required approval where one is specified.",
            ],
          },
          {
            id: "ac-1-s3", num: "3", title: "Exceptions and Escalation", page: 3,
            body: "This section of the Door Access Policy covers exceptions and escalation relevant to day-to-day operations. This process supports the wider security objectives of the site and must not be treated as optional. Records relating to this process must be retained for the period specified in the site retention schedule.",
          },
          {
            id: "ac-1-s4", num: "4", title: "Roles and Authority", page: 4,
            body: "This section of the Door Access Policy covers roles and authority relevant to day-to-day operations. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making. All personnel are expected to be familiar with the contents of this section before commencing duties.",
          },
          {
            id: "ac-1-s5", num: "5", title: "Definitions", page: 5,
            body: "This section of the Door Access Policy covers definitions relevant to day-to-day operations. Updates to this section take effect immediately upon publication and supersede previous guidance. Updates to this section take effect immediately upon publication and supersede previous guidance.",
            points: [
              "Do not proceed without the required approval where one is specified.",
              "Retain supporting documentation for the period defined in the retention schedule.",
              "Verify identity before granting access or releasing information.",
              "Report any equipment faults or shortfalls before the end of the shift.",
            ],
            note: "This section may be updated following a client review. Always refer to the latest version held in the control room.",
          },
          {
            id: "ac-1-s6", num: "6", title: "Related Documents", page: 6,
            body: "This section of the Door Access Policy covers related documents relevant to day-to-day operations. Training on this topic is delivered during induction and refreshed annually thereafter. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly.",
          },
          {
            id: "ac-1-s7", num: "7", title: "Record Keeping", page: 7,
            body: "This section of the Door Access Policy covers record keeping relevant to day-to-day operations. Any queries relating to this section should be directed to the site manager or Avante Security management. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager.",
          },
          {
            id: "ac-1-s8", num: "8", title: "Training and Awareness", page: 8,
            body: "This section of the Door Access Policy covers training and awareness relevant to day-to-day operations. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly. Non-compliance with this section may result in a formal review under the site's disciplinary procedure.",
            points: [
              "Report any equipment faults or shortfalls before the end of the shift.",
              "Ensure all entries are legible, accurate, and completed in full.",
              "Refer unresolved issues to the duty manager without delay.",
              "Confirm the relevant checklist has been completed before sign-off.",
            ],
          },
          {
            id: "ac-1-s9", num: "9", title: "Review Schedule", page: 9,
            body: "This section of the Door Access Policy covers review schedule relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making.",
          },
          {
            id: "ac-1-s10", num: "10", title: "Standard Practice", page: 10,
            body: "This section of the Door Access Policy covers standard practice relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. Any queries relating to this section should be directed to the site manager or Avante Security management.",
            note: "Officers who are unsure how to apply this section should seek clarification from their supervisor before acting.",
          },
          {
            id: "ac-1-s11", num: "11", title: "Overview", page: 11,
            body: "This section of the Door Access Policy covers overview relevant to day-to-day operations. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager. Officers must follow each step in order and confirm completion before proceeding to the next stage.",
            points: [
              "Confirm the relevant checklist has been completed before sign-off.",
              "Notify the shift supervisor of any deviation from standard practice.",
              "Record the time, location, and personnel involved for every action taken.",
              "Escalate immediately if the situation falls outside your authority to resolve.",
            ],
          },
        ],

      },
      {

        id: "ac-2",

        name: "Visitor Badge Procedures",

        kind: "document",

        content: "5 pages",

        lastModified: "2026-06-12",
        toc: [
          {
            id: "ac-2-s1", num: "1", title: "Reporting", page: 1,
            body: "This section of the Visitor Badge Procedures covers reporting relevant to day-to-day operations. All personnel are expected to be familiar with the contents of this section before commencing duties. Any queries relating to this section should be directed to the site manager or Avante Security management.",
          },
          {
            id: "ac-2-s2", num: "2", title: "Exceptions and Escalation", page: 2,
            body: "This section of the Visitor Badge Procedures covers exceptions and escalation relevant to day-to-day operations. This process supports the wider security objectives of the site and must not be treated as optional. Officers must follow each step in order and confirm completion before proceeding to the next stage.",
            points: [
              "Record the time, location, and personnel involved for every action taken.",
              "Escalate immediately if the situation falls outside your authority to resolve.",
              "Do not proceed without the required approval where one is specified.",
              "Retain supporting documentation for the period defined in the retention schedule.",
            ],
          },
          {
            id: "ac-2-s3", num: "3", title: "Roles and Authority", page: 3,
            body: "This section of the Visitor Badge Procedures covers roles and authority relevant to day-to-day operations. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making. This requirement applies across all shifts and must be reinforced during team briefings.",
          },
          {
            id: "ac-2-s4", num: "4", title: "Definitions", page: 4,
            body: "This section of the Visitor Badge Procedures covers definitions relevant to day-to-day operations. Updates to this section take effect immediately upon publication and supersede previous guidance. This process supports the wider security objectives of the site and must not be treated as optional.",
          },
          {
            id: "ac-2-s5", num: "5", title: "Related Documents", page: 5,
            body: "This section of the Visitor Badge Procedures covers related documents relevant to day-to-day operations. Training on this topic is delivered during induction and refreshed annually thereafter. Training on this topic is delivered during induction and refreshed annually thereafter.",
            points: [
              "Retain supporting documentation for the period defined in the retention schedule.",
              "Verify identity before granting access or releasing information.",
              "Report any equipment faults or shortfalls before the end of the shift.",
              "Ensure all entries are legible, accurate, and completed in full.",
            ],
            note: "Officers who are unsure how to apply this section should seek clarification from their supervisor before acting.",
          },
        ],

      },
      {

        id: "ac-3",

        name: "Key Management Log",

        kind: "document",

        content: "4 pages",

        lastModified: "2026-06-08",
        toc: [
          {
            id: "ac-3-s1", num: "1", title: "Exceptions and Escalation", page: 1,
            body: "This section of the Key Management Log covers exceptions and escalation relevant to day-to-day operations. This process supports the wider security objectives of the site and must not be treated as optional. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly.",
          },
          {
            id: "ac-3-s2", num: "2", title: "Roles and Authority", page: 2,
            body: "This section of the Key Management Log covers roles and authority relevant to day-to-day operations. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager.",
            points: [
              "Escalate immediately if the situation falls outside your authority to resolve.",
              "Do not proceed without the required approval where one is specified.",
              "Retain supporting documentation for the period defined in the retention schedule.",
              "Verify identity before granting access or releasing information.",
            ],
          },
          {
            id: "ac-3-s3", num: "3", title: "Definitions", page: 3,
            body: "This section of the Key Management Log covers definitions relevant to day-to-day operations. Updates to this section take effect immediately upon publication and supersede previous guidance. Non-compliance with this section may result in a formal review under the site's disciplinary procedure.",
          },
          {
            id: "ac-3-s4", num: "4", title: "Related Documents", page: 4,
            body: "This section of the Key Management Log covers related documents relevant to day-to-day operations. Training on this topic is delivered during induction and refreshed annually thereafter. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making.",
          },
        ],

      },
      {

        id: "ac-4",

        name: "CCTV Access Rights",

        kind: "document",

        content: "7 pages",

        lastModified: "2026-05-30",
        toc: [
          {
            id: "ac-4-s1", num: "1", title: "Roles and Authority", page: 1,
            body: "This section of the CCTV Access Rights covers roles and authority relevant to day-to-day operations. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making. Failure to document actions taken under this section may compromise the integrity of the record.",
          },
          {
            id: "ac-4-s2", num: "2", title: "Definitions", page: 2,
            body: "This section of the CCTV Access Rights covers definitions relevant to day-to-day operations. Updates to this section take effect immediately upon publication and supersede previous guidance. Records relating to this process must be retained for the period specified in the site retention schedule.",
            points: [
              "Do not proceed without the required approval where one is specified.",
              "Retain supporting documentation for the period defined in the retention schedule.",
              "Verify identity before granting access or releasing information.",
              "Report any equipment faults or shortfalls before the end of the shift.",
            ],
          },
          {
            id: "ac-4-s3", num: "3", title: "Related Documents", page: 3,
            body: "This section of the CCTV Access Rights covers related documents relevant to day-to-day operations. Training on this topic is delivered during induction and refreshed annually thereafter. All personnel are expected to be familiar with the contents of this section before commencing duties.",
          },
          {
            id: "ac-4-s4", num: "4", title: "Record Keeping", page: 4,
            body: "This section of the CCTV Access Rights covers record keeping relevant to day-to-day operations. Any queries relating to this section should be directed to the site manager or Avante Security management. Updates to this section take effect immediately upon publication and supersede previous guidance.",
          },
          {
            id: "ac-4-s5", num: "5", title: "Training and Awareness", page: 5,
            body: "This section of the CCTV Access Rights covers training and awareness relevant to day-to-day operations. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly.",
            points: [
              "Report any equipment faults or shortfalls before the end of the shift.",
              "Ensure all entries are legible, accurate, and completed in full.",
              "Refer unresolved issues to the duty manager without delay.",
              "Confirm the relevant checklist has been completed before sign-off.",
            ],
            note: "Any exception to this section must be documented and approved in writing before it is applied.",
          },
          {
            id: "ac-4-s6", num: "6", title: "Review Schedule", page: 6,
            body: "This section of the CCTV Access Rights covers review schedule relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager.",
          },
          {
            id: "ac-4-s7", num: "7", title: "Standard Practice", page: 7,
            body: "This section of the CCTV Access Rights covers standard practice relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. Non-compliance with this section may result in a formal review under the site's disciplinary procedure.",
          },
        ],

      },
      {

        id: "ac-5",

        name: "Contractor Access Form",

        kind: "document",

        content: "2 pages",

        lastModified: "2026-05-20",
        toc: [
          {
            id: "ac-5-s1", num: "1", title: "Definitions", page: 1,
            body: "This section of the Contractor Access Form covers definitions relevant to day-to-day operations. Updates to this section take effect immediately upon publication and supersede previous guidance. Officers must follow each step in order and confirm completion before proceeding to the next stage.",
          },
          {
            id: "ac-5-s2", num: "2", title: "Related Documents", page: 2,
            body: "This section of the Contractor Access Form covers related documents relevant to day-to-day operations. Training on this topic is delivered during induction and refreshed annually thereafter. This requirement applies across all shifts and must be reinforced during team briefings.",
            points: [
              "Retain supporting documentation for the period defined in the retention schedule.",
              "Verify identity before granting access or releasing information.",
              "Report any equipment faults or shortfalls before the end of the shift.",
              "Ensure all entries are legible, accurate, and completed in full.",
            ],
          },
        ],

      },
      {

        id: "ac-6",

        name: "After-Hours Protocol",

        kind: "document",

        content: "6 pages",

        lastModified: "2026-05-10",
        toc: [
          {
            id: "ac-6-s1", num: "1", title: "Related Documents", page: 1,
            body: "This section of the After-Hours Protocol covers related documents relevant to day-to-day operations. Training on this topic is delivered during induction and refreshed annually thereafter. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager.",
          },
          {
            id: "ac-6-s2", num: "2", title: "Record Keeping", page: 2,
            body: "This section of the After-Hours Protocol covers record keeping relevant to day-to-day operations. Any queries relating to this section should be directed to the site manager or Avante Security management. Non-compliance with this section may result in a formal review under the site's disciplinary procedure.",
            points: [
              "Verify identity before granting access or releasing information.",
              "Report any equipment faults or shortfalls before the end of the shift.",
              "Ensure all entries are legible, accurate, and completed in full.",
              "Refer unresolved issues to the duty manager without delay.",
            ],
          },
          {
            id: "ac-6-s3", num: "3", title: "Training and Awareness", page: 3,
            body: "This section of the After-Hours Protocol covers training and awareness relevant to day-to-day operations. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making.",
          },
          {
            id: "ac-6-s4", num: "4", title: "Review Schedule", page: 4,
            body: "This section of the After-Hours Protocol covers review schedule relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. Any queries relating to this section should be directed to the site manager or Avante Security management.",
          },
          {
            id: "ac-6-s5", num: "5", title: "Standard Practice", page: 5,
            body: "This section of the After-Hours Protocol covers standard practice relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. Officers must follow each step in order and confirm completion before proceeding to the next stage.",
            points: [
              "Refer unresolved issues to the duty manager without delay.",
              "Confirm the relevant checklist has been completed before sign-off.",
              "Notify the shift supervisor of any deviation from standard practice.",
              "Record the time, location, and personnel involved for every action taken.",
            ],
            note: "Officers who are unsure how to apply this section should seek clarification from their supervisor before acting.",
          },
          {
            id: "ac-6-s6", num: "6", title: "Overview", page: 6,
            body: "This section of the After-Hours Protocol covers overview relevant to day-to-day operations. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager. This requirement applies across all shifts and must be reinforced during team briefings.",
          },
        ],

      },
      {

        id: "ac-7",

        name: "Emergency Override Guide",

        kind: "document",

        content: "9 pages",

        lastModified: "2026-04-28",
        toc: [
          {
            id: "ac-7-s1", num: "1", title: "Record Keeping", page: 1,
            body: "This section of the Emergency Override Guide covers record keeping relevant to day-to-day operations. Any queries relating to this section should be directed to the site manager or Avante Security management. Records relating to this process must be retained for the period specified in the site retention schedule.",
          },
          {
            id: "ac-7-s2", num: "2", title: "Training and Awareness", page: 2,
            body: "This section of the Emergency Override Guide covers training and awareness relevant to day-to-day operations. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly. All personnel are expected to be familiar with the contents of this section before commencing duties.",
            points: [
              "Report any equipment faults or shortfalls before the end of the shift.",
              "Ensure all entries are legible, accurate, and completed in full.",
              "Refer unresolved issues to the duty manager without delay.",
              "Confirm the relevant checklist has been completed before sign-off.",
            ],
          },
          {
            id: "ac-7-s3", num: "3", title: "Review Schedule", page: 3,
            body: "This section of the Emergency Override Guide covers review schedule relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. Updates to this section take effect immediately upon publication and supersede previous guidance.",
          },
          {
            id: "ac-7-s4", num: "4", title: "Standard Practice", page: 4,
            body: "This section of the Emergency Override Guide covers standard practice relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly.",
          },
          {
            id: "ac-7-s5", num: "5", title: "Overview", page: 5,
            body: "This section of the Emergency Override Guide covers overview relevant to day-to-day operations. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager.",
            points: [
              "Confirm the relevant checklist has been completed before sign-off.",
              "Notify the shift supervisor of any deviation from standard practice.",
              "Record the time, location, and personnel involved for every action taken.",
              "Escalate immediately if the situation falls outside your authority to resolve.",
            ],
            note: "This requirement is subject to periodic audit by Avante Security management. Ensure full compliance at all times.",
          },
          {
            id: "ac-7-s6", num: "6", title: "Scope and Purpose", page: 6,
            body: "This section of the Emergency Override Guide covers scope and purpose relevant to day-to-day operations. Records relating to this process must be retained for the period specified in the site retention schedule. Non-compliance with this section may result in a formal review under the site's disciplinary procedure.",
          },
          {
            id: "ac-7-s7", num: "7", title: "Procedure", page: 7,
            body: "This section of the Emergency Override Guide covers procedure relevant to day-to-day operations. This requirement applies across all shifts and must be reinforced during team briefings. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making.",
          },
          {
            id: "ac-7-s8", num: "8", title: "Responsibilities", page: 8,
            body: "This section of the Emergency Override Guide covers responsibilities relevant to day-to-day operations. Non-compliance with this section may result in a formal review under the site's disciplinary procedure. Any queries relating to this section should be directed to the site manager or Avante Security management.",
            points: [
              "Escalate immediately if the situation falls outside your authority to resolve.",
              "Do not proceed without the required approval where one is specified.",
              "Retain supporting documentation for the period defined in the retention schedule.",
              "Verify identity before granting access or releasing information.",
            ],
          },
          {
            id: "ac-7-s9", num: "9", title: "Requirements", page: 9,
            body: "This section of the Emergency Override Guide covers requirements relevant to day-to-day operations. All personnel are expected to be familiar with the contents of this section before commencing duties. Officers must follow each step in order and confirm completion before proceeding to the next stage.",
          },
        ],

      },
    ],
  },
  {
    id: "8",
    name: "Escalation Procedures",
    lastModified: "2026-06-05",
    documents: [
      {

        id: "ep-1",

        name: "Tier 1 Response Guide",

        kind: "document",

        content: "6 pages",

        lastModified: "2026-06-05",
        toc: [
          {
            id: "ep-1-s1", num: "1", title: "Exceptions and Escalation", page: 1,
            body: "This section of the Tier 1 Response Guide covers exceptions and escalation relevant to day-to-day operations. Updates to this section take effect immediately upon publication and supersede previous guidance. Officers must follow each step in order and confirm completion before proceeding to the next stage.",
          },
          {
            id: "ep-1-s2", num: "2", title: "Roles and Authority", page: 2,
            body: "This section of the Tier 1 Response Guide covers roles and authority relevant to day-to-day operations. Training on this topic is delivered during induction and refreshed annually thereafter. This requirement applies across all shifts and must be reinforced during team briefings.",
            points: [
              "Ensure all entries are legible, accurate, and completed in full.",
              "Refer unresolved issues to the duty manager without delay.",
              "Confirm the relevant checklist has been completed before sign-off.",
              "Notify the shift supervisor of any deviation from standard practice.",
            ],
          },
          {
            id: "ep-1-s3", num: "3", title: "Definitions", page: 3,
            body: "This section of the Tier 1 Response Guide covers definitions relevant to day-to-day operations. Any queries relating to this section should be directed to the site manager or Avante Security management. This process supports the wider security objectives of the site and must not be treated as optional.",
          },
          {
            id: "ep-1-s4", num: "4", title: "Related Documents", page: 4,
            body: "This section of the Tier 1 Response Guide covers related documents relevant to day-to-day operations. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly. Training on this topic is delivered during induction and refreshed annually thereafter.",
          },
          {
            id: "ep-1-s5", num: "5", title: "Record Keeping", page: 5,
            body: "This section of the Tier 1 Response Guide covers record keeping relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. Failure to document actions taken under this section may compromise the integrity of the record.",
            points: [
              "Notify the shift supervisor of any deviation from standard practice.",
              "Record the time, location, and personnel involved for every action taken.",
              "Escalate immediately if the situation falls outside your authority to resolve.",
              "Do not proceed without the required approval where one is specified.",
            ],
            note: "Officers who are unsure how to apply this section should seek clarification from their supervisor before acting.",
          },
          {
            id: "ep-1-s6", num: "6", title: "Training and Awareness", page: 6,
            body: "This section of the Tier 1 Response Guide covers training and awareness relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. Records relating to this process must be retained for the period specified in the site retention schedule.",
          },
        ],

      },
      {

        id: "ep-2",

        name: "Tier 2 Supervisor Brief",

        kind: "document",

        content: "8 pages",

        lastModified: "2026-05-28",
        toc: [
          {
            id: "ep-2-s1", num: "1", title: "Roles and Authority", page: 1,
            body: "This section of the Tier 2 Supervisor Brief covers roles and authority relevant to day-to-day operations. Training on this topic is delivered during induction and refreshed annually thereafter. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager.",
          },
          {
            id: "ep-2-s2", num: "2", title: "Definitions", page: 2,
            body: "This section of the Tier 2 Supervisor Brief covers definitions relevant to day-to-day operations. Any queries relating to this section should be directed to the site manager or Avante Security management. Non-compliance with this section may result in a formal review under the site's disciplinary procedure.",
            points: [
              "Refer unresolved issues to the duty manager without delay.",
              "Confirm the relevant checklist has been completed before sign-off.",
              "Notify the shift supervisor of any deviation from standard practice.",
              "Record the time, location, and personnel involved for every action taken.",
            ],
          },
          {
            id: "ep-2-s3", num: "3", title: "Related Documents", page: 3,
            body: "This section of the Tier 2 Supervisor Brief covers related documents relevant to day-to-day operations. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making.",
          },
          {
            id: "ep-2-s4", num: "4", title: "Record Keeping", page: 4,
            body: "This section of the Tier 2 Supervisor Brief covers record keeping relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. Any queries relating to this section should be directed to the site manager or Avante Security management.",
          },
          {
            id: "ep-2-s5", num: "5", title: "Training and Awareness", page: 5,
            body: "This section of the Tier 2 Supervisor Brief covers training and awareness relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. Officers must follow each step in order and confirm completion before proceeding to the next stage.",
            points: [
              "Record the time, location, and personnel involved for every action taken.",
              "Escalate immediately if the situation falls outside your authority to resolve.",
              "Do not proceed without the required approval where one is specified.",
              "Retain supporting documentation for the period defined in the retention schedule.",
            ],
            note: "This requirement is subject to periodic audit by Avante Security management. Ensure full compliance at all times.",
          },
          {
            id: "ep-2-s6", num: "6", title: "Review Schedule", page: 6,
            body: "This section of the Tier 2 Supervisor Brief covers review schedule relevant to day-to-day operations. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager. This requirement applies across all shifts and must be reinforced during team briefings.",
          },
          {
            id: "ep-2-s7", num: "7", title: "Standard Practice", page: 7,
            body: "This section of the Tier 2 Supervisor Brief covers standard practice relevant to day-to-day operations. Records relating to this process must be retained for the period specified in the site retention schedule. This process supports the wider security objectives of the site and must not be treated as optional.",
          },
          {
            id: "ep-2-s8", num: "8", title: "Overview", page: 8,
            body: "This section of the Tier 2 Supervisor Brief covers overview relevant to day-to-day operations. This requirement applies across all shifts and must be reinforced during team briefings. Training on this topic is delivered during induction and refreshed annually thereafter.",
            points: [
              "Retain supporting documentation for the period defined in the retention schedule.",
              "Verify identity before granting access or releasing information.",
              "Report any equipment faults or shortfalls before the end of the shift.",
              "Ensure all entries are legible, accurate, and completed in full.",
            ],
          },
        ],

      },
      {

        id: "ep-3",

        name: "Tier 3 Emergency Protocol",

        kind: "document",

        content: "12 pages",

        lastModified: "2026-05-15",
        toc: [
          {
            id: "ep-3-s1", num: "1", title: "Definitions", page: 1,
            body: "This section of the Tier 3 Emergency Protocol covers definitions relevant to day-to-day operations. Any queries relating to this section should be directed to the site manager or Avante Security management. Records relating to this process must be retained for the period specified in the site retention schedule.",
          },
          {
            id: "ep-3-s2", num: "2", title: "Related Documents", page: 2,
            body: "This section of the Tier 3 Emergency Protocol covers related documents relevant to day-to-day operations. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly. All personnel are expected to be familiar with the contents of this section before commencing duties.",
            points: [
              "Confirm the relevant checklist has been completed before sign-off.",
              "Notify the shift supervisor of any deviation from standard practice.",
              "Record the time, location, and personnel involved for every action taken.",
              "Escalate immediately if the situation falls outside your authority to resolve.",
            ],
          },
          {
            id: "ep-3-s3", num: "3", title: "Record Keeping", page: 3,
            body: "This section of the Tier 3 Emergency Protocol covers record keeping relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. Updates to this section take effect immediately upon publication and supersede previous guidance.",
          },
          {
            id: "ep-3-s4", num: "4", title: "Training and Awareness", page: 4,
            body: "This section of the Tier 3 Emergency Protocol covers training and awareness relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly.",
          },
          {
            id: "ep-3-s5", num: "5", title: "Review Schedule", page: 5,
            body: "This section of the Tier 3 Emergency Protocol covers review schedule relevant to day-to-day operations. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager.",
            points: [
              "Escalate immediately if the situation falls outside your authority to resolve.",
              "Do not proceed without the required approval where one is specified.",
              "Retain supporting documentation for the period defined in the retention schedule.",
              "Verify identity before granting access or releasing information.",
            ],
            note: "Any exception to this section must be documented and approved in writing before it is applied.",
          },
          {
            id: "ep-3-s6", num: "6", title: "Standard Practice", page: 6,
            body: "This section of the Tier 3 Emergency Protocol covers standard practice relevant to day-to-day operations. Records relating to this process must be retained for the period specified in the site retention schedule. Non-compliance with this section may result in a formal review under the site's disciplinary procedure.",
          },
          {
            id: "ep-3-s7", num: "7", title: "Overview", page: 7,
            body: "This section of the Tier 3 Emergency Protocol covers overview relevant to day-to-day operations. This requirement applies across all shifts and must be reinforced during team briefings. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making.",
          },
          {
            id: "ep-3-s8", num: "8", title: "Scope and Purpose", page: 8,
            body: "This section of the Tier 3 Emergency Protocol covers scope and purpose relevant to day-to-day operations. Non-compliance with this section may result in a formal review under the site's disciplinary procedure. Any queries relating to this section should be directed to the site manager or Avante Security management.",
            points: [
              "Verify identity before granting access or releasing information.",
              "Report any equipment faults or shortfalls before the end of the shift.",
              "Ensure all entries are legible, accurate, and completed in full.",
              "Refer unresolved issues to the duty manager without delay.",
            ],
          },
          {
            id: "ep-3-s9", num: "9", title: "Procedure", page: 9,
            body: "This section of the Tier 3 Emergency Protocol covers procedure relevant to day-to-day operations. All personnel are expected to be familiar with the contents of this section before commencing duties. Officers must follow each step in order and confirm completion before proceeding to the next stage.",
          },
          {
            id: "ep-3-s10", num: "10", title: "Responsibilities", page: 10,
            body: "This section of the Tier 3 Emergency Protocol covers responsibilities relevant to day-to-day operations. This process supports the wider security objectives of the site and must not be treated as optional. This requirement applies across all shifts and must be reinforced during team briefings.",
            note: "This section may be updated following a client review. Always refer to the latest version held in the control room.",
          },
          {
            id: "ep-3-s11", num: "11", title: "Requirements", page: 11,
            body: "This section of the Tier 3 Emergency Protocol covers requirements relevant to day-to-day operations. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making. This process supports the wider security objectives of the site and must not be treated as optional.",
            points: [
              "Refer unresolved issues to the duty manager without delay.",
              "Confirm the relevant checklist has been completed before sign-off.",
              "Notify the shift supervisor of any deviation from standard practice.",
              "Record the time, location, and personnel involved for every action taken.",
            ],
          },
          {
            id: "ep-3-s12", num: "12", title: "Compliance", page: 12,
            body: "This section of the Tier 3 Emergency Protocol covers compliance relevant to day-to-day operations. Updates to this section take effect immediately upon publication and supersede previous guidance. Training on this topic is delivered during induction and refreshed annually thereafter.",
          },
        ],

      },
      {

        id: "ep-4",

        name: "Incident Escalation Form",

        kind: "document",

        content: "3 pages",

        lastModified: "2026-05-01",
        toc: [
          {
            id: "ep-4-s1", num: "1", title: "Related Documents", page: 1,
            body: "This section of the Incident Escalation Form covers related documents relevant to day-to-day operations. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly. This requirement applies across all shifts and must be reinforced during team briefings.",
          },
          {
            id: "ep-4-s2", num: "2", title: "Record Keeping", page: 2,
            body: "This section of the Incident Escalation Form covers record keeping relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. This process supports the wider security objectives of the site and must not be treated as optional.",
            points: [
              "Notify the shift supervisor of any deviation from standard practice.",
              "Record the time, location, and personnel involved for every action taken.",
              "Escalate immediately if the situation falls outside your authority to resolve.",
              "Do not proceed without the required approval where one is specified.",
            ],
          },
          {
            id: "ep-4-s3", num: "3", title: "Training and Awareness", page: 3,
            body: "This section of the Incident Escalation Form covers training and awareness relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. Training on this topic is delivered during induction and refreshed annually thereafter.",
          },
        ],

      },
    ],
  },
  {
    id: "10",
    name: "Onboarding Pack",
    lastModified: "2026-05-22",
    documents: [
      {

        id: "op-1",

        name: "Welcome Guide",

        kind: "document",

        content: "10 pages",

        lastModified: "2026-05-22",
        toc: [
          {
            id: "op-1-s1", num: "1", title: "Procedure", page: 1,
            body: "This section of the Welcome Guide covers procedure relevant to day-to-day operations. All personnel are expected to be familiar with the contents of this section before commencing duties. Any queries relating to this section should be directed to the site manager or Avante Security management.",
          },
          {
            id: "op-1-s2", num: "2", title: "Responsibilities", page: 2,
            body: "This section of the Welcome Guide covers responsibilities relevant to day-to-day operations. This process supports the wider security objectives of the site and must not be treated as optional. Officers must follow each step in order and confirm completion before proceeding to the next stage.",
            points: [
              "Ensure all entries are legible, accurate, and completed in full.",
              "Refer unresolved issues to the duty manager without delay.",
              "Confirm the relevant checklist has been completed before sign-off.",
              "Notify the shift supervisor of any deviation from standard practice.",
            ],
          },
          {
            id: "op-1-s3", num: "3", title: "Requirements", page: 3,
            body: "This section of the Welcome Guide covers requirements relevant to day-to-day operations. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making. This requirement applies across all shifts and must be reinforced during team briefings.",
          },
          {
            id: "op-1-s4", num: "4", title: "Compliance", page: 4,
            body: "This section of the Welcome Guide covers compliance relevant to day-to-day operations. Updates to this section take effect immediately upon publication and supersede previous guidance. This process supports the wider security objectives of the site and must not be treated as optional.",
          },
          {
            id: "op-1-s5", num: "5", title: "Reporting", page: 5,
            body: "This section of the Welcome Guide covers reporting relevant to day-to-day operations. Training on this topic is delivered during induction and refreshed annually thereafter. Training on this topic is delivered during induction and refreshed annually thereafter.",
            points: [
              "Notify the shift supervisor of any deviation from standard practice.",
              "Record the time, location, and personnel involved for every action taken.",
              "Escalate immediately if the situation falls outside your authority to resolve.",
              "Do not proceed without the required approval where one is specified.",
            ],
            note: "Any exception to this section must be documented and approved in writing before it is applied.",
          },
          {
            id: "op-1-s6", num: "6", title: "Exceptions and Escalation", page: 6,
            body: "This section of the Welcome Guide covers exceptions and escalation relevant to day-to-day operations. Any queries relating to this section should be directed to the site manager or Avante Security management. Failure to document actions taken under this section may compromise the integrity of the record.",
          },
          {
            id: "op-1-s7", num: "7", title: "Roles and Authority", page: 7,
            body: "This section of the Welcome Guide covers roles and authority relevant to day-to-day operations. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly. Records relating to this process must be retained for the period specified in the site retention schedule.",
          },
          {
            id: "op-1-s8", num: "8", title: "Definitions", page: 8,
            body: "This section of the Welcome Guide covers definitions relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. All personnel are expected to be familiar with the contents of this section before commencing duties.",
            points: [
              "Do not proceed without the required approval where one is specified.",
              "Retain supporting documentation for the period defined in the retention schedule.",
              "Verify identity before granting access or releasing information.",
              "Report any equipment faults or shortfalls before the end of the shift.",
            ],
          },
          {
            id: "op-1-s9", num: "9", title: "Related Documents", page: 9,
            body: "This section of the Welcome Guide covers related documents relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. Updates to this section take effect immediately upon publication and supersede previous guidance.",
          },
          {
            id: "op-1-s10", num: "10", title: "Record Keeping", page: 10,
            body: "This section of the Welcome Guide covers record keeping relevant to day-to-day operations. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly.",
            note: "This section may be updated following a client review. Always refer to the latest version held in the control room.",
          },
        ],

      },
      {

        id: "op-2",

        name: "Code of Conduct",

        kind: "document",

        content: "7 pages",

        lastModified: "2026-05-18",
        toc: [
          {
            id: "op-2-s1", num: "1", title: "Responsibilities", page: 1,
            body: "This section of the Code of Conduct covers responsibilities relevant to day-to-day operations. This process supports the wider security objectives of the site and must not be treated as optional. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly.",
          },
          {
            id: "op-2-s2", num: "2", title: "Requirements", page: 2,
            body: "This section of the Code of Conduct covers requirements relevant to day-to-day operations. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager.",
            points: [
              "Refer unresolved issues to the duty manager without delay.",
              "Confirm the relevant checklist has been completed before sign-off.",
              "Notify the shift supervisor of any deviation from standard practice.",
              "Record the time, location, and personnel involved for every action taken.",
            ],
          },
          {
            id: "op-2-s3", num: "3", title: "Compliance", page: 3,
            body: "This section of the Code of Conduct covers compliance relevant to day-to-day operations. Updates to this section take effect immediately upon publication and supersede previous guidance. Non-compliance with this section may result in a formal review under the site's disciplinary procedure.",
          },
          {
            id: "op-2-s4", num: "4", title: "Reporting", page: 4,
            body: "This section of the Code of Conduct covers reporting relevant to day-to-day operations. Training on this topic is delivered during induction and refreshed annually thereafter. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making.",
          },
          {
            id: "op-2-s5", num: "5", title: "Exceptions and Escalation", page: 5,
            body: "This section of the Code of Conduct covers exceptions and escalation relevant to day-to-day operations. Any queries relating to this section should be directed to the site manager or Avante Security management. Any queries relating to this section should be directed to the site manager or Avante Security management.",
            points: [
              "Record the time, location, and personnel involved for every action taken.",
              "Escalate immediately if the situation falls outside your authority to resolve.",
              "Do not proceed without the required approval where one is specified.",
              "Retain supporting documentation for the period defined in the retention schedule.",
            ],
            note: "This section may be updated following a client review. Always refer to the latest version held in the control room.",
          },
          {
            id: "op-2-s6", num: "6", title: "Roles and Authority", page: 6,
            body: "This section of the Code of Conduct covers roles and authority relevant to day-to-day operations. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly. Officers must follow each step in order and confirm completion before proceeding to the next stage.",
          },
          {
            id: "op-2-s7", num: "7", title: "Definitions", page: 7,
            body: "This section of the Code of Conduct covers definitions relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. This requirement applies across all shifts and must be reinforced during team briefings.",
          },
        ],

      },
      {

        id: "op-3",

        name: "Uniform Policy",

        kind: "document",

        content: "4 pages",

        lastModified: "2026-05-14",
        toc: [
          {
            id: "op-3-s1", num: "1", title: "Requirements", page: 1,
            body: "This section of the Uniform Policy covers requirements relevant to day-to-day operations. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making. Failure to document actions taken under this section may compromise the integrity of the record.",
          },
          {
            id: "op-3-s2", num: "2", title: "Compliance", page: 2,
            body: "This section of the Uniform Policy covers compliance relevant to day-to-day operations. Updates to this section take effect immediately upon publication and supersede previous guidance. Records relating to this process must be retained for the period specified in the site retention schedule.",
            points: [
              "Confirm the relevant checklist has been completed before sign-off.",
              "Notify the shift supervisor of any deviation from standard practice.",
              "Record the time, location, and personnel involved for every action taken.",
              "Escalate immediately if the situation falls outside your authority to resolve.",
            ],
          },
          {
            id: "op-3-s3", num: "3", title: "Reporting", page: 3,
            body: "This section of the Uniform Policy covers reporting relevant to day-to-day operations. Training on this topic is delivered during induction and refreshed annually thereafter. All personnel are expected to be familiar with the contents of this section before commencing duties.",
          },
          {
            id: "op-3-s4", num: "4", title: "Exceptions and Escalation", page: 4,
            body: "This section of the Uniform Policy covers exceptions and escalation relevant to day-to-day operations. Any queries relating to this section should be directed to the site manager or Avante Security management. Updates to this section take effect immediately upon publication and supersede previous guidance.",
          },
        ],

      },
      {

        id: "op-4",

        name: "Payroll & Leave Info",

        kind: "document",

        content: "5 pages",

        lastModified: "2026-05-10",
        toc: [
          {
            id: "op-4-s1", num: "1", title: "Compliance", page: 1,
            body: "This section of the Payroll & Leave Info covers compliance relevant to day-to-day operations. Updates to this section take effect immediately upon publication and supersede previous guidance. Officers must follow each step in order and confirm completion before proceeding to the next stage.",
          },
          {
            id: "op-4-s2", num: "2", title: "Reporting", page: 2,
            body: "This section of the Payroll & Leave Info covers reporting relevant to day-to-day operations. Training on this topic is delivered during induction and refreshed annually thereafter. This requirement applies across all shifts and must be reinforced during team briefings.",
            points: [
              "Notify the shift supervisor of any deviation from standard practice.",
              "Record the time, location, and personnel involved for every action taken.",
              "Escalate immediately if the situation falls outside your authority to resolve.",
              "Do not proceed without the required approval where one is specified.",
            ],
          },
          {
            id: "op-4-s3", num: "3", title: "Exceptions and Escalation", page: 3,
            body: "This section of the Payroll & Leave Info covers exceptions and escalation relevant to day-to-day operations. Any queries relating to this section should be directed to the site manager or Avante Security management. This process supports the wider security objectives of the site and must not be treated as optional.",
          },
          {
            id: "op-4-s4", num: "4", title: "Roles and Authority", page: 4,
            body: "This section of the Payroll & Leave Info covers roles and authority relevant to day-to-day operations. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly. Training on this topic is delivered during induction and refreshed annually thereafter.",
          },
          {
            id: "op-4-s5", num: "5", title: "Definitions", page: 5,
            body: "This section of the Payroll & Leave Info covers definitions relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. Failure to document actions taken under this section may compromise the integrity of the record.",
            points: [
              "Do not proceed without the required approval where one is specified.",
              "Retain supporting documentation for the period defined in the retention schedule.",
              "Verify identity before granting access or releasing information.",
              "Report any equipment faults or shortfalls before the end of the shift.",
            ],
            note: "This requirement is subject to periodic audit by Avante Security management. Ensure full compliance at all times.",
          },
        ],

      },
      {

        id: "op-5",

        name: "Site Induction Checklist",

        kind: "document",

        content: "3 pages",

        lastModified: "2026-05-05",
        toc: [
          {
            id: "op-5-s1", num: "1", title: "Reporting", page: 1,
            body: "This section of the Site Induction Checklist covers reporting relevant to day-to-day operations. Training on this topic is delivered during induction and refreshed annually thereafter. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager.",
          },
          {
            id: "op-5-s2", num: "2", title: "Exceptions and Escalation", page: 2,
            body: "This section of the Site Induction Checklist covers exceptions and escalation relevant to day-to-day operations. Any queries relating to this section should be directed to the site manager or Avante Security management. Non-compliance with this section may result in a formal review under the site's disciplinary procedure.",
            points: [
              "Record the time, location, and personnel involved for every action taken.",
              "Escalate immediately if the situation falls outside your authority to resolve.",
              "Do not proceed without the required approval where one is specified.",
              "Retain supporting documentation for the period defined in the retention schedule.",
            ],
          },
          {
            id: "op-5-s3", num: "3", title: "Roles and Authority", page: 3,
            body: "This section of the Site Induction Checklist covers roles and authority relevant to day-to-day operations. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making.",
          },
        ],

      },
      {

        id: "op-6",

        name: "IT & Equipment Setup",

        kind: "document",

        content: "6 pages",

        lastModified: "2026-04-28",
        toc: [
          {
            id: "op-6-s1", num: "1", title: "Exceptions and Escalation", page: 1,
            body: "This section of the IT & Equipment Setup covers exceptions and escalation relevant to day-to-day operations. Any queries relating to this section should be directed to the site manager or Avante Security management. Records relating to this process must be retained for the period specified in the site retention schedule.",
          },
          {
            id: "op-6-s2", num: "2", title: "Roles and Authority", page: 2,
            body: "This section of the IT & Equipment Setup covers roles and authority relevant to day-to-day operations. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly. All personnel are expected to be familiar with the contents of this section before commencing duties.",
            points: [
              "Escalate immediately if the situation falls outside your authority to resolve.",
              "Do not proceed without the required approval where one is specified.",
              "Retain supporting documentation for the period defined in the retention schedule.",
              "Verify identity before granting access or releasing information.",
            ],
          },
          {
            id: "op-6-s3", num: "3", title: "Definitions", page: 3,
            body: "This section of the IT & Equipment Setup covers definitions relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. Updates to this section take effect immediately upon publication and supersede previous guidance.",
          },
          {
            id: "op-6-s4", num: "4", title: "Related Documents", page: 4,
            body: "This section of the IT & Equipment Setup covers related documents relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly.",
          },
          {
            id: "op-6-s5", num: "5", title: "Record Keeping", page: 5,
            body: "This section of the IT & Equipment Setup covers record keeping relevant to day-to-day operations. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager.",
            points: [
              "Verify identity before granting access or releasing information.",
              "Report any equipment faults or shortfalls before the end of the shift.",
              "Ensure all entries are legible, accurate, and completed in full.",
              "Refer unresolved issues to the duty manager without delay.",
            ],
            note: "This section may be updated following a client review. Always refer to the latest version held in the control room.",
          },
          {
            id: "op-6-s6", num: "6", title: "Training and Awareness", page: 6,
            body: "This section of the IT & Equipment Setup covers training and awareness relevant to day-to-day operations. Records relating to this process must be retained for the period specified in the site retention schedule. Non-compliance with this section may result in a formal review under the site's disciplinary procedure.",
          },
        ],

      },
      {

        id: "op-7",

        name: "Emergency Contacts",

        kind: "document",

        content: "2 pages",

        lastModified: "2026-04-20",
        toc: [
          {
            id: "op-7-s1", num: "1", title: "Roles and Authority", page: 1,
            body: "This section of the Emergency Contacts covers roles and authority relevant to day-to-day operations. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly. This requirement applies across all shifts and must be reinforced during team briefings.",
          },
          {
            id: "op-7-s2", num: "2", title: "Definitions", page: 2,
            body: "This section of the Emergency Contacts covers definitions relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. This process supports the wider security objectives of the site and must not be treated as optional.",
            points: [
              "Do not proceed without the required approval where one is specified.",
              "Retain supporting documentation for the period defined in the retention schedule.",
              "Verify identity before granting access or releasing information.",
              "Report any equipment faults or shortfalls before the end of the shift.",
            ],
          },
        ],

      },
      {

        id: "op-8",

        name: "Probation Review Form",

        kind: "document",

        content: "4 pages",

        lastModified: "2026-04-12",
        toc: [
          {
            id: "op-8-s1", num: "1", title: "Definitions", page: 1,
            body: "This section of the Probation Review Form covers definitions relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. Non-compliance with this section may result in a formal review under the site's disciplinary procedure.",
          },
          {
            id: "op-8-s2", num: "2", title: "Related Documents", page: 2,
            body: "This section of the Probation Review Form covers related documents relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making.",
            points: [
              "Retain supporting documentation for the period defined in the retention schedule.",
              "Verify identity before granting access or releasing information.",
              "Report any equipment faults or shortfalls before the end of the shift.",
              "Ensure all entries are legible, accurate, and completed in full.",
            ],
          },
          {
            id: "op-8-s3", num: "3", title: "Record Keeping", page: 3,
            body: "This section of the Probation Review Form covers record keeping relevant to day-to-day operations. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager. Any queries relating to this section should be directed to the site manager or Avante Security management.",
          },
          {
            id: "op-8-s4", num: "4", title: "Training and Awareness", page: 4,
            body: "This section of the Probation Review Form covers training and awareness relevant to day-to-day operations. Records relating to this process must be retained for the period specified in the site retention schedule. Officers must follow each step in order and confirm completion before proceeding to the next stage.",
          },
        ],

      },
      {

        id: "op-9",

        name: "Training Pathway",

        kind: "document",

        content: "8 pages",

        lastModified: "2026-04-01",
        toc: [
          {
            id: "op-9-s1", num: "1", title: "Related Documents", page: 1,
            body: "This section of the Training Pathway covers related documents relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. All personnel are expected to be familiar with the contents of this section before commencing duties.",
          },
          {
            id: "op-9-s2", num: "2", title: "Record Keeping", page: 2,
            body: "This section of the Training Pathway covers record keeping relevant to day-to-day operations. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager. Updates to this section take effect immediately upon publication and supersede previous guidance.",
            points: [
              "Verify identity before granting access or releasing information.",
              "Report any equipment faults or shortfalls before the end of the shift.",
              "Ensure all entries are legible, accurate, and completed in full.",
              "Refer unresolved issues to the duty manager without delay.",
            ],
          },
          {
            id: "op-9-s3", num: "3", title: "Training and Awareness", page: 3,
            body: "This section of the Training Pathway covers training and awareness relevant to day-to-day operations. Records relating to this process must be retained for the period specified in the site retention schedule. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly.",
          },
          {
            id: "op-9-s4", num: "4", title: "Review Schedule", page: 4,
            body: "This section of the Training Pathway covers review schedule relevant to day-to-day operations. This requirement applies across all shifts and must be reinforced during team briefings. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager.",
          },
          {
            id: "op-9-s5", num: "5", title: "Standard Practice", page: 5,
            body: "This section of the Training Pathway covers standard practice relevant to day-to-day operations. Non-compliance with this section may result in a formal review under the site's disciplinary procedure. Non-compliance with this section may result in a formal review under the site's disciplinary procedure.",
            points: [
              "Refer unresolved issues to the duty manager without delay.",
              "Confirm the relevant checklist has been completed before sign-off.",
              "Notify the shift supervisor of any deviation from standard practice.",
              "Record the time, location, and personnel involved for every action taken.",
            ],
            note: "Any exception to this section must be documented and approved in writing before it is applied.",
          },
          {
            id: "op-9-s6", num: "6", title: "Overview", page: 6,
            body: "This section of the Training Pathway covers overview relevant to day-to-day operations. All personnel are expected to be familiar with the contents of this section before commencing duties. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making.",
          },
          {
            id: "op-9-s7", num: "7", title: "Scope and Purpose", page: 7,
            body: "This section of the Training Pathway covers scope and purpose relevant to day-to-day operations. This process supports the wider security objectives of the site and must not be treated as optional. Any queries relating to this section should be directed to the site manager or Avante Security management.",
          },
          {
            id: "op-9-s8", num: "8", title: "Procedure", page: 8,
            body: "This section of the Training Pathway covers procedure relevant to day-to-day operations. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making. Officers must follow each step in order and confirm completion before proceeding to the next stage.",
            points: [
              "Record the time, location, and personnel involved for every action taken.",
              "Escalate immediately if the situation falls outside your authority to resolve.",
              "Do not proceed without the required approval where one is specified.",
              "Retain supporting documentation for the period defined in the retention schedule.",
            ],
          },
        ],

      },
    ],
  },
  {
    id: "12",
    name: "Site Briefings",
    lastModified: "2026-05-10",
    documents: [
      {

        id: "sb-1",

        name: "City Centre Site Brief",

        kind: "document",

        content: "9 pages",

        lastModified: "2026-05-10",
        toc: [
          {
            id: "sb-1-s1", num: "1", title: "Exceptions and Escalation", page: 1,
            body: "This section of the City Centre Site Brief covers exceptions and escalation relevant to day-to-day operations. Updates to this section take effect immediately upon publication and supersede previous guidance. Officers must follow each step in order and confirm completion before proceeding to the next stage.",
          },
          {
            id: "sb-1-s2", num: "2", title: "Roles and Authority", page: 2,
            body: "This section of the City Centre Site Brief covers roles and authority relevant to day-to-day operations. Training on this topic is delivered during induction and refreshed annually thereafter. This requirement applies across all shifts and must be reinforced during team briefings.",
            points: [
              "Ensure all entries are legible, accurate, and completed in full.",
              "Refer unresolved issues to the duty manager without delay.",
              "Confirm the relevant checklist has been completed before sign-off.",
              "Notify the shift supervisor of any deviation from standard practice.",
            ],
          },
          {
            id: "sb-1-s3", num: "3", title: "Definitions", page: 3,
            body: "This section of the City Centre Site Brief covers definitions relevant to day-to-day operations. Any queries relating to this section should be directed to the site manager or Avante Security management. This process supports the wider security objectives of the site and must not be treated as optional.",
          },
          {
            id: "sb-1-s4", num: "4", title: "Related Documents", page: 4,
            body: "This section of the City Centre Site Brief covers related documents relevant to day-to-day operations. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly. Training on this topic is delivered during induction and refreshed annually thereafter.",
          },
          {
            id: "sb-1-s5", num: "5", title: "Record Keeping", page: 5,
            body: "This section of the City Centre Site Brief covers record keeping relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. Failure to document actions taken under this section may compromise the integrity of the record.",
            points: [
              "Notify the shift supervisor of any deviation from standard practice.",
              "Record the time, location, and personnel involved for every action taken.",
              "Escalate immediately if the situation falls outside your authority to resolve.",
              "Do not proceed without the required approval where one is specified.",
            ],
            note: "Officers who are unsure how to apply this section should seek clarification from their supervisor before acting.",
          },
          {
            id: "sb-1-s6", num: "6", title: "Training and Awareness", page: 6,
            body: "This section of the City Centre Site Brief covers training and awareness relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. Records relating to this process must be retained for the period specified in the site retention schedule.",
          },
          {
            id: "sb-1-s7", num: "7", title: "Review Schedule", page: 7,
            body: "This section of the City Centre Site Brief covers review schedule relevant to day-to-day operations. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager. All personnel are expected to be familiar with the contents of this section before commencing duties.",
          },
          {
            id: "sb-1-s8", num: "8", title: "Standard Practice", page: 8,
            body: "This section of the City Centre Site Brief covers standard practice relevant to day-to-day operations. Records relating to this process must be retained for the period specified in the site retention schedule. Updates to this section take effect immediately upon publication and supersede previous guidance.",
            points: [
              "Do not proceed without the required approval where one is specified.",
              "Retain supporting documentation for the period defined in the retention schedule.",
              "Verify identity before granting access or releasing information.",
              "Report any equipment faults or shortfalls before the end of the shift.",
            ],
          },
          {
            id: "sb-1-s9", num: "9", title: "Overview", page: 9,
            body: "This section of the City Centre Site Brief covers overview relevant to day-to-day operations. This requirement applies across all shifts and must be reinforced during team briefings. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly.",
          },
        ],

      },
      {

        id: "sb-2",

        name: "Airport Terminal Brief",

        kind: "document",

        content: "11 pages",

        lastModified: "2026-05-02",
        toc: [
          {
            id: "sb-2-s1", num: "1", title: "Roles and Authority", page: 1,
            body: "This section of the Airport Terminal Brief covers roles and authority relevant to day-to-day operations. Training on this topic is delivered during induction and refreshed annually thereafter. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager.",
          },
          {
            id: "sb-2-s2", num: "2", title: "Definitions", page: 2,
            body: "This section of the Airport Terminal Brief covers definitions relevant to day-to-day operations. Any queries relating to this section should be directed to the site manager or Avante Security management. Non-compliance with this section may result in a formal review under the site's disciplinary procedure.",
            points: [
              "Refer unresolved issues to the duty manager without delay.",
              "Confirm the relevant checklist has been completed before sign-off.",
              "Notify the shift supervisor of any deviation from standard practice.",
              "Record the time, location, and personnel involved for every action taken.",
            ],
          },
          {
            id: "sb-2-s3", num: "3", title: "Related Documents", page: 3,
            body: "This section of the Airport Terminal Brief covers related documents relevant to day-to-day operations. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making.",
          },
          {
            id: "sb-2-s4", num: "4", title: "Record Keeping", page: 4,
            body: "This section of the Airport Terminal Brief covers record keeping relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. Any queries relating to this section should be directed to the site manager or Avante Security management.",
          },
          {
            id: "sb-2-s5", num: "5", title: "Training and Awareness", page: 5,
            body: "This section of the Airport Terminal Brief covers training and awareness relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. Officers must follow each step in order and confirm completion before proceeding to the next stage.",
            points: [
              "Record the time, location, and personnel involved for every action taken.",
              "Escalate immediately if the situation falls outside your authority to resolve.",
              "Do not proceed without the required approval where one is specified.",
              "Retain supporting documentation for the period defined in the retention schedule.",
            ],
            note: "This requirement is subject to periodic audit by Avante Security management. Ensure full compliance at all times.",
          },
          {
            id: "sb-2-s6", num: "6", title: "Review Schedule", page: 6,
            body: "This section of the Airport Terminal Brief covers review schedule relevant to day-to-day operations. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager. This requirement applies across all shifts and must be reinforced during team briefings.",
          },
          {
            id: "sb-2-s7", num: "7", title: "Standard Practice", page: 7,
            body: "This section of the Airport Terminal Brief covers standard practice relevant to day-to-day operations. Records relating to this process must be retained for the period specified in the site retention schedule. This process supports the wider security objectives of the site and must not be treated as optional.",
          },
          {
            id: "sb-2-s8", num: "8", title: "Overview", page: 8,
            body: "This section of the Airport Terminal Brief covers overview relevant to day-to-day operations. This requirement applies across all shifts and must be reinforced during team briefings. Training on this topic is delivered during induction and refreshed annually thereafter.",
            points: [
              "Retain supporting documentation for the period defined in the retention schedule.",
              "Verify identity before granting access or releasing information.",
              "Report any equipment faults or shortfalls before the end of the shift.",
              "Ensure all entries are legible, accurate, and completed in full.",
            ],
          },
          {
            id: "sb-2-s9", num: "9", title: "Scope and Purpose", page: 9,
            body: "This section of the Airport Terminal Brief covers scope and purpose relevant to day-to-day operations. Non-compliance with this section may result in a formal review under the site's disciplinary procedure. Failure to document actions taken under this section may compromise the integrity of the record.",
          },
          {
            id: "sb-2-s10", num: "10", title: "Procedure", page: 10,
            body: "This section of the Airport Terminal Brief covers procedure relevant to day-to-day operations. All personnel are expected to be familiar with the contents of this section before commencing duties. Records relating to this process must be retained for the period specified in the site retention schedule.",
            note: "Any exception to this section must be documented and approved in writing before it is applied.",
          },
          {
            id: "sb-2-s11", num: "11", title: "Responsibilities", page: 11,
            body: "This section of the Airport Terminal Brief covers responsibilities relevant to day-to-day operations. This process supports the wider security objectives of the site and must not be treated as optional. All personnel are expected to be familiar with the contents of this section before commencing duties.",
            points: [
              "Ensure all entries are legible, accurate, and completed in full.",
              "Refer unresolved issues to the duty manager without delay.",
              "Confirm the relevant checklist has been completed before sign-off.",
              "Notify the shift supervisor of any deviation from standard practice.",
            ],
          },
        ],

      },
      {

        id: "sb-3",

        name: "Warehouse Complex Brief",

        kind: "document",

        content: "8 pages",

        lastModified: "2026-04-20",
        toc: [
          {
            id: "sb-3-s1", num: "1", title: "Definitions", page: 1,
            body: "This section of the Warehouse Complex Brief covers definitions relevant to day-to-day operations. Any queries relating to this section should be directed to the site manager or Avante Security management. Records relating to this process must be retained for the period specified in the site retention schedule.",
          },
          {
            id: "sb-3-s2", num: "2", title: "Related Documents", page: 2,
            body: "This section of the Warehouse Complex Brief covers related documents relevant to day-to-day operations. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly. All personnel are expected to be familiar with the contents of this section before commencing duties.",
            points: [
              "Confirm the relevant checklist has been completed before sign-off.",
              "Notify the shift supervisor of any deviation from standard practice.",
              "Record the time, location, and personnel involved for every action taken.",
              "Escalate immediately if the situation falls outside your authority to resolve.",
            ],
          },
          {
            id: "sb-3-s3", num: "3", title: "Record Keeping", page: 3,
            body: "This section of the Warehouse Complex Brief covers record keeping relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. Updates to this section take effect immediately upon publication and supersede previous guidance.",
          },
          {
            id: "sb-3-s4", num: "4", title: "Training and Awareness", page: 4,
            body: "This section of the Warehouse Complex Brief covers training and awareness relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly.",
          },
          {
            id: "sb-3-s5", num: "5", title: "Review Schedule", page: 5,
            body: "This section of the Warehouse Complex Brief covers review schedule relevant to day-to-day operations. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager.",
            points: [
              "Escalate immediately if the situation falls outside your authority to resolve.",
              "Do not proceed without the required approval where one is specified.",
              "Retain supporting documentation for the period defined in the retention schedule.",
              "Verify identity before granting access or releasing information.",
            ],
            note: "Any exception to this section must be documented and approved in writing before it is applied.",
          },
          {
            id: "sb-3-s6", num: "6", title: "Standard Practice", page: 6,
            body: "This section of the Warehouse Complex Brief covers standard practice relevant to day-to-day operations. Records relating to this process must be retained for the period specified in the site retention schedule. Non-compliance with this section may result in a formal review under the site's disciplinary procedure.",
          },
          {
            id: "sb-3-s7", num: "7", title: "Overview", page: 7,
            body: "This section of the Warehouse Complex Brief covers overview relevant to day-to-day operations. This requirement applies across all shifts and must be reinforced during team briefings. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making.",
          },
          {
            id: "sb-3-s8", num: "8", title: "Scope and Purpose", page: 8,
            body: "This section of the Warehouse Complex Brief covers scope and purpose relevant to day-to-day operations. Non-compliance with this section may result in a formal review under the site's disciplinary procedure. Any queries relating to this section should be directed to the site manager or Avante Security management.",
            points: [
              "Verify identity before granting access or releasing information.",
              "Report any equipment faults or shortfalls before the end of the shift.",
              "Ensure all entries are legible, accurate, and completed in full.",
              "Refer unresolved issues to the duty manager without delay.",
            ],
          },
        ],

      },
      {

        id: "sb-4",

        name: "Hospital Campus Brief",

        kind: "document",

        content: "13 pages",

        lastModified: "2026-04-10",
        toc: [
          {
            id: "sb-4-s1", num: "1", title: "Related Documents", page: 1,
            body: "This section of the Hospital Campus Brief covers related documents relevant to day-to-day operations. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly. This requirement applies across all shifts and must be reinforced during team briefings.",
          },
          {
            id: "sb-4-s2", num: "2", title: "Record Keeping", page: 2,
            body: "This section of the Hospital Campus Brief covers record keeping relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. This process supports the wider security objectives of the site and must not be treated as optional.",
            points: [
              "Notify the shift supervisor of any deviation from standard practice.",
              "Record the time, location, and personnel involved for every action taken.",
              "Escalate immediately if the situation falls outside your authority to resolve.",
              "Do not proceed without the required approval where one is specified.",
            ],
          },
          {
            id: "sb-4-s3", num: "3", title: "Training and Awareness", page: 3,
            body: "This section of the Hospital Campus Brief covers training and awareness relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. Training on this topic is delivered during induction and refreshed annually thereafter.",
          },
          {
            id: "sb-4-s4", num: "4", title: "Review Schedule", page: 4,
            body: "This section of the Hospital Campus Brief covers review schedule relevant to day-to-day operations. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager. Failure to document actions taken under this section may compromise the integrity of the record.",
          },
          {
            id: "sb-4-s5", num: "5", title: "Standard Practice", page: 5,
            body: "This section of the Hospital Campus Brief covers standard practice relevant to day-to-day operations. Records relating to this process must be retained for the period specified in the site retention schedule. Records relating to this process must be retained for the period specified in the site retention schedule.",
            points: [
              "Do not proceed without the required approval where one is specified.",
              "Retain supporting documentation for the period defined in the retention schedule.",
              "Verify identity before granting access or releasing information.",
              "Report any equipment faults or shortfalls before the end of the shift.",
            ],
            note: "This section may be updated following a client review. Always refer to the latest version held in the control room.",
          },
          {
            id: "sb-4-s6", num: "6", title: "Overview", page: 6,
            body: "This section of the Hospital Campus Brief covers overview relevant to day-to-day operations. This requirement applies across all shifts and must be reinforced during team briefings. All personnel are expected to be familiar with the contents of this section before commencing duties.",
          },
          {
            id: "sb-4-s7", num: "7", title: "Scope and Purpose", page: 7,
            body: "This section of the Hospital Campus Brief covers scope and purpose relevant to day-to-day operations. Non-compliance with this section may result in a formal review under the site's disciplinary procedure. Updates to this section take effect immediately upon publication and supersede previous guidance.",
          },
          {
            id: "sb-4-s8", num: "8", title: "Procedure", page: 8,
            body: "This section of the Hospital Campus Brief covers procedure relevant to day-to-day operations. All personnel are expected to be familiar with the contents of this section before commencing duties. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly.",
            points: [
              "Report any equipment faults or shortfalls before the end of the shift.",
              "Ensure all entries are legible, accurate, and completed in full.",
              "Refer unresolved issues to the duty manager without delay.",
              "Confirm the relevant checklist has been completed before sign-off.",
            ],
          },
          {
            id: "sb-4-s9", num: "9", title: "Responsibilities", page: 9,
            body: "This section of the Hospital Campus Brief covers responsibilities relevant to day-to-day operations. This process supports the wider security objectives of the site and must not be treated as optional. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager.",
          },
          {
            id: "sb-4-s10", num: "10", title: "Requirements", page: 10,
            body: "This section of the Hospital Campus Brief covers requirements relevant to day-to-day operations. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making. Non-compliance with this section may result in a formal review under the site's disciplinary procedure.",
            note: "Officers who are unsure how to apply this section should seek clarification from their supervisor before acting.",
          },
          {
            id: "sb-4-s11", num: "11", title: "Compliance", page: 11,
            body: "This section of the Hospital Campus Brief covers compliance relevant to day-to-day operations. Updates to this section take effect immediately upon publication and supersede previous guidance. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making.",
            points: [
              "Confirm the relevant checklist has been completed before sign-off.",
              "Notify the shift supervisor of any deviation from standard practice.",
              "Record the time, location, and personnel involved for every action taken.",
              "Escalate immediately if the situation falls outside your authority to resolve.",
            ],
          },
          {
            id: "sb-4-s12", num: "12", title: "Reporting", page: 12,
            body: "This section of the Hospital Campus Brief covers reporting relevant to day-to-day operations. Training on this topic is delivered during induction and refreshed annually thereafter. Any queries relating to this section should be directed to the site manager or Avante Security management.",
          },
          {
            id: "sb-4-s13", num: "13", title: "Exceptions and Escalation", page: 13,
            body: "This section of the Hospital Campus Brief covers exceptions and escalation relevant to day-to-day operations. Any queries relating to this section should be directed to the site manager or Avante Security management. Officers must follow each step in order and confirm completion before proceeding to the next stage.",
          },
        ],

      },
      {

        id: "sb-5",

        name: "Retail Centre Brief",

        kind: "document",

        content: "7 pages",

        lastModified: "2026-03-28",
        toc: [
          {
            id: "sb-5-s1", num: "1", title: "Record Keeping", page: 1,
            body: "This section of the Retail Centre Brief covers record keeping relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. Non-compliance with this section may result in a formal review under the site's disciplinary procedure.",
          },
          {
            id: "sb-5-s2", num: "2", title: "Training and Awareness", page: 2,
            body: "This section of the Retail Centre Brief covers training and awareness relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making.",
            points: [
              "Record the time, location, and personnel involved for every action taken.",
              "Escalate immediately if the situation falls outside your authority to resolve.",
              "Do not proceed without the required approval where one is specified.",
              "Retain supporting documentation for the period defined in the retention schedule.",
            ],
          },
          {
            id: "sb-5-s3", num: "3", title: "Review Schedule", page: 3,
            body: "This section of the Retail Centre Brief covers review schedule relevant to day-to-day operations. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager. Any queries relating to this section should be directed to the site manager or Avante Security management.",
          },
          {
            id: "sb-5-s4", num: "4", title: "Standard Practice", page: 4,
            body: "This section of the Retail Centre Brief covers standard practice relevant to day-to-day operations. Records relating to this process must be retained for the period specified in the site retention schedule. Officers must follow each step in order and confirm completion before proceeding to the next stage.",
          },
          {
            id: "sb-5-s5", num: "5", title: "Overview", page: 5,
            body: "This section of the Retail Centre Brief covers overview relevant to day-to-day operations. This requirement applies across all shifts and must be reinforced during team briefings. This requirement applies across all shifts and must be reinforced during team briefings.",
            points: [
              "Retain supporting documentation for the period defined in the retention schedule.",
              "Verify identity before granting access or releasing information.",
              "Report any equipment faults or shortfalls before the end of the shift.",
              "Ensure all entries are legible, accurate, and completed in full.",
            ],
            note: "Officers who are unsure how to apply this section should seek clarification from their supervisor before acting.",
          },
          {
            id: "sb-5-s6", num: "6", title: "Scope and Purpose", page: 6,
            body: "This section of the Retail Centre Brief covers scope and purpose relevant to day-to-day operations. Non-compliance with this section may result in a formal review under the site's disciplinary procedure. This process supports the wider security objectives of the site and must not be treated as optional.",
          },
          {
            id: "sb-5-s7", num: "7", title: "Procedure", page: 7,
            body: "This section of the Retail Centre Brief covers procedure relevant to day-to-day operations. All personnel are expected to be familiar with the contents of this section before commencing duties. Training on this topic is delivered during induction and refreshed annually thereafter.",
          },
        ],

      },
      {

        id: "sb-6",

        name: "Corporate HQ Brief",

        kind: "document",

        content: "10 pages",

        lastModified: "2026-03-15",
        toc: [
          {
            id: "sb-6-s1", num: "1", title: "Training and Awareness", page: 1,
            body: "This section of the Corporate HQ Brief covers training and awareness relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. All personnel are expected to be familiar with the contents of this section before commencing duties.",
          },
          {
            id: "sb-6-s2", num: "2", title: "Review Schedule", page: 2,
            body: "This section of the Corporate HQ Brief covers review schedule relevant to day-to-day operations. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager. Updates to this section take effect immediately upon publication and supersede previous guidance.",
            points: [
              "Escalate immediately if the situation falls outside your authority to resolve.",
              "Do not proceed without the required approval where one is specified.",
              "Retain supporting documentation for the period defined in the retention schedule.",
              "Verify identity before granting access or releasing information.",
            ],
          },
          {
            id: "sb-6-s3", num: "3", title: "Standard Practice", page: 3,
            body: "This section of the Corporate HQ Brief covers standard practice relevant to day-to-day operations. Records relating to this process must be retained for the period specified in the site retention schedule. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly.",
          },
          {
            id: "sb-6-s4", num: "4", title: "Overview", page: 4,
            body: "This section of the Corporate HQ Brief covers overview relevant to day-to-day operations. This requirement applies across all shifts and must be reinforced during team briefings. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager.",
          },
          {
            id: "sb-6-s5", num: "5", title: "Scope and Purpose", page: 5,
            body: "This section of the Corporate HQ Brief covers scope and purpose relevant to day-to-day operations. Non-compliance with this section may result in a formal review under the site's disciplinary procedure. Non-compliance with this section may result in a formal review under the site's disciplinary procedure.",
            points: [
              "Verify identity before granting access or releasing information.",
              "Report any equipment faults or shortfalls before the end of the shift.",
              "Ensure all entries are legible, accurate, and completed in full.",
              "Refer unresolved issues to the duty manager without delay.",
            ],
            note: "This requirement is subject to periodic audit by Avante Security management. Ensure full compliance at all times.",
          },
          {
            id: "sb-6-s6", num: "6", title: "Procedure", page: 6,
            body: "This section of the Corporate HQ Brief covers procedure relevant to day-to-day operations. All personnel are expected to be familiar with the contents of this section before commencing duties. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making.",
          },
          {
            id: "sb-6-s7", num: "7", title: "Responsibilities", page: 7,
            body: "This section of the Corporate HQ Brief covers responsibilities relevant to day-to-day operations. This process supports the wider security objectives of the site and must not be treated as optional. Any queries relating to this section should be directed to the site manager or Avante Security management.",
          },
          {
            id: "sb-6-s8", num: "8", title: "Requirements", page: 8,
            body: "This section of the Corporate HQ Brief covers requirements relevant to day-to-day operations. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making. Officers must follow each step in order and confirm completion before proceeding to the next stage.",
            points: [
              "Refer unresolved issues to the duty manager without delay.",
              "Confirm the relevant checklist has been completed before sign-off.",
              "Notify the shift supervisor of any deviation from standard practice.",
              "Record the time, location, and personnel involved for every action taken.",
            ],
          },
          {
            id: "sb-6-s9", num: "9", title: "Compliance", page: 9,
            body: "This section of the Corporate HQ Brief covers compliance relevant to day-to-day operations. Updates to this section take effect immediately upon publication and supersede previous guidance. This requirement applies across all shifts and must be reinforced during team briefings.",
          },
          {
            id: "sb-6-s10", num: "10", title: "Reporting", page: 10,
            body: "This section of the Corporate HQ Brief covers reporting relevant to day-to-day operations. Training on this topic is delivered during induction and refreshed annually thereafter. This process supports the wider security objectives of the site and must not be treated as optional.",
            note: "Any exception to this section must be documented and approved in writing before it is applied.",
          },
        ],

      },
    ],
  },
  {
    id: "14",
    name: "Visitor Management",
    lastModified: "2026-04-28",
    documents: [
      {

        id: "vm-1",

        name: "Visitor Sign-In Form",

        kind: "document",

        content: "2 pages",

        lastModified: "2026-04-28",
        toc: [
          {
            id: "vm-1-s1", num: "1", title: "Reporting", page: 1,
            body: "This section of the Visitor Sign-In Form covers reporting relevant to day-to-day operations. Training on this topic is delivered during induction and refreshed annually thereafter. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager.",
          },
          {
            id: "vm-1-s2", num: "2", title: "Exceptions and Escalation", page: 2,
            body: "This section of the Visitor Sign-In Form covers exceptions and escalation relevant to day-to-day operations. Any queries relating to this section should be directed to the site manager or Avante Security management. Non-compliance with this section may result in a formal review under the site's disciplinary procedure.",
            points: [
              "Record the time, location, and personnel involved for every action taken.",
              "Escalate immediately if the situation falls outside your authority to resolve.",
              "Do not proceed without the required approval where one is specified.",
              "Retain supporting documentation for the period defined in the retention schedule.",
            ],
          },
        ],

      },
      {

        id: "vm-2",

        name: "Escort Policy",

        kind: "document",

        content: "5 pages",

        lastModified: "2026-04-15",
        toc: [
          {
            id: "vm-2-s1", num: "1", title: "Exceptions and Escalation", page: 1,
            body: "This section of the Escort Policy covers exceptions and escalation relevant to day-to-day operations. Any queries relating to this section should be directed to the site manager or Avante Security management. Records relating to this process must be retained for the period specified in the site retention schedule.",
          },
          {
            id: "vm-2-s2", num: "2", title: "Roles and Authority", page: 2,
            body: "This section of the Escort Policy covers roles and authority relevant to day-to-day operations. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly. All personnel are expected to be familiar with the contents of this section before commencing duties.",
            points: [
              "Escalate immediately if the situation falls outside your authority to resolve.",
              "Do not proceed without the required approval where one is specified.",
              "Retain supporting documentation for the period defined in the retention schedule.",
              "Verify identity before granting access or releasing information.",
            ],
          },
          {
            id: "vm-2-s3", num: "3", title: "Definitions", page: 3,
            body: "This section of the Escort Policy covers definitions relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. Updates to this section take effect immediately upon publication and supersede previous guidance.",
          },
          {
            id: "vm-2-s4", num: "4", title: "Related Documents", page: 4,
            body: "This section of the Escort Policy covers related documents relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly.",
          },
          {
            id: "vm-2-s5", num: "5", title: "Record Keeping", page: 5,
            body: "This section of the Escort Policy covers record keeping relevant to day-to-day operations. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager.",
            points: [
              "Verify identity before granting access or releasing information.",
              "Report any equipment faults or shortfalls before the end of the shift.",
              "Ensure all entries are legible, accurate, and completed in full.",
              "Refer unresolved issues to the duty manager without delay.",
            ],
            note: "This section may be updated following a client review. Always refer to the latest version held in the control room.",
          },
        ],

      },
      {

        id: "vm-3",

        name: "Restricted Areas Map",

        kind: "document",

        content: "4 pages",

        lastModified: "2026-04-05",
        toc: [
          {
            id: "vm-3-s1", num: "1", title: "Roles and Authority", page: 1,
            body: "This section of the Restricted Areas Map covers roles and authority relevant to day-to-day operations. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly. This requirement applies across all shifts and must be reinforced during team briefings.",
          },
          {
            id: "vm-3-s2", num: "2", title: "Definitions", page: 2,
            body: "This section of the Restricted Areas Map covers definitions relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. This process supports the wider security objectives of the site and must not be treated as optional.",
            points: [
              "Do not proceed without the required approval where one is specified.",
              "Retain supporting documentation for the period defined in the retention schedule.",
              "Verify identity before granting access or releasing information.",
              "Report any equipment faults or shortfalls before the end of the shift.",
            ],
          },
          {
            id: "vm-3-s3", num: "3", title: "Related Documents", page: 3,
            body: "This section of the Restricted Areas Map covers related documents relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. Training on this topic is delivered during induction and refreshed annually thereafter.",
          },
          {
            id: "vm-3-s4", num: "4", title: "Record Keeping", page: 4,
            body: "This section of the Restricted Areas Map covers record keeping relevant to day-to-day operations. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager. Failure to document actions taken under this section may compromise the integrity of the record.",
          },
        ],

      },
    ],
  },
  {
    id: "17",
    name: "Radio Communications",
    lastModified: "2026-04-10",
    documents: [
      {

        id: "rc-1",

        name: "Radio Codes Reference",

        kind: "document",

        content: "6 pages",

        lastModified: "2026-04-10",
        toc: [
          {
            id: "rc-1-s1", num: "1", title: "Exceptions and Escalation", page: 1,
            body: "This section of the Radio Codes Reference covers exceptions and escalation relevant to day-to-day operations. Updates to this section take effect immediately upon publication and supersede previous guidance. Officers must follow each step in order and confirm completion before proceeding to the next stage.",
          },
          {
            id: "rc-1-s2", num: "2", title: "Roles and Authority", page: 2,
            body: "This section of the Radio Codes Reference covers roles and authority relevant to day-to-day operations. Training on this topic is delivered during induction and refreshed annually thereafter. This requirement applies across all shifts and must be reinforced during team briefings.",
            points: [
              "Ensure all entries are legible, accurate, and completed in full.",
              "Refer unresolved issues to the duty manager without delay.",
              "Confirm the relevant checklist has been completed before sign-off.",
              "Notify the shift supervisor of any deviation from standard practice.",
            ],
          },
          {
            id: "rc-1-s3", num: "3", title: "Definitions", page: 3,
            body: "This section of the Radio Codes Reference covers definitions relevant to day-to-day operations. Any queries relating to this section should be directed to the site manager or Avante Security management. This process supports the wider security objectives of the site and must not be treated as optional.",
          },
          {
            id: "rc-1-s4", num: "4", title: "Related Documents", page: 4,
            body: "This section of the Radio Codes Reference covers related documents relevant to day-to-day operations. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly. Training on this topic is delivered during induction and refreshed annually thereafter.",
          },
          {
            id: "rc-1-s5", num: "5", title: "Record Keeping", page: 5,
            body: "This section of the Radio Codes Reference covers record keeping relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. Failure to document actions taken under this section may compromise the integrity of the record.",
            points: [
              "Notify the shift supervisor of any deviation from standard practice.",
              "Record the time, location, and personnel involved for every action taken.",
              "Escalate immediately if the situation falls outside your authority to resolve.",
              "Do not proceed without the required approval where one is specified.",
            ],
            note: "Officers who are unsure how to apply this section should seek clarification from their supervisor before acting.",
          },
          {
            id: "rc-1-s6", num: "6", title: "Training and Awareness", page: 6,
            body: "This section of the Radio Codes Reference covers training and awareness relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. Records relating to this process must be retained for the period specified in the site retention schedule.",
          },
        ],

      },
      {

        id: "rc-2",

        name: "Channel Assignments",

        kind: "document",

        content: "3 pages",

        lastModified: "2026-04-03",
        toc: [
          {
            id: "rc-2-s1", num: "1", title: "Roles and Authority", page: 1,
            body: "This section of the Channel Assignments covers roles and authority relevant to day-to-day operations. Training on this topic is delivered during induction and refreshed annually thereafter. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager.",
          },
          {
            id: "rc-2-s2", num: "2", title: "Definitions", page: 2,
            body: "This section of the Channel Assignments covers definitions relevant to day-to-day operations. Any queries relating to this section should be directed to the site manager or Avante Security management. Non-compliance with this section may result in a formal review under the site's disciplinary procedure.",
            points: [
              "Refer unresolved issues to the duty manager without delay.",
              "Confirm the relevant checklist has been completed before sign-off.",
              "Notify the shift supervisor of any deviation from standard practice.",
              "Record the time, location, and personnel involved for every action taken.",
            ],
          },
          {
            id: "rc-2-s3", num: "3", title: "Related Documents", page: 3,
            body: "This section of the Channel Assignments covers related documents relevant to day-to-day operations. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making.",
          },
        ],

      },
      {

        id: "rc-3",

        name: "Equipment Care Guide",

        kind: "document",

        content: "8 pages",

        lastModified: "2026-03-25",
        toc: [
          {
            id: "rc-3-s1", num: "1", title: "Definitions", page: 1,
            body: "This section of the Equipment Care Guide covers definitions relevant to day-to-day operations. Any queries relating to this section should be directed to the site manager or Avante Security management. Records relating to this process must be retained for the period specified in the site retention schedule.",
          },
          {
            id: "rc-3-s2", num: "2", title: "Related Documents", page: 2,
            body: "This section of the Equipment Care Guide covers related documents relevant to day-to-day operations. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly. All personnel are expected to be familiar with the contents of this section before commencing duties.",
            points: [
              "Confirm the relevant checklist has been completed before sign-off.",
              "Notify the shift supervisor of any deviation from standard practice.",
              "Record the time, location, and personnel involved for every action taken.",
              "Escalate immediately if the situation falls outside your authority to resolve.",
            ],
          },
          {
            id: "rc-3-s3", num: "3", title: "Record Keeping", page: 3,
            body: "This section of the Equipment Care Guide covers record keeping relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. Updates to this section take effect immediately upon publication and supersede previous guidance.",
          },
          {
            id: "rc-3-s4", num: "4", title: "Training and Awareness", page: 4,
            body: "This section of the Equipment Care Guide covers training and awareness relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly.",
          },
          {
            id: "rc-3-s5", num: "5", title: "Review Schedule", page: 5,
            body: "This section of the Equipment Care Guide covers review schedule relevant to day-to-day operations. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager.",
            points: [
              "Escalate immediately if the situation falls outside your authority to resolve.",
              "Do not proceed without the required approval where one is specified.",
              "Retain supporting documentation for the period defined in the retention schedule.",
              "Verify identity before granting access or releasing information.",
            ],
            note: "Any exception to this section must be documented and approved in writing before it is applied.",
          },
          {
            id: "rc-3-s6", num: "6", title: "Standard Practice", page: 6,
            body: "This section of the Equipment Care Guide covers standard practice relevant to day-to-day operations. Records relating to this process must be retained for the period specified in the site retention schedule. Non-compliance with this section may result in a formal review under the site's disciplinary procedure.",
          },
          {
            id: "rc-3-s7", num: "7", title: "Overview", page: 7,
            body: "This section of the Equipment Care Guide covers overview relevant to day-to-day operations. This requirement applies across all shifts and must be reinforced during team briefings. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making.",
          },
          {
            id: "rc-3-s8", num: "8", title: "Scope and Purpose", page: 8,
            body: "This section of the Equipment Care Guide covers scope and purpose relevant to day-to-day operations. Non-compliance with this section may result in a formal review under the site's disciplinary procedure. Any queries relating to this section should be directed to the site manager or Avante Security management.",
            points: [
              "Verify identity before granting access or releasing information.",
              "Report any equipment faults or shortfalls before the end of the shift.",
              "Ensure all entries are legible, accurate, and completed in full.",
              "Refer unresolved issues to the duty manager without delay.",
            ],
          },
        ],

      },
      {

        id: "rc-4",

        name: "Comms Fault Procedure",

        kind: "document",

        content: "5 pages",

        lastModified: "2026-03-15",
        toc: [
          {
            id: "rc-4-s1", num: "1", title: "Related Documents", page: 1,
            body: "This section of the Comms Fault Procedure covers related documents relevant to day-to-day operations. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly. This requirement applies across all shifts and must be reinforced during team briefings.",
          },
          {
            id: "rc-4-s2", num: "2", title: "Record Keeping", page: 2,
            body: "This section of the Comms Fault Procedure covers record keeping relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. This process supports the wider security objectives of the site and must not be treated as optional.",
            points: [
              "Notify the shift supervisor of any deviation from standard practice.",
              "Record the time, location, and personnel involved for every action taken.",
              "Escalate immediately if the situation falls outside your authority to resolve.",
              "Do not proceed without the required approval where one is specified.",
            ],
          },
          {
            id: "rc-4-s3", num: "3", title: "Training and Awareness", page: 3,
            body: "This section of the Comms Fault Procedure covers training and awareness relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. Training on this topic is delivered during induction and refreshed annually thereafter.",
          },
          {
            id: "rc-4-s4", num: "4", title: "Review Schedule", page: 4,
            body: "This section of the Comms Fault Procedure covers review schedule relevant to day-to-day operations. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager. Failure to document actions taken under this section may compromise the integrity of the record.",
          },
          {
            id: "rc-4-s5", num: "5", title: "Standard Practice", page: 5,
            body: "This section of the Comms Fault Procedure covers standard practice relevant to day-to-day operations. Records relating to this process must be retained for the period specified in the site retention schedule. Records relating to this process must be retained for the period specified in the site retention schedule.",
            points: [
              "Do not proceed without the required approval where one is specified.",
              "Retain supporting documentation for the period defined in the retention schedule.",
              "Verify identity before granting access or releasing information.",
              "Report any equipment faults or shortfalls before the end of the shift.",
            ],
            note: "This section may be updated following a client review. Always refer to the latest version held in the control room.",
          },
        ],

      },
      {

        id: "rc-5",

        name: "Handset Sign-Out Log",

        kind: "document",

        content: "2 pages",

        lastModified: "2026-03-05",
        toc: [
          {
            id: "rc-5-s1", num: "1", title: "Record Keeping", page: 1,
            body: "This section of the Handset Sign-Out Log covers record keeping relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. Non-compliance with this section may result in a formal review under the site's disciplinary procedure.",
          },
          {
            id: "rc-5-s2", num: "2", title: "Training and Awareness", page: 2,
            body: "This section of the Handset Sign-Out Log covers training and awareness relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making.",
            points: [
              "Record the time, location, and personnel involved for every action taken.",
              "Escalate immediately if the situation falls outside your authority to resolve.",
              "Do not proceed without the required approval where one is specified.",
              "Retain supporting documentation for the period defined in the retention schedule.",
            ],
          },
        ],

      },
    ],
  },
  {
    id: "20",
    name: "Contractor Induction",
    lastModified: "2026-03-20",
    documents: [
      {

        id: "ci-1",

        name: "Contractor Safety Brief",

        kind: "document",

        content: "7 pages",

        lastModified: "2026-03-20",
        toc: [
          {
            id: "ci-1-s1", num: "1", title: "Review Schedule", page: 1,
            body: "This section of the Contractor Safety Brief covers review schedule relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. Non-compliance with this section may result in a formal review under the site's disciplinary procedure.",
          },
          {
            id: "ci-1-s2", num: "2", title: "Standard Practice", page: 2,
            body: "This section of the Contractor Safety Brief covers standard practice relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making.",
            points: [
              "Refer unresolved issues to the duty manager without delay.",
              "Confirm the relevant checklist has been completed before sign-off.",
              "Notify the shift supervisor of any deviation from standard practice.",
              "Record the time, location, and personnel involved for every action taken.",
            ],
          },
          {
            id: "ci-1-s3", num: "3", title: "Overview", page: 3,
            body: "This section of the Contractor Safety Brief covers overview relevant to day-to-day operations. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager. Any queries relating to this section should be directed to the site manager or Avante Security management.",
          },
          {
            id: "ci-1-s4", num: "4", title: "Scope and Purpose", page: 4,
            body: "This section of the Contractor Safety Brief covers scope and purpose relevant to day-to-day operations. Records relating to this process must be retained for the period specified in the site retention schedule. Officers must follow each step in order and confirm completion before proceeding to the next stage.",
          },
          {
            id: "ci-1-s5", num: "5", title: "Procedure", page: 5,
            body: "This section of the Contractor Safety Brief covers procedure relevant to day-to-day operations. This requirement applies across all shifts and must be reinforced during team briefings. This requirement applies across all shifts and must be reinforced during team briefings.",
            points: [
              "Record the time, location, and personnel involved for every action taken.",
              "Escalate immediately if the situation falls outside your authority to resolve.",
              "Do not proceed without the required approval where one is specified.",
              "Retain supporting documentation for the period defined in the retention schedule.",
            ],
            note: "This section may be updated following a client review. Always refer to the latest version held in the control room.",
          },
          {
            id: "ci-1-s6", num: "6", title: "Responsibilities", page: 6,
            body: "This section of the Contractor Safety Brief covers responsibilities relevant to day-to-day operations. Non-compliance with this section may result in a formal review under the site's disciplinary procedure. This process supports the wider security objectives of the site and must not be treated as optional.",
          },
          {
            id: "ci-1-s7", num: "7", title: "Requirements", page: 7,
            body: "This section of the Contractor Safety Brief covers requirements relevant to day-to-day operations. All personnel are expected to be familiar with the contents of this section before commencing duties. Training on this topic is delivered during induction and refreshed annually thereafter.",
          },
        ],

      },
      {

        id: "ci-2",

        name: "Site Rules for Contractors",

        kind: "document",

        content: "5 pages",

        lastModified: "2026-03-12",
        toc: [
          {
            id: "ci-2-s1", num: "1", title: "Standard Practice", page: 1,
            body: "This section of the Site Rules for Contractors covers standard practice relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. All personnel are expected to be familiar with the contents of this section before commencing duties.",
          },
          {
            id: "ci-2-s2", num: "2", title: "Overview", page: 2,
            body: "This section of the Site Rules for Contractors covers overview relevant to day-to-day operations. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager. Updates to this section take effect immediately upon publication and supersede previous guidance.",
            points: [
              "Confirm the relevant checklist has been completed before sign-off.",
              "Notify the shift supervisor of any deviation from standard practice.",
              "Record the time, location, and personnel involved for every action taken.",
              "Escalate immediately if the situation falls outside your authority to resolve.",
            ],
          },
          {
            id: "ci-2-s3", num: "3", title: "Scope and Purpose", page: 3,
            body: "This section of the Site Rules for Contractors covers scope and purpose relevant to day-to-day operations. Records relating to this process must be retained for the period specified in the site retention schedule. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly.",
          },
          {
            id: "ci-2-s4", num: "4", title: "Procedure", page: 4,
            body: "This section of the Site Rules for Contractors covers procedure relevant to day-to-day operations. This requirement applies across all shifts and must be reinforced during team briefings. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager.",
          },
          {
            id: "ci-2-s5", num: "5", title: "Responsibilities", page: 5,
            body: "This section of the Site Rules for Contractors covers responsibilities relevant to day-to-day operations. Non-compliance with this section may result in a formal review under the site's disciplinary procedure. Non-compliance with this section may result in a formal review under the site's disciplinary procedure.",
            points: [
              "Escalate immediately if the situation falls outside your authority to resolve.",
              "Do not proceed without the required approval where one is specified.",
              "Retain supporting documentation for the period defined in the retention schedule.",
              "Verify identity before granting access or releasing information.",
            ],
            note: "Officers who are unsure how to apply this section should seek clarification from their supervisor before acting.",
          },
        ],

      },
      {

        id: "ci-3",

        name: "Work Permit Template",

        kind: "document",

        content: "3 pages",

        lastModified: "2026-03-05",
        toc: [
          {
            id: "ci-3-s1", num: "1", title: "Overview", page: 1,
            body: "This section of the Work Permit Template covers overview relevant to day-to-day operations. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager. This process supports the wider security objectives of the site and must not be treated as optional.",
          },
          {
            id: "ci-3-s2", num: "2", title: "Scope and Purpose", page: 2,
            body: "This section of the Work Permit Template covers scope and purpose relevant to day-to-day operations. Records relating to this process must be retained for the period specified in the site retention schedule. Training on this topic is delivered during induction and refreshed annually thereafter.",
            points: [
              "Notify the shift supervisor of any deviation from standard practice.",
              "Record the time, location, and personnel involved for every action taken.",
              "Escalate immediately if the situation falls outside your authority to resolve.",
              "Do not proceed without the required approval where one is specified.",
            ],
          },
          {
            id: "ci-3-s3", num: "3", title: "Procedure", page: 3,
            body: "This section of the Work Permit Template covers procedure relevant to day-to-day operations. This requirement applies across all shifts and must be reinforced during team briefings. Failure to document actions taken under this section may compromise the integrity of the record.",
          },
        ],

      },
      {

        id: "ci-4",

        name: "Insurance Requirements",

        kind: "document",

        content: "4 pages",

        lastModified: "2026-02-25",
        toc: [
          {
            id: "ci-4-s1", num: "1", title: "Scope and Purpose", page: 1,
            body: "This section of the Insurance Requirements covers scope and purpose relevant to day-to-day operations. Records relating to this process must be retained for the period specified in the site retention schedule. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making.",
          },
          {
            id: "ci-4-s2", num: "2", title: "Procedure", page: 2,
            body: "This section of the Insurance Requirements covers procedure relevant to day-to-day operations. This requirement applies across all shifts and must be reinforced during team briefings. Any queries relating to this section should be directed to the site manager or Avante Security management.",
            points: [
              "Record the time, location, and personnel involved for every action taken.",
              "Escalate immediately if the situation falls outside your authority to resolve.",
              "Do not proceed without the required approval where one is specified.",
              "Retain supporting documentation for the period defined in the retention schedule.",
            ],
          },
          {
            id: "ci-4-s3", num: "3", title: "Responsibilities", page: 3,
            body: "This section of the Insurance Requirements covers responsibilities relevant to day-to-day operations. Non-compliance with this section may result in a formal review under the site's disciplinary procedure. Officers must follow each step in order and confirm completion before proceeding to the next stage.",
          },
          {
            id: "ci-4-s4", num: "4", title: "Requirements", page: 4,
            body: "This section of the Insurance Requirements covers requirements relevant to day-to-day operations. All personnel are expected to be familiar with the contents of this section before commencing duties. This requirement applies across all shifts and must be reinforced during team briefings.",
          },
        ],

      },
    ],
  },
  {
    id: "22",
    name: "Incident Log Templates",
    lastModified: "2026-03-07",
    documents: [
      {

        id: "il-1",

        name: "General Incident Report",

        kind: "document",

        content: "6 pages",

        lastModified: "2026-03-07",
        toc: [
          {
            id: "il-1-s1", num: "1", title: "Exceptions and Escalation", page: 1,
            body: "This section of the General Incident Report covers exceptions and escalation relevant to day-to-day operations. Updates to this section take effect immediately upon publication and supersede previous guidance. Officers must follow each step in order and confirm completion before proceeding to the next stage.",
          },
          {
            id: "il-1-s2", num: "2", title: "Roles and Authority", page: 2,
            body: "This section of the General Incident Report covers roles and authority relevant to day-to-day operations. Training on this topic is delivered during induction and refreshed annually thereafter. This requirement applies across all shifts and must be reinforced during team briefings.",
            points: [
              "Ensure all entries are legible, accurate, and completed in full.",
              "Refer unresolved issues to the duty manager without delay.",
              "Confirm the relevant checklist has been completed before sign-off.",
              "Notify the shift supervisor of any deviation from standard practice.",
            ],
          },
          {
            id: "il-1-s3", num: "3", title: "Definitions", page: 3,
            body: "This section of the General Incident Report covers definitions relevant to day-to-day operations. Any queries relating to this section should be directed to the site manager or Avante Security management. This process supports the wider security objectives of the site and must not be treated as optional.",
          },
          {
            id: "il-1-s4", num: "4", title: "Related Documents", page: 4,
            body: "This section of the General Incident Report covers related documents relevant to day-to-day operations. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly. Training on this topic is delivered during induction and refreshed annually thereafter.",
          },
          {
            id: "il-1-s5", num: "5", title: "Record Keeping", page: 5,
            body: "This section of the General Incident Report covers record keeping relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. Failure to document actions taken under this section may compromise the integrity of the record.",
            points: [
              "Notify the shift supervisor of any deviation from standard practice.",
              "Record the time, location, and personnel involved for every action taken.",
              "Escalate immediately if the situation falls outside your authority to resolve.",
              "Do not proceed without the required approval where one is specified.",
            ],
            note: "Officers who are unsure how to apply this section should seek clarification from their supervisor before acting.",
          },
          {
            id: "il-1-s6", num: "6", title: "Training and Awareness", page: 6,
            body: "This section of the General Incident Report covers training and awareness relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. Records relating to this process must be retained for the period specified in the site retention schedule.",
          },
        ],

      },
      {

        id: "il-2",

        name: "Use of Force Report",

        kind: "document",

        content: "5 pages",

        lastModified: "2026-02-28",
        toc: [
          {
            id: "il-2-s1", num: "1", title: "Roles and Authority", page: 1,
            body: "This section of the Use of Force Report covers roles and authority relevant to day-to-day operations. Training on this topic is delivered during induction and refreshed annually thereafter. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager.",
          },
          {
            id: "il-2-s2", num: "2", title: "Definitions", page: 2,
            body: "This section of the Use of Force Report covers definitions relevant to day-to-day operations. Any queries relating to this section should be directed to the site manager or Avante Security management. Non-compliance with this section may result in a formal review under the site's disciplinary procedure.",
            points: [
              "Refer unresolved issues to the duty manager without delay.",
              "Confirm the relevant checklist has been completed before sign-off.",
              "Notify the shift supervisor of any deviation from standard practice.",
              "Record the time, location, and personnel involved for every action taken.",
            ],
          },
          {
            id: "il-2-s3", num: "3", title: "Related Documents", page: 3,
            body: "This section of the Use of Force Report covers related documents relevant to day-to-day operations. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making.",
          },
          {
            id: "il-2-s4", num: "4", title: "Record Keeping", page: 4,
            body: "This section of the Use of Force Report covers record keeping relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. Any queries relating to this section should be directed to the site manager or Avante Security management.",
          },
          {
            id: "il-2-s5", num: "5", title: "Training and Awareness", page: 5,
            body: "This section of the Use of Force Report covers training and awareness relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. Officers must follow each step in order and confirm completion before proceeding to the next stage.",
            points: [
              "Record the time, location, and personnel involved for every action taken.",
              "Escalate immediately if the situation falls outside your authority to resolve.",
              "Do not proceed without the required approval where one is specified.",
              "Retain supporting documentation for the period defined in the retention schedule.",
            ],
            note: "This requirement is subject to periodic audit by Avante Security management. Ensure full compliance at all times.",
          },
        ],

      },
      {

        id: "il-3",

        name: "Near-Miss Record",

        kind: "document",

        content: "3 pages",

        lastModified: "2026-02-18",
        toc: [
          {
            id: "il-3-s1", num: "1", title: "Definitions", page: 1,
            body: "This section of the Near-Miss Record covers definitions relevant to day-to-day operations. Any queries relating to this section should be directed to the site manager or Avante Security management. Records relating to this process must be retained for the period specified in the site retention schedule.",
          },
          {
            id: "il-3-s2", num: "2", title: "Related Documents", page: 2,
            body: "This section of the Near-Miss Record covers related documents relevant to day-to-day operations. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly. All personnel are expected to be familiar with the contents of this section before commencing duties.",
            points: [
              "Confirm the relevant checklist has been completed before sign-off.",
              "Notify the shift supervisor of any deviation from standard practice.",
              "Record the time, location, and personnel involved for every action taken.",
              "Escalate immediately if the situation falls outside your authority to resolve.",
            ],
          },
          {
            id: "il-3-s3", num: "3", title: "Record Keeping", page: 3,
            body: "This section of the Near-Miss Record covers record keeping relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. Updates to this section take effect immediately upon publication and supersede previous guidance.",
          },
        ],

      },
      {

        id: "il-4",

        name: "Property Damage Form",

        kind: "document",

        content: "4 pages",

        lastModified: "2026-02-10",
        toc: [
          {
            id: "il-4-s1", num: "1", title: "Related Documents", page: 1,
            body: "This section of the Property Damage Form covers related documents relevant to day-to-day operations. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly. This requirement applies across all shifts and must be reinforced during team briefings.",
          },
          {
            id: "il-4-s2", num: "2", title: "Record Keeping", page: 2,
            body: "This section of the Property Damage Form covers record keeping relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. This process supports the wider security objectives of the site and must not be treated as optional.",
            points: [
              "Notify the shift supervisor of any deviation from standard practice.",
              "Record the time, location, and personnel involved for every action taken.",
              "Escalate immediately if the situation falls outside your authority to resolve.",
              "Do not proceed without the required approval where one is specified.",
            ],
          },
          {
            id: "il-4-s3", num: "3", title: "Training and Awareness", page: 3,
            body: "This section of the Property Damage Form covers training and awareness relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. Training on this topic is delivered during induction and refreshed annually thereafter.",
          },
          {
            id: "il-4-s4", num: "4", title: "Review Schedule", page: 4,
            body: "This section of the Property Damage Form covers review schedule relevant to day-to-day operations. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager. Failure to document actions taken under this section may compromise the integrity of the record.",
          },
        ],

      },
      {

        id: "il-5",

        name: "Medical Incident Log",

        kind: "document",

        content: "5 pages",

        lastModified: "2026-02-01",
        toc: [
          {
            id: "il-5-s1", num: "1", title: "Record Keeping", page: 1,
            body: "This section of the Medical Incident Log covers record keeping relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. Non-compliance with this section may result in a formal review under the site's disciplinary procedure.",
          },
          {
            id: "il-5-s2", num: "2", title: "Training and Awareness", page: 2,
            body: "This section of the Medical Incident Log covers training and awareness relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making.",
            points: [
              "Record the time, location, and personnel involved for every action taken.",
              "Escalate immediately if the situation falls outside your authority to resolve.",
              "Do not proceed without the required approval where one is specified.",
              "Retain supporting documentation for the period defined in the retention schedule.",
            ],
          },
          {
            id: "il-5-s3", num: "3", title: "Review Schedule", page: 3,
            body: "This section of the Medical Incident Log covers review schedule relevant to day-to-day operations. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager. Any queries relating to this section should be directed to the site manager or Avante Security management.",
          },
          {
            id: "il-5-s4", num: "4", title: "Standard Practice", page: 4,
            body: "This section of the Medical Incident Log covers standard practice relevant to day-to-day operations. Records relating to this process must be retained for the period specified in the site retention schedule. Officers must follow each step in order and confirm completion before proceeding to the next stage.",
          },
          {
            id: "il-5-s5", num: "5", title: "Overview", page: 5,
            body: "This section of the Medical Incident Log covers overview relevant to day-to-day operations. This requirement applies across all shifts and must be reinforced during team briefings. This requirement applies across all shifts and must be reinforced during team briefings.",
            points: [
              "Retain supporting documentation for the period defined in the retention schedule.",
              "Verify identity before granting access or releasing information.",
              "Report any equipment faults or shortfalls before the end of the shift.",
              "Ensure all entries are legible, accurate, and completed in full.",
            ],
            note: "Officers who are unsure how to apply this section should seek clarification from their supervisor before acting.",
          },
        ],

      },
      {

        id: "il-6",

        name: "Theft & Loss Report",

        kind: "document",

        content: "4 pages",

        lastModified: "2026-01-22",
        toc: [
          {
            id: "il-6-s1", num: "1", title: "Training and Awareness", page: 1,
            body: "This section of the Theft & Loss Report covers training and awareness relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. All personnel are expected to be familiar with the contents of this section before commencing duties.",
          },
          {
            id: "il-6-s2", num: "2", title: "Review Schedule", page: 2,
            body: "This section of the Theft & Loss Report covers review schedule relevant to day-to-day operations. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager. Updates to this section take effect immediately upon publication and supersede previous guidance.",
            points: [
              "Escalate immediately if the situation falls outside your authority to resolve.",
              "Do not proceed without the required approval where one is specified.",
              "Retain supporting documentation for the period defined in the retention schedule.",
              "Verify identity before granting access or releasing information.",
            ],
          },
          {
            id: "il-6-s3", num: "3", title: "Standard Practice", page: 3,
            body: "This section of the Theft & Loss Report covers standard practice relevant to day-to-day operations. Records relating to this process must be retained for the period specified in the site retention schedule. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly.",
          },
          {
            id: "il-6-s4", num: "4", title: "Overview", page: 4,
            body: "This section of the Theft & Loss Report covers overview relevant to day-to-day operations. This requirement applies across all shifts and must be reinforced during team briefings. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager.",
          },
        ],

      },
      {

        id: "il-7",

        name: "CCTV Evidence Request",

        kind: "document",

        content: "3 pages",

        lastModified: "2026-01-14",
        toc: [
          {
            id: "il-7-s1", num: "1", title: "Review Schedule", page: 1,
            body: "This section of the CCTV Evidence Request covers review schedule relevant to day-to-day operations. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager. This process supports the wider security objectives of the site and must not be treated as optional.",
          },
          {
            id: "il-7-s2", num: "2", title: "Standard Practice", page: 2,
            body: "This section of the CCTV Evidence Request covers standard practice relevant to day-to-day operations. Records relating to this process must be retained for the period specified in the site retention schedule. Training on this topic is delivered during induction and refreshed annually thereafter.",
            points: [
              "Do not proceed without the required approval where one is specified.",
              "Retain supporting documentation for the period defined in the retention schedule.",
              "Verify identity before granting access or releasing information.",
              "Report any equipment faults or shortfalls before the end of the shift.",
            ],
          },
          {
            id: "il-7-s3", num: "3", title: "Overview", page: 3,
            body: "This section of the CCTV Evidence Request covers overview relevant to day-to-day operations. This requirement applies across all shifts and must be reinforced during team briefings. Failure to document actions taken under this section may compromise the integrity of the record.",
          },
        ],

      },
      {

        id: "il-8",

        name: "Witness Statement Form",

        kind: "document",

        content: "2 pages",

        lastModified: "2026-01-05",
        toc: [
          {
            id: "il-8-s1", num: "1", title: "Standard Practice", page: 1,
            body: "This section of the Witness Statement Form covers standard practice relevant to day-to-day operations. Records relating to this process must be retained for the period specified in the site retention schedule. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making.",
          },
          {
            id: "il-8-s2", num: "2", title: "Overview", page: 2,
            body: "This section of the Witness Statement Form covers overview relevant to day-to-day operations. This requirement applies across all shifts and must be reinforced during team briefings. Any queries relating to this section should be directed to the site manager or Avante Security management.",
            points: [
              "Retain supporting documentation for the period defined in the retention schedule.",
              "Verify identity before granting access or releasing information.",
              "Report any equipment faults or shortfalls before the end of the shift.",
              "Ensure all entries are legible, accurate, and completed in full.",
            ],
          },
        ],

      },
    ],
  },
];

export const TOP_LEVEL_DOCS: LibraryDoc[] = [
  {
    id: "1",
    name: "Incident Response",
    kind: "document",
    content: "13 pages",
    lastModified: "2026-06-28",
    isNew: true,
    toc: [
      {
        id: "ir1", num: "1", title: "Purpose and Scope", page: 1,
        body: "This document sets out how Avante Security personnel identify, contain, and report incidents occurring on or affecting a client site. It applies to all security-related incidents, from minor breaches of procedure to major security events requiring emergency service involvement.",
        paragraphs: [
          "An incident is any event that disrupts normal site operations, threatens the safety of people or property, or breaches the client's security procedures. This includes unauthorised access, theft, vandalism, aggressive behaviour, medical emergencies, and technical failures of security systems.",
          "This procedure supplements, but does not replace, any site-specific post orders. Where a conflict exists between this document and a site's post orders, the site-specific post orders take precedence for that site.",
        ],
        note: "This document does not cover fire evacuation, which is governed separately by the site's fire evacuation plan. Officers must be familiar with both procedures.",
      },
      {
        id: "ir2", num: "2", title: "Incident Classification", page: 2,
        body: "Incidents are classified into three tiers based on severity, each with a different response and reporting timeline. Correct classification at the outset determines who is notified and how quickly.",
        paragraphs: [
          "Tier 1 incidents are minor and pose no immediate risk to people or property — for example, a propped-open fire door or a lapsed visitor badge. Tier 2 incidents involve a moderate risk or an actual breach — for example, an unauthorised person found in a restricted area. Tier 3 incidents involve serious harm, significant loss, or an ongoing threat.",
        ],
        points: [
          "Tier 1: log in the incident register, no immediate notification required.",
          "Tier 2: notify the shift supervisor within 15 minutes of discovery.",
          "Tier 3: notify the shift supervisor and duty manager immediately, and call emergency services if required.",
          "If in doubt about which tier applies, classify upward and notify your supervisor.",
        ],
      },
      {
        id: "ir3", num: "3", title: "Initial Response Procedure", page: 3,
        body: "The first officer on scene is responsible for immediate safety and containment. This means protecting people first, then property, then evidence — in that order.",
        paragraphs: [
          "Officers must not place themselves at risk to protect property. If a situation appears to involve violence or a weapon, officers must withdraw to a safe distance and contact the control room immediately rather than intervening directly.",
        ],
        subsections: [
          {
            id: "ir3a",
            title: "On-Site Containment",
            body: "Containment means limiting the incident's impact — securing the area, preventing further access, and keeping bystanders clear — without compromising the officer's own safety.",
            points: [
              "Establish a safe perimeter around the incident location.",
              "Prevent unauthorised persons from entering or leaving the area.",
              "Do not move or touch items unless necessary for safety.",
              "Remain at the scene until relieved or instructed otherwise by the shift supervisor.",
            ],
          },
          {
            id: "ir3b",
            title: "Notifying the Control Room",
            body: "The control room must be notified as soon as it is safe to do so, using the site's primary communication channel. The notification should be brief, factual, and immediate — full detail can follow once the scene is secure.",
            points: [
              "State your location, the nature of the incident, and whether anyone is injured.",
              "Confirm whether emergency services have been or need to be called.",
              "Remain contactable — do not switch off your radio during an active incident.",
            ],
            note: "If the control room cannot be reached, escalate directly to the shift supervisor's mobile number listed in the site contact sheet.",
          },
        ],
      },
      {
        id: "ir4", num: "4", title: "Reporting Requirements", page: 6,
        body: "Every incident, regardless of tier, must be documented in the incident register. Tier 2 and Tier 3 incidents additionally require a full written report submitted through the Avante incident reporting portal.",
        paragraphs: [
          "Reports must be factual and free of assumption or opinion. Describe what was observed and what actions were taken — do not speculate about motive or intent.",
          "Photographs may be taken to support a report where it is safe and appropriate to do so, in line with the site's CCTV and imagery policy. Images must be uploaded to the incident record, not stored on personal devices.",
        ],
        continuationPages: [
          {
            paragraphs: [
              "Reports must be submitted within two hours of the end of the shift on which the incident occurred, or immediately for Tier 3 incidents. Late reports must include a written explanation for the delay.",
              "Where more than one officer was involved in responding to an incident, each officer submits an individual account. Accounts should not be discussed or aligned between officers before submission.",
            ],
            points: [
              "Include the exact time the incident was first observed or reported.",
              "Include the names of all personnel and, where known, all other parties involved.",
              "Attach any supporting photographs or CCTV reference numbers.",
              "Sign and date the report before submission.",
            ],
            note: "An incomplete or unsigned report will be returned for correction and does not count as submitted until resubmitted.",
          },
        ],
      },
      {
        id: "ir5", num: "5", title: "Escalation Criteria", page: 8,
        body: "Certain circumstances require escalation beyond the shift supervisor, regardless of the incident's initial tier classification. Escalation ensures the right level of authority is engaged quickly when a situation has wider implications.",
        points: [
          "Any incident involving injury requiring medical attention beyond basic first aid.",
          "Any incident likely to attract media or public attention.",
          "Any incident involving an allegation against an Avante employee.",
          "Any incident where the client specifically requests escalation.",
        ],
        note: "When in doubt about whether to escalate, escalate. It is always preferable to stand an escalation down than to have acted too late.",
      },
      {
        id: "ir6", num: "6", title: "Communication During an Incident", page: 9,
        body: "Clear communication during an active incident prevents confusion and duplicated effort. All officers involved should use the designated incident channel where one has been declared by the control room.",
        subsections: [
          {
            id: "ir6a",
            title: "Internal Communication",
            body: "Internal updates should be concise and structured: what has happened, what is being done, and what is needed. Avoid speculation over the radio, and never discuss an ongoing incident on an open channel if sensitive details are involved.",
            points: [
              "Use plain language — avoid codes unless the site's communication plan specifies them for this situation.",
              "Give a status update at least every 10 minutes during an active incident.",
              "Confirm when the incident has been resolved or handed over.",
            ],
          },
        ],
      },
      {
        id: "ir7", num: "7", title: "Evidence Preservation", page: 11,
        body: "Where an incident may lead to disciplinary, legal, or police action, preserving evidence correctly is critical. Officers should treat the immediate area as a scene to be protected until instructed otherwise.",
        paragraphs: [
          "Do not clean, repair, or otherwise disturb the area of an incident until authorised to do so by the shift supervisor or, where police are involved, by the attending officer.",
          "CCTV footage relevant to an incident must be flagged for retention immediately — standard footage retention cycles will otherwise overwrite it automatically.",
        ],
      },
      {
        id: "ir8", num: "8", title: "Post-Incident Review", page: 12,
        body: "Every Tier 2 and Tier 3 incident is reviewed by the shift supervisor within 48 hours. The purpose of the review is to confirm the response was appropriate and to identify any improvements needed, not to assign blame.",
        paragraphs: [
          "The review considers response time, adherence to procedure, and the clarity of communication during the incident. Findings are recorded against the incident and shared with the site team where relevant lessons apply.",
        ],
        note: "Reviews are a learning tool. Officers are encouraged to raise concerns about their own response honestly — this is not treated as an admission of fault.",
      },
      {
        id: "ir9", num: "9", title: "Roles and Responsibilities", page: 13,
        body: "Clear ownership at each stage of an incident prevents gaps in response. This section summarises who is responsible for what during and after an incident.",
        points: [
          "First officer on scene: safety, containment, and initial notification.",
          "Shift supervisor: coordination, escalation decisions, and initial review.",
          "Duty manager: client liaison and Tier 3 incident oversight.",
          "Control room: logging, communication relay, and CCTV retention.",
        ],
      },
    ],
  },
  {
    id: "3",
    name: "Security Protocols",
    kind: "document",
    content: "12 pages",
    lastModified: "2026-06-20",
    isNew: true,
    toc: [
      {
        id: "top-3-s1", num: "1", title: "Reporting", page: 1,
        body: "This section of the Security Protocols covers reporting relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. Non-compliance with this section may result in a formal review under the site's disciplinary procedure.",
      },
      {
        id: "top-3-s2", num: "2", title: "Exceptions and Escalation", page: 2,
        body: "This section of the Security Protocols covers exceptions and escalation relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making.",
        points: [
          "Record the time, location, and personnel involved for every action taken.",
          "Escalate immediately if the situation falls outside your authority to resolve.",
          "Do not proceed without the required approval where one is specified.",
          "Retain supporting documentation for the period defined in the retention schedule.",
        ],
      },
      {
        id: "top-3-s3", num: "3", title: "Roles and Authority", page: 3,
        body: "This section of the Security Protocols covers roles and authority relevant to day-to-day operations. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager. Any queries relating to this section should be directed to the site manager or Avante Security management.",
      },
      {
        id: "top-3-s4", num: "4", title: "Definitions", page: 4,
        body: "This section of the Security Protocols covers definitions relevant to day-to-day operations. Records relating to this process must be retained for the period specified in the site retention schedule. Officers must follow each step in order and confirm completion before proceeding to the next stage.",
      },
      {
        id: "top-3-s5", num: "5", title: "Related Documents", page: 5,
        body: "This section of the Security Protocols covers related documents relevant to day-to-day operations. This requirement applies across all shifts and must be reinforced during team briefings. This requirement applies across all shifts and must be reinforced during team briefings.",
        points: [
          "Retain supporting documentation for the period defined in the retention schedule.",
          "Verify identity before granting access or releasing information.",
          "Report any equipment faults or shortfalls before the end of the shift.",
          "Ensure all entries are legible, accurate, and completed in full.",
        ],
        note: "Officers who are unsure how to apply this section should seek clarification from their supervisor before acting.",
      },
      {
        id: "top-3-s6", num: "6", title: "Record Keeping", page: 6,
        body: "This section of the Security Protocols covers record keeping relevant to day-to-day operations. Non-compliance with this section may result in a formal review under the site's disciplinary procedure. This process supports the wider security objectives of the site and must not be treated as optional.",
      },
      {
        id: "top-3-s7", num: "7", title: "Training and Awareness", page: 7,
        body: "This section of the Security Protocols covers training and awareness relevant to day-to-day operations. All personnel are expected to be familiar with the contents of this section before commencing duties. Training on this topic is delivered during induction and refreshed annually thereafter.",
      },
      {
        id: "top-3-s8", num: "8", title: "Review Schedule", page: 8,
        body: "This section of the Security Protocols covers review schedule relevant to day-to-day operations. This process supports the wider security objectives of the site and must not be treated as optional. Failure to document actions taken under this section may compromise the integrity of the record.",
        points: [
          "Ensure all entries are legible, accurate, and completed in full.",
          "Refer unresolved issues to the duty manager without delay.",
          "Confirm the relevant checklist has been completed before sign-off.",
          "Notify the shift supervisor of any deviation from standard practice.",
        ],
      },
      {
        id: "top-3-s9", num: "9", title: "Standard Practice", page: 9,
        body: "This section of the Security Protocols covers standard practice relevant to day-to-day operations. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making. Records relating to this process must be retained for the period specified in the site retention schedule.",
      },
      {
        id: "top-3-s10", num: "10", title: "Overview", page: 10,
        body: "This section of the Security Protocols covers overview relevant to day-to-day operations. Updates to this section take effect immediately upon publication and supersede previous guidance. All personnel are expected to be familiar with the contents of this section before commencing duties.",
        note: "This requirement is subject to periodic audit by Avante Security management. Ensure full compliance at all times.",
      },
      {
        id: "top-3-s11", num: "11", title: "Scope and Purpose", page: 11,
        body: "This section of the Security Protocols covers scope and purpose relevant to day-to-day operations. Training on this topic is delivered during induction and refreshed annually thereafter. Updates to this section take effect immediately upon publication and supersede previous guidance.",
        points: [
          "Notify the shift supervisor of any deviation from standard practice.",
          "Record the time, location, and personnel involved for every action taken.",
          "Escalate immediately if the situation falls outside your authority to resolve.",
          "Do not proceed without the required approval where one is specified.",
        ],
      },
      {
        id: "top-3-s12", num: "12", title: "Procedure", page: 12,
        body: "This section of the Security Protocols covers procedure relevant to day-to-day operations. Any queries relating to this section should be directed to the site manager or Avante Security management. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly.",
      },
    ],
  },
  {
    id: "5",
    name: "Emergency Procedures",
    kind: "document",
    content: "8 pages",
    lastModified: "2026-06-15",
    toc: [
      {
        id: "top-5-s1", num: "1", title: "Roles and Authority", page: 1,
        body: "This section of the Emergency Procedures covers roles and authority relevant to day-to-day operations. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager. This process supports the wider security objectives of the site and must not be treated as optional.",
      },
      {
        id: "top-5-s2", num: "2", title: "Definitions", page: 2,
        body: "This section of the Emergency Procedures covers definitions relevant to day-to-day operations. Records relating to this process must be retained for the period specified in the site retention schedule. Training on this topic is delivered during induction and refreshed annually thereafter.",
        points: [
          "Do not proceed without the required approval where one is specified.",
          "Retain supporting documentation for the period defined in the retention schedule.",
          "Verify identity before granting access or releasing information.",
          "Report any equipment faults or shortfalls before the end of the shift.",
        ],
      },
      {
        id: "top-5-s3", num: "3", title: "Related Documents", page: 3,
        body: "This section of the Emergency Procedures covers related documents relevant to day-to-day operations. This requirement applies across all shifts and must be reinforced during team briefings. Failure to document actions taken under this section may compromise the integrity of the record.",
      },
      {
        id: "top-5-s4", num: "4", title: "Record Keeping", page: 4,
        body: "This section of the Emergency Procedures covers record keeping relevant to day-to-day operations. Non-compliance with this section may result in a formal review under the site's disciplinary procedure. Records relating to this process must be retained for the period specified in the site retention schedule.",
      },
      {
        id: "top-5-s5", num: "5", title: "Training and Awareness", page: 5,
        body: "This section of the Emergency Procedures covers training and awareness relevant to day-to-day operations. All personnel are expected to be familiar with the contents of this section before commencing duties. All personnel are expected to be familiar with the contents of this section before commencing duties.",
        points: [
          "Report any equipment faults or shortfalls before the end of the shift.",
          "Ensure all entries are legible, accurate, and completed in full.",
          "Refer unresolved issues to the duty manager without delay.",
          "Confirm the relevant checklist has been completed before sign-off.",
        ],
        note: "Any exception to this section must be documented and approved in writing before it is applied.",
      },
      {
        id: "top-5-s6", num: "6", title: "Review Schedule", page: 6,
        body: "This section of the Emergency Procedures covers review schedule relevant to day-to-day operations. This process supports the wider security objectives of the site and must not be treated as optional. Updates to this section take effect immediately upon publication and supersede previous guidance.",
      },
      {
        id: "top-5-s7", num: "7", title: "Standard Practice", page: 7,
        body: "This section of the Emergency Procedures covers standard practice relevant to day-to-day operations. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly.",
      },
      {
        id: "top-5-s8", num: "8", title: "Overview", page: 8,
        body: "This section of the Emergency Procedures covers overview relevant to day-to-day operations. Updates to this section take effect immediately upon publication and supersede previous guidance. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager.",
        points: [
          "Confirm the relevant checklist has been completed before sign-off.",
          "Notify the shift supervisor of any deviation from standard practice.",
          "Record the time, location, and personnel involved for every action taken.",
          "Escalate immediately if the situation falls outside your authority to resolve.",
        ],
      },
    ],
  },
  {
    id: "6",
    name: "Client Communication",
    kind: "document",
    content: "6 pages",
    lastModified: "2026-06-10",
    toc: [
      {
        id: "top-6-s1", num: "1", title: "Definitions", page: 1,
        body: "This section of the Client Communication covers definitions relevant to day-to-day operations. Records relating to this process must be retained for the period specified in the site retention schedule. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making.",
      },
      {
        id: "top-6-s2", num: "2", title: "Related Documents", page: 2,
        body: "This section of the Client Communication covers related documents relevant to day-to-day operations. This requirement applies across all shifts and must be reinforced during team briefings. Any queries relating to this section should be directed to the site manager or Avante Security management.",
        points: [
          "Retain supporting documentation for the period defined in the retention schedule.",
          "Verify identity before granting access or releasing information.",
          "Report any equipment faults or shortfalls before the end of the shift.",
          "Ensure all entries are legible, accurate, and completed in full.",
        ],
      },
      {
        id: "top-6-s3", num: "3", title: "Record Keeping", page: 3,
        body: "This section of the Client Communication covers record keeping relevant to day-to-day operations. Non-compliance with this section may result in a formal review under the site's disciplinary procedure. Officers must follow each step in order and confirm completion before proceeding to the next stage.",
      },
      {
        id: "top-6-s4", num: "4", title: "Training and Awareness", page: 4,
        body: "This section of the Client Communication covers training and awareness relevant to day-to-day operations. All personnel are expected to be familiar with the contents of this section before commencing duties. This requirement applies across all shifts and must be reinforced during team briefings.",
      },
      {
        id: "top-6-s5", num: "5", title: "Review Schedule", page: 5,
        body: "This section of the Client Communication covers review schedule relevant to day-to-day operations. This process supports the wider security objectives of the site and must not be treated as optional. This process supports the wider security objectives of the site and must not be treated as optional.",
        points: [
          "Ensure all entries are legible, accurate, and completed in full.",
          "Refer unresolved issues to the duty manager without delay.",
          "Confirm the relevant checklist has been completed before sign-off.",
          "Notify the shift supervisor of any deviation from standard practice.",
        ],
        note: "This section may be updated following a client review. Always refer to the latest version held in the control room.",
      },
      {
        id: "top-6-s6", num: "6", title: "Standard Practice", page: 6,
        body: "This section of the Client Communication covers standard practice relevant to day-to-day operations. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making. Training on this topic is delivered during induction and refreshed annually thereafter.",
      },
    ],
  },
  {
    id: "7",
    name: "Patrol Guidelines",
    kind: "document",
    content: "10 pages",
    lastModified: "2026-06-08",
    toc: [
      {
        id: "top-7-s1", num: "1", title: "Related Documents", page: 1,
        body: "This section of the Patrol Guidelines covers related documents relevant to day-to-day operations. This requirement applies across all shifts and must be reinforced during team briefings. Updates to this section take effect immediately upon publication and supersede previous guidance.",
      },
      {
        id: "top-7-s2", num: "2", title: "Record Keeping", page: 2,
        body: "This section of the Patrol Guidelines covers record keeping relevant to day-to-day operations. Non-compliance with this section may result in a formal review under the site's disciplinary procedure. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly.",
        points: [
          "Verify identity before granting access or releasing information.",
          "Report any equipment faults or shortfalls before the end of the shift.",
          "Ensure all entries are legible, accurate, and completed in full.",
          "Refer unresolved issues to the duty manager without delay.",
        ],
      },
      {
        id: "top-7-s3", num: "3", title: "Training and Awareness", page: 3,
        body: "This section of the Patrol Guidelines covers training and awareness relevant to day-to-day operations. All personnel are expected to be familiar with the contents of this section before commencing duties. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager.",
      },
      {
        id: "top-7-s4", num: "4", title: "Review Schedule", page: 4,
        body: "This section of the Patrol Guidelines covers review schedule relevant to day-to-day operations. This process supports the wider security objectives of the site and must not be treated as optional. Non-compliance with this section may result in a formal review under the site's disciplinary procedure.",
      },
      {
        id: "top-7-s5", num: "5", title: "Standard Practice", page: 5,
        body: "This section of the Patrol Guidelines covers standard practice relevant to day-to-day operations. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making.",
        points: [
          "Refer unresolved issues to the duty manager without delay.",
          "Confirm the relevant checklist has been completed before sign-off.",
          "Notify the shift supervisor of any deviation from standard practice.",
          "Record the time, location, and personnel involved for every action taken.",
        ],
        note: "Officers who are unsure how to apply this section should seek clarification from their supervisor before acting.",
      },
      {
        id: "top-7-s6", num: "6", title: "Overview", page: 6,
        body: "This section of the Patrol Guidelines covers overview relevant to day-to-day operations. Updates to this section take effect immediately upon publication and supersede previous guidance. Any queries relating to this section should be directed to the site manager or Avante Security management.",
      },
      {
        id: "top-7-s7", num: "7", title: "Scope and Purpose", page: 7,
        body: "This section of the Patrol Guidelines covers scope and purpose relevant to day-to-day operations. Training on this topic is delivered during induction and refreshed annually thereafter. Officers must follow each step in order and confirm completion before proceeding to the next stage.",
      },
      {
        id: "top-7-s8", num: "8", title: "Procedure", page: 8,
        body: "This section of the Patrol Guidelines covers procedure relevant to day-to-day operations. Any queries relating to this section should be directed to the site manager or Avante Security management. This requirement applies across all shifts and must be reinforced during team briefings.",
        points: [
          "Record the time, location, and personnel involved for every action taken.",
          "Escalate immediately if the situation falls outside your authority to resolve.",
          "Do not proceed without the required approval where one is specified.",
          "Retain supporting documentation for the period defined in the retention schedule.",
        ],
      },
      {
        id: "top-7-s9", num: "9", title: "Responsibilities", page: 9,
        body: "This section of the Patrol Guidelines covers responsibilities relevant to day-to-day operations. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly. This process supports the wider security objectives of the site and must not be treated as optional.",
      },
      {
        id: "top-7-s10", num: "10", title: "Requirements", page: 10,
        body: "This section of the Patrol Guidelines covers requirements relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. Training on this topic is delivered during induction and refreshed annually thereafter.",
        note: "This requirement is subject to periodic audit by Avante Security management. Ensure full compliance at all times.",
      },
    ],
  },
  {
    id: "9",
    name: "First Aid Reference",
    kind: "document",
    content: "5 pages",
    lastModified: "2026-05-30",
    toc: [
      {
        id: "top-9-s1", num: "1", title: "Training and Awareness", page: 1,
        body: "This section of the First Aid Reference covers training and awareness relevant to day-to-day operations. All personnel are expected to be familiar with the contents of this section before commencing duties. Any queries relating to this section should be directed to the site manager or Avante Security management.",
      },
      {
        id: "top-9-s2", num: "2", title: "Review Schedule", page: 2,
        body: "This section of the First Aid Reference covers review schedule relevant to day-to-day operations. This process supports the wider security objectives of the site and must not be treated as optional. Officers must follow each step in order and confirm completion before proceeding to the next stage.",
        points: [
          "Ensure all entries are legible, accurate, and completed in full.",
          "Refer unresolved issues to the duty manager without delay.",
          "Confirm the relevant checklist has been completed before sign-off.",
          "Notify the shift supervisor of any deviation from standard practice.",
        ],
      },
      {
        id: "top-9-s3", num: "3", title: "Standard Practice", page: 3,
        body: "This section of the First Aid Reference covers standard practice relevant to day-to-day operations. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making. This requirement applies across all shifts and must be reinforced during team briefings.",
      },
      {
        id: "top-9-s4", num: "4", title: "Overview", page: 4,
        body: "This section of the First Aid Reference covers overview relevant to day-to-day operations. Updates to this section take effect immediately upon publication and supersede previous guidance. This process supports the wider security objectives of the site and must not be treated as optional.",
      },
      {
        id: "top-9-s5", num: "5", title: "Scope and Purpose", page: 5,
        body: "This section of the First Aid Reference covers scope and purpose relevant to day-to-day operations. Training on this topic is delivered during induction and refreshed annually thereafter. Training on this topic is delivered during induction and refreshed annually thereafter.",
        points: [
          "Notify the shift supervisor of any deviation from standard practice.",
          "Record the time, location, and personnel involved for every action taken.",
          "Escalate immediately if the situation falls outside your authority to resolve.",
          "Do not proceed without the required approval where one is specified.",
        ],
        note: "Any exception to this section must be documented and approved in writing before it is applied.",
      },
    ],
  },
  {
    id: "11",
    name: "Post Incident Report",
    kind: "document",
    content: "3 pages",
    lastModified: "2026-05-18",
    toc: [
      {
        id: "top-11-s1", num: "1", title: "Roles and Authority", page: 1,
        body: "This section of the Post Incident Report covers roles and authority relevant to day-to-day operations. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making. Failure to document actions taken under this section may compromise the integrity of the record.",
      },
      {
        id: "top-11-s2", num: "2", title: "Definitions", page: 2,
        body: "This section of the Post Incident Report covers definitions relevant to day-to-day operations. Updates to this section take effect immediately upon publication and supersede previous guidance. Records relating to this process must be retained for the period specified in the site retention schedule.",
        points: [
          "Refer unresolved issues to the duty manager without delay.",
          "Confirm the relevant checklist has been completed before sign-off.",
          "Notify the shift supervisor of any deviation from standard practice.",
          "Record the time, location, and personnel involved for every action taken.",
        ],
      },
      {
        id: "top-11-s3", num: "3", title: "Related Documents", page: 3,
        body: "This section of the Post Incident Report covers related documents relevant to day-to-day operations. Training on this topic is delivered during induction and refreshed annually thereafter. All personnel are expected to be familiar with the contents of this section before commencing duties.",
      },
    ],
  },
  {
    id: "13",
    name: "CCTV Operations",
    kind: "document",
    content: "7 pages",
    lastModified: "2026-05-05",
    toc: [
      {
        id: "top-13-s1", num: "1", title: "Related Documents", page: 1,
        body: "This section of the CCTV Operations covers related documents relevant to day-to-day operations. Training on this topic is delivered during induction and refreshed annually thereafter. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager.",
      },
      {
        id: "top-13-s2", num: "2", title: "Record Keeping", page: 2,
        body: "This section of the CCTV Operations covers record keeping relevant to day-to-day operations. Any queries relating to this section should be directed to the site manager or Avante Security management. Non-compliance with this section may result in a formal review under the site's disciplinary procedure.",
        points: [
          "Notify the shift supervisor of any deviation from standard practice.",
          "Record the time, location, and personnel involved for every action taken.",
          "Escalate immediately if the situation falls outside your authority to resolve.",
          "Do not proceed without the required approval where one is specified.",
        ],
      },
      {
        id: "top-13-s3", num: "3", title: "Training and Awareness", page: 3,
        body: "This section of the CCTV Operations covers training and awareness relevant to day-to-day operations. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making.",
      },
      {
        id: "top-13-s4", num: "4", title: "Review Schedule", page: 4,
        body: "This section of the CCTV Operations covers review schedule relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. Any queries relating to this section should be directed to the site manager or Avante Security management.",
      },
      {
        id: "top-13-s5", num: "5", title: "Standard Practice", page: 5,
        body: "This section of the CCTV Operations covers standard practice relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. Officers must follow each step in order and confirm completion before proceeding to the next stage.",
        points: [
          "Do not proceed without the required approval where one is specified.",
          "Retain supporting documentation for the period defined in the retention schedule.",
          "Verify identity before granting access or releasing information.",
          "Report any equipment faults or shortfalls before the end of the shift.",
        ],
        note: "This requirement is subject to periodic audit by Avante Security management. Ensure full compliance at all times.",
      },
      {
        id: "top-13-s6", num: "6", title: "Overview", page: 6,
        body: "This section of the CCTV Operations covers overview relevant to day-to-day operations. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager. This requirement applies across all shifts and must be reinforced during team briefings.",
      },
      {
        id: "top-13-s7", num: "7", title: "Scope and Purpose", page: 7,
        body: "This section of the CCTV Operations covers scope and purpose relevant to day-to-day operations. Records relating to this process must be retained for the period specified in the site retention schedule. This process supports the wider security objectives of the site and must not be treated as optional.",
      },
    ],
  },
  {
    id: "15",
    name: "Night Shift Protocols",
    kind: "document",
    content: "9 pages",
    lastModified: "2026-04-22",
    toc: [
      {
        id: "top-15-s1", num: "1", title: "Training and Awareness", page: 1,
        body: "This section of the Night Shift Protocols covers training and awareness relevant to day-to-day operations. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly. This requirement applies across all shifts and must be reinforced during team briefings.",
      },
      {
        id: "top-15-s2", num: "2", title: "Review Schedule", page: 2,
        body: "This section of the Night Shift Protocols covers review schedule relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. This process supports the wider security objectives of the site and must not be treated as optional.",
        points: [
          "Escalate immediately if the situation falls outside your authority to resolve.",
          "Do not proceed without the required approval where one is specified.",
          "Retain supporting documentation for the period defined in the retention schedule.",
          "Verify identity before granting access or releasing information.",
        ],
      },
      {
        id: "top-15-s3", num: "3", title: "Standard Practice", page: 3,
        body: "This section of the Night Shift Protocols covers standard practice relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. Training on this topic is delivered during induction and refreshed annually thereafter.",
      },
      {
        id: "top-15-s4", num: "4", title: "Overview", page: 4,
        body: "This section of the Night Shift Protocols covers overview relevant to day-to-day operations. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager. Failure to document actions taken under this section may compromise the integrity of the record.",
      },
      {
        id: "top-15-s5", num: "5", title: "Scope and Purpose", page: 5,
        body: "This section of the Night Shift Protocols covers scope and purpose relevant to day-to-day operations. Records relating to this process must be retained for the period specified in the site retention schedule. Records relating to this process must be retained for the period specified in the site retention schedule.",
        points: [
          "Verify identity before granting access or releasing information.",
          "Report any equipment faults or shortfalls before the end of the shift.",
          "Ensure all entries are legible, accurate, and completed in full.",
          "Refer unresolved issues to the duty manager without delay.",
        ],
        note: "This section may be updated following a client review. Always refer to the latest version held in the control room.",
      },
      {
        id: "top-15-s6", num: "6", title: "Procedure", page: 6,
        body: "This section of the Night Shift Protocols covers procedure relevant to day-to-day operations. This requirement applies across all shifts and must be reinforced during team briefings. All personnel are expected to be familiar with the contents of this section before commencing duties.",
      },
      {
        id: "top-15-s7", num: "7", title: "Responsibilities", page: 7,
        body: "This section of the Night Shift Protocols covers responsibilities relevant to day-to-day operations. Non-compliance with this section may result in a formal review under the site's disciplinary procedure. Updates to this section take effect immediately upon publication and supersede previous guidance.",
      },
      {
        id: "top-15-s8", num: "8", title: "Requirements", page: 8,
        body: "This section of the Night Shift Protocols covers requirements relevant to day-to-day operations. All personnel are expected to be familiar with the contents of this section before commencing duties. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly.",
        points: [
          "Refer unresolved issues to the duty manager without delay.",
          "Confirm the relevant checklist has been completed before sign-off.",
          "Notify the shift supervisor of any deviation from standard practice.",
          "Record the time, location, and personnel involved for every action taken.",
        ],
      },
      {
        id: "top-15-s9", num: "9", title: "Compliance", page: 9,
        body: "This section of the Night Shift Protocols covers compliance relevant to day-to-day operations. This process supports the wider security objectives of the site and must not be treated as optional. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager.",
      },
    ],
  },
  {
    id: "16",
    name: "Key Handover Log",
    kind: "document",
    content: "4 pages",
    lastModified: "2026-04-15",
    toc: [
      {
        id: "top-16-s1", num: "1", title: "Review Schedule", page: 1,
        body: "This section of the Key Handover Log covers review schedule relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. Non-compliance with this section may result in a formal review under the site's disciplinary procedure.",
      },
      {
        id: "top-16-s2", num: "2", title: "Standard Practice", page: 2,
        body: "This section of the Key Handover Log covers standard practice relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making.",
        points: [
          "Do not proceed without the required approval where one is specified.",
          "Retain supporting documentation for the period defined in the retention schedule.",
          "Verify identity before granting access or releasing information.",
          "Report any equipment faults or shortfalls before the end of the shift.",
        ],
      },
      {
        id: "top-16-s3", num: "3", title: "Overview", page: 3,
        body: "This section of the Key Handover Log covers overview relevant to day-to-day operations. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager. Any queries relating to this section should be directed to the site manager or Avante Security management.",
      },
      {
        id: "top-16-s4", num: "4", title: "Scope and Purpose", page: 4,
        body: "This section of the Key Handover Log covers scope and purpose relevant to day-to-day operations. Records relating to this process must be retained for the period specified in the site retention schedule. Officers must follow each step in order and confirm completion before proceeding to the next stage.",
      },
    ],
  },
  {
    id: "18",
    name: "Fire Evacuation Plan",
    kind: "document",
    content: "6 pages",
    lastModified: "2026-04-03",
    toc: [
      {
        id: "top-18-s1", num: "1", title: "Overview", page: 1,
        body: "This section of the Fire Evacuation Plan covers overview relevant to day-to-day operations. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager. This process supports the wider security objectives of the site and must not be treated as optional.",
      },
      {
        id: "top-18-s2", num: "2", title: "Scope and Purpose", page: 2,
        body: "This section of the Fire Evacuation Plan covers scope and purpose relevant to day-to-day operations. Records relating to this process must be retained for the period specified in the site retention schedule. Training on this topic is delivered during induction and refreshed annually thereafter.",
        points: [
          "Verify identity before granting access or releasing information.",
          "Report any equipment faults or shortfalls before the end of the shift.",
          "Ensure all entries are legible, accurate, and completed in full.",
          "Refer unresolved issues to the duty manager without delay.",
        ],
      },
      {
        id: "top-18-s3", num: "3", title: "Procedure", page: 3,
        body: "This section of the Fire Evacuation Plan covers procedure relevant to day-to-day operations. This requirement applies across all shifts and must be reinforced during team briefings. Failure to document actions taken under this section may compromise the integrity of the record.",
      },
      {
        id: "top-18-s4", num: "4", title: "Responsibilities", page: 4,
        body: "This section of the Fire Evacuation Plan covers responsibilities relevant to day-to-day operations. Non-compliance with this section may result in a formal review under the site's disciplinary procedure. Records relating to this process must be retained for the period specified in the site retention schedule.",
      },
      {
        id: "top-18-s5", num: "5", title: "Requirements", page: 5,
        body: "This section of the Fire Evacuation Plan covers requirements relevant to day-to-day operations. All personnel are expected to be familiar with the contents of this section before commencing duties. All personnel are expected to be familiar with the contents of this section before commencing duties.",
        points: [
          "Refer unresolved issues to the duty manager without delay.",
          "Confirm the relevant checklist has been completed before sign-off.",
          "Notify the shift supervisor of any deviation from standard practice.",
          "Record the time, location, and personnel involved for every action taken.",
        ],
        note: "Any exception to this section must be documented and approved in writing before it is applied.",
      },
      {
        id: "top-18-s6", num: "6", title: "Compliance", page: 6,
        body: "This section of the Fire Evacuation Plan covers compliance relevant to day-to-day operations. This process supports the wider security objectives of the site and must not be treated as optional. Updates to this section take effect immediately upon publication and supersede previous guidance.",
      },
    ],
  },
  {
    id: "19",
    name: "Threat Assessment",
    kind: "document",
    content: "11 pages",
    lastModified: "2026-03-28",
    toc: [
      {
        id: "top-19-s1", num: "1", title: "Scope and Purpose", page: 1,
        body: "This section of the Threat Assessment covers scope and purpose relevant to day-to-day operations. Records relating to this process must be retained for the period specified in the site retention schedule. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making.",
      },
      {
        id: "top-19-s2", num: "2", title: "Procedure", page: 2,
        body: "This section of the Threat Assessment covers procedure relevant to day-to-day operations. This requirement applies across all shifts and must be reinforced during team briefings. Any queries relating to this section should be directed to the site manager or Avante Security management.",
        points: [
          "Report any equipment faults or shortfalls before the end of the shift.",
          "Ensure all entries are legible, accurate, and completed in full.",
          "Refer unresolved issues to the duty manager without delay.",
          "Confirm the relevant checklist has been completed before sign-off.",
        ],
      },
      {
        id: "top-19-s3", num: "3", title: "Responsibilities", page: 3,
        body: "This section of the Threat Assessment covers responsibilities relevant to day-to-day operations. Non-compliance with this section may result in a formal review under the site's disciplinary procedure. Officers must follow each step in order and confirm completion before proceeding to the next stage.",
      },
      {
        id: "top-19-s4", num: "4", title: "Requirements", page: 4,
        body: "This section of the Threat Assessment covers requirements relevant to day-to-day operations. All personnel are expected to be familiar with the contents of this section before commencing duties. This requirement applies across all shifts and must be reinforced during team briefings.",
      },
      {
        id: "top-19-s5", num: "5", title: "Compliance", page: 5,
        body: "This section of the Threat Assessment covers compliance relevant to day-to-day operations. This process supports the wider security objectives of the site and must not be treated as optional. This process supports the wider security objectives of the site and must not be treated as optional.",
        points: [
          "Confirm the relevant checklist has been completed before sign-off.",
          "Notify the shift supervisor of any deviation from standard practice.",
          "Record the time, location, and personnel involved for every action taken.",
          "Escalate immediately if the situation falls outside your authority to resolve.",
        ],
        note: "This section may be updated following a client review. Always refer to the latest version held in the control room.",
      },
      {
        id: "top-19-s6", num: "6", title: "Reporting", page: 6,
        body: "This section of the Threat Assessment covers reporting relevant to day-to-day operations. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making. Training on this topic is delivered during induction and refreshed annually thereafter.",
      },
      {
        id: "top-19-s7", num: "7", title: "Exceptions and Escalation", page: 7,
        body: "This section of the Threat Assessment covers exceptions and escalation relevant to day-to-day operations. Updates to this section take effect immediately upon publication and supersede previous guidance. Failure to document actions taken under this section may compromise the integrity of the record.",
      },
      {
        id: "top-19-s8", num: "8", title: "Roles and Authority", page: 8,
        body: "This section of the Threat Assessment covers roles and authority relevant to day-to-day operations. Training on this topic is delivered during induction and refreshed annually thereafter. Records relating to this process must be retained for the period specified in the site retention schedule.",
        points: [
          "Escalate immediately if the situation falls outside your authority to resolve.",
          "Do not proceed without the required approval where one is specified.",
          "Retain supporting documentation for the period defined in the retention schedule.",
          "Verify identity before granting access or releasing information.",
        ],
      },
      {
        id: "top-19-s9", num: "9", title: "Definitions", page: 9,
        body: "This section of the Threat Assessment covers definitions relevant to day-to-day operations. Any queries relating to this section should be directed to the site manager or Avante Security management. All personnel are expected to be familiar with the contents of this section before commencing duties.",
      },
      {
        id: "top-19-s10", num: "10", title: "Related Documents", page: 10,
        body: "This section of the Threat Assessment covers related documents relevant to day-to-day operations. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly. Updates to this section take effect immediately upon publication and supersede previous guidance.",
        note: "Officers who are unsure how to apply this section should seek clarification from their supervisor before acting.",
      },
      {
        id: "top-19-s11", num: "11", title: "Record Keeping", page: 11,
        body: "This section of the Threat Assessment covers record keeping relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly.",
        points: [
          "Verify identity before granting access or releasing information.",
          "Report any equipment faults or shortfalls before the end of the shift.",
          "Ensure all entries are legible, accurate, and completed in full.",
          "Refer unresolved issues to the duty manager without delay.",
        ],
      },
    ],
  },
  {
    id: "21",
    name: "Uniform & Equipment",
    kind: "document",
    content: "5 pages",
    lastModified: "2026-03-14",
    toc: [
      {
        id: "top-21-s1", num: "1", title: "Definitions", page: 1,
        body: "This section of the Uniform & Equipment covers definitions relevant to day-to-day operations. Updates to this section take effect immediately upon publication and supersede previous guidance. Officers must follow each step in order and confirm completion before proceeding to the next stage.",
      },
      {
        id: "top-21-s2", num: "2", title: "Related Documents", page: 2,
        body: "This section of the Uniform & Equipment covers related documents relevant to day-to-day operations. Training on this topic is delivered during induction and refreshed annually thereafter. This requirement applies across all shifts and must be reinforced during team briefings.",
        points: [
          "Confirm the relevant checklist has been completed before sign-off.",
          "Notify the shift supervisor of any deviation from standard practice.",
          "Record the time, location, and personnel involved for every action taken.",
          "Escalate immediately if the situation falls outside your authority to resolve.",
        ],
      },
      {
        id: "top-21-s3", num: "3", title: "Record Keeping", page: 3,
        body: "This section of the Uniform & Equipment covers record keeping relevant to day-to-day operations. Any queries relating to this section should be directed to the site manager or Avante Security management. This process supports the wider security objectives of the site and must not be treated as optional.",
      },
      {
        id: "top-21-s4", num: "4", title: "Training and Awareness", page: 4,
        body: "This section of the Uniform & Equipment covers training and awareness relevant to day-to-day operations. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly. Training on this topic is delivered during induction and refreshed annually thereafter.",
      },
      {
        id: "top-21-s5", num: "5", title: "Review Schedule", page: 5,
        body: "This section of the Uniform & Equipment covers review schedule relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. Failure to document actions taken under this section may compromise the integrity of the record.",
        points: [
          "Escalate immediately if the situation falls outside your authority to resolve.",
          "Do not proceed without the required approval where one is specified.",
          "Retain supporting documentation for the period defined in the retention schedule.",
          "Verify identity before granting access or releasing information.",
        ],
        note: "Officers who are unsure how to apply this section should seek clarification from their supervisor before acting.",
      },
    ],
  },
  {
    id: "23",
    name: "Control Room Procedures",
    kind: "document",
    content: "14 pages",
    lastModified: "2026-02-28",
    toc: [
      {
        id: "top-23-s1", num: "1", title: "Record Keeping", page: 1,
        body: "This section of the Control Room Procedures covers record keeping relevant to day-to-day operations. Any queries relating to this section should be directed to the site manager or Avante Security management. Records relating to this process must be retained for the period specified in the site retention schedule.",
      },
      {
        id: "top-23-s2", num: "2", title: "Training and Awareness", page: 2,
        body: "This section of the Control Room Procedures covers training and awareness relevant to day-to-day operations. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly. All personnel are expected to be familiar with the contents of this section before commencing duties.",
        points: [
          "Record the time, location, and personnel involved for every action taken.",
          "Escalate immediately if the situation falls outside your authority to resolve.",
          "Do not proceed without the required approval where one is specified.",
          "Retain supporting documentation for the period defined in the retention schedule.",
        ],
      },
      {
        id: "top-23-s3", num: "3", title: "Review Schedule", page: 3,
        body: "This section of the Control Room Procedures covers review schedule relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. Updates to this section take effect immediately upon publication and supersede previous guidance.",
      },
      {
        id: "top-23-s4", num: "4", title: "Standard Practice", page: 4,
        body: "This section of the Control Room Procedures covers standard practice relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly.",
      },
      {
        id: "top-23-s5", num: "5", title: "Overview", page: 5,
        body: "This section of the Control Room Procedures covers overview relevant to day-to-day operations. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager.",
        points: [
          "Retain supporting documentation for the period defined in the retention schedule.",
          "Verify identity before granting access or releasing information.",
          "Report any equipment faults or shortfalls before the end of the shift.",
          "Ensure all entries are legible, accurate, and completed in full.",
        ],
        note: "Any exception to this section must be documented and approved in writing before it is applied.",
      },
      {
        id: "top-23-s6", num: "6", title: "Scope and Purpose", page: 6,
        body: "This section of the Control Room Procedures covers scope and purpose relevant to day-to-day operations. Records relating to this process must be retained for the period specified in the site retention schedule. Non-compliance with this section may result in a formal review under the site's disciplinary procedure.",
      },
      {
        id: "top-23-s7", num: "7", title: "Procedure", page: 7,
        body: "This section of the Control Room Procedures covers procedure relevant to day-to-day operations. This requirement applies across all shifts and must be reinforced during team briefings. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making.",
      },
      {
        id: "top-23-s8", num: "8", title: "Responsibilities", page: 8,
        body: "This section of the Control Room Procedures covers responsibilities relevant to day-to-day operations. Non-compliance with this section may result in a formal review under the site's disciplinary procedure. Any queries relating to this section should be directed to the site manager or Avante Security management.",
        points: [
          "Ensure all entries are legible, accurate, and completed in full.",
          "Refer unresolved issues to the duty manager without delay.",
          "Confirm the relevant checklist has been completed before sign-off.",
          "Notify the shift supervisor of any deviation from standard practice.",
        ],
      },
      {
        id: "top-23-s9", num: "9", title: "Requirements", page: 9,
        body: "This section of the Control Room Procedures covers requirements relevant to day-to-day operations. All personnel are expected to be familiar with the contents of this section before commencing duties. Officers must follow each step in order and confirm completion before proceeding to the next stage.",
      },
      {
        id: "top-23-s10", num: "10", title: "Compliance", page: 10,
        body: "This section of the Control Room Procedures covers compliance relevant to day-to-day operations. This process supports the wider security objectives of the site and must not be treated as optional. This requirement applies across all shifts and must be reinforced during team briefings.",
        note: "This section may be updated following a client review. Always refer to the latest version held in the control room.",
      },
      {
        id: "top-23-s11", num: "11", title: "Reporting", page: 11,
        body: "This section of the Control Room Procedures covers reporting relevant to day-to-day operations. Where responsibilities overlap between roles, the more senior officer takes precedence for decision-making. This process supports the wider security objectives of the site and must not be treated as optional.",
        points: [
          "Notify the shift supervisor of any deviation from standard practice.",
          "Record the time, location, and personnel involved for every action taken.",
          "Escalate immediately if the situation falls outside your authority to resolve.",
          "Do not proceed without the required approval where one is specified.",
        ],
      },
      {
        id: "top-23-s12", num: "12", title: "Exceptions and Escalation", page: 12,
        body: "This section of the Control Room Procedures covers exceptions and escalation relevant to day-to-day operations. Updates to this section take effect immediately upon publication and supersede previous guidance. Training on this topic is delivered during induction and refreshed annually thereafter.",
      },
      {
        id: "top-23-s13", num: "13", title: "Roles and Authority", page: 13,
        body: "This section of the Control Room Procedures covers roles and authority relevant to day-to-day operations. Training on this topic is delivered during induction and refreshed annually thereafter. Failure to document actions taken under this section may compromise the integrity of the record.",
      },
      {
        id: "top-23-s14", num: "14", title: "Definitions", page: 14,
        body: "This section of the Control Room Procedures covers definitions relevant to day-to-day operations. Any queries relating to this section should be directed to the site manager or Avante Security management. Records relating to this process must be retained for the period specified in the site retention schedule.",
        points: [
          "Do not proceed without the required approval where one is specified.",
          "Retain supporting documentation for the period defined in the retention schedule.",
          "Verify identity before granting access or releasing information.",
          "Report any equipment faults or shortfalls before the end of the shift.",
        ],
      },
    ],
  },
  {
    id: "24",
    name: "Lone Worker Policy",
    kind: "document",
    content: "6 pages",
    lastModified: "2026-02-20",
    toc: [
      {
        id: "top-24-s1", num: "1", title: "Training and Awareness", page: 1,
        body: "This section of the Lone Worker Policy covers training and awareness relevant to day-to-day operations. This section forms part of the site-specific procedures agreed with the client and must be followed accordingly. This requirement applies across all shifts and must be reinforced during team briefings.",
      },
      {
        id: "top-24-s2", num: "2", title: "Review Schedule", page: 2,
        body: "This section of the Lone Worker Policy covers review schedule relevant to day-to-day operations. Failure to document actions taken under this section may compromise the integrity of the record. This process supports the wider security objectives of the site and must not be treated as optional.",
        points: [
          "Escalate immediately if the situation falls outside your authority to resolve.",
          "Do not proceed without the required approval where one is specified.",
          "Retain supporting documentation for the period defined in the retention schedule.",
          "Verify identity before granting access or releasing information.",
        ],
      },
      {
        id: "top-24-s3", num: "3", title: "Standard Practice", page: 3,
        body: "This section of the Lone Worker Policy covers standard practice relevant to day-to-day operations. Officers must follow each step in order and confirm completion before proceeding to the next stage. Training on this topic is delivered during induction and refreshed annually thereafter.",
      },
      {
        id: "top-24-s4", num: "4", title: "Overview", page: 4,
        body: "This section of the Lone Worker Policy covers overview relevant to day-to-day operations. Any deviation from this procedure must be approved in advance by the shift supervisor or duty manager. Failure to document actions taken under this section may compromise the integrity of the record.",
      },
      {
        id: "top-24-s5", num: "5", title: "Scope and Purpose", page: 5,
        body: "This section of the Lone Worker Policy covers scope and purpose relevant to day-to-day operations. Records relating to this process must be retained for the period specified in the site retention schedule. Records relating to this process must be retained for the period specified in the site retention schedule.",
        points: [
          "Verify identity before granting access or releasing information.",
          "Report any equipment faults or shortfalls before the end of the shift.",
          "Ensure all entries are legible, accurate, and completed in full.",
          "Refer unresolved issues to the duty manager without delay.",
        ],
        note: "This section may be updated following a client review. Always refer to the latest version held in the control room.",
      },
      {
        id: "top-24-s6", num: "6", title: "Procedure", page: 6,
        body: "This section of the Lone Worker Policy covers procedure relevant to day-to-day operations. This requirement applies across all shifts and must be reinforced during team briefings. All personnel are expected to be familiar with the contents of this section before commencing duties.",
      },
    ],
  },
];

export function getFolderById(id: string): LibraryFolder | undefined {
  return FOLDERS.find((f) => f.id === id);
}

export function getDocById(id: string): { doc: LibraryDoc; folder?: LibraryFolder } | undefined {
  for (const folder of FOLDERS) {
    const doc = folder.documents.find((d) => d.id === id);
    if (doc) return { doc, folder };
  }
  const topLevelDoc = TOP_LEVEL_DOCS.find((d) => d.id === id);
  if (topLevelDoc) return { doc: topLevelDoc };
  return undefined;
}

export type FoundSection = {
  id: string;
  num: string;
  title: string;
  body: string;
  paragraphs?: string[];
  points?: string[];
  note?: string;
  /** Set when the found section is a subsection — its parent section's title. */
  parentTitle?: string;
};

/** Finds a top-level section or subsection by id anywhere in a document's toc — used to preview a chat citation without opening the full file viewer. */
export function findSection(doc: LibraryDoc, sectionId: string): FoundSection | undefined {
  for (const s of doc.toc ?? []) {
    if (s.id === sectionId) {
      return { id: s.id, num: s.num, title: s.title, body: s.body, paragraphs: s.paragraphs, points: s.points, note: s.note };
    }
    const subIdx = s.subsections?.findIndex((sub) => sub.id === sectionId) ?? -1;
    if (subIdx !== -1) {
      const sub = s.subsections![subIdx];
      return {
        id: sub.id,
        num: `${s.num}.${subIdx + 1}`,
        title: sub.title,
        body: sub.body,
        paragraphs: sub.paragraphs,
        points: sub.points,
        note: sub.note,
        parentTitle: s.title,
      };
    }
  }
  return undefined;
}

/**
 * Documents added or updated within the last `days` days — the document half of
 * the dashboard recency feed. Sorted most-recent first. Pairs with
 * getRecentModules() in training-mock; the feed is a pure recency view,
 * independent of required/optional status.
 */
export function getRecentDocuments(days = 14): LibraryDoc[] {
  const fromFolders = FOLDERS.flatMap((f) => f.documents);
  return [...TOP_LEVEL_DOCS, ...fromFolders]
    .filter((d) => isWithinDays(d.lastModified, days))
    .sort((a, b) => daysSince(a.lastModified) - daysSince(b.lastModified));
}
