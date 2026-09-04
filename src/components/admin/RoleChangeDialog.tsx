"use client";

import { Check, ArrowRight } from "lucide-react";
import { ROLE_LABEL, type Role } from "@/lib/user-mock";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

/** What each role can do — shown before a role change is committed, so the
 *  admin understands the capabilities (or restrictions) they're granting. */
const ROLE_INFO: Record<Role, { gains: string[]; note: string }> = {
  admin: {
    gains: [
      "Manage content — create, edit, and publish documents and modules",
      "Manage people — invite users, change roles, deactivate accounts",
      "Review flagged responses and read the activity log",
    ],
    note: "Keeps full access to training, AI chat, and the library.",
  },
  "field-agent": {
    gains: [
      "AI chat, the knowledge library, and training for their role",
    ],
    note: "Loses all admin access — content management, people, and reports.",
  },
};

/**
 * Confirms a role change before it commits, spelling out what the new role can
 * (and can't) do. Modal chrome follows the documented spec: scrim, scale-in,
 * outside-click and Escape close, body scroll lock.
 */
export function RoleChangeDialog({
  name, fromRole, toRole, onConfirm, onClose,
}: {
  name: string;
  fromRole: Role;
  toRole: Role;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const info = ROLE_INFO[toRole];

  return (
    <Modal open onClose={onClose} title={`Change ${name}\u2019s role?`} className="w-[440px]">
      <div className="flex items-center gap-2 type-label text-muted-foreground -mt-3">
        <span className="font-medium text-foreground">{ROLE_LABEL[fromRole]}</span>
        <ArrowRight size={15} strokeWidth={1.5} />
        <span className="font-medium text-foreground">{ROLE_LABEL[toRole]}</span>
      </div>

      <div className="flex flex-col gap-3 rounded-[8px] p-4 bg-surface-chip" style={{ border: "1px solid var(--border)" }}>
        <span className="type-caption font-semibold uppercase tracking-wider text-muted-foreground">
          As {ROLE_LABEL[toRole]}, they can
        </span>
        <ul className="flex flex-col gap-2">
          {info.gains.map((g) => (
            <li key={g} className="flex items-start gap-2 type-label text-foreground">
              <Check size={16} strokeWidth={1.5} className="mt-0.5 shrink-0" style={{ color: "var(--success)" }} />
              <span>{g}</span>
            </li>
          ))}
        </ul>
        <p className="type-meta text-muted-foreground">{info.note}</p>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          className="min-h-11 -ml-1 px-1 type-meta font-medium text-muted-foreground hover:text-foreground transition-colors duration-100"
        >
          Cancel
        </button>
        <Button size="cta" onClick={onConfirm}>
          Change role
        </Button>
      </div>
    </Modal>
  );
}
