"use client";

import { useEffect } from "react";
import { X, Check, ArrowRight } from "lucide-react";
import { ROLE_LABEL, type Role } from "@/lib/user-mock";

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
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const info = ROLE_INFO[toRole];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-scrim" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="relative w-[440px] max-w-[calc(100vw-32px)] rounded-[12px] bg-surface-raised p-6 flex flex-col gap-5"
        style={{ boxShadow: "var(--shadow-modal-panel)", animation: "modal-in 200ms cubic-bezier(0.32,0.72,0,1) both" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors duration-100"
          aria-label="Close"
        >
          <X size={15} />
        </button>

        <div className="flex flex-col gap-2">
          <h2 className="text-[20px] leading-[28px] font-semibold text-foreground pr-6">Change {name}’s role?</h2>
          <div className="flex items-center gap-2 text-[14px] leading-[20px] text-muted-foreground">
            <span className="font-medium text-foreground">{ROLE_LABEL[fromRole]}</span>
            <ArrowRight size={15} strokeWidth={1.5} />
            <span className="font-medium text-foreground">{ROLE_LABEL[toRole]}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-[8px] p-4 bg-surface-chip" style={{ border: "1px solid var(--border)" }}>
          <span className="text-[12px] leading-[16px] font-semibold uppercase tracking-wider text-muted-foreground">
            As {ROLE_LABEL[toRole]}, they can
          </span>
          <ul className="flex flex-col gap-2">
            {info.gains.map((g) => (
              <li key={g} className="flex items-start gap-2 text-[14px] leading-[20px] text-foreground">
                <Check size={16} strokeWidth={1.5} className="mt-0.5 shrink-0" style={{ color: "var(--success)" }} />
                <span>{g}</span>
              </li>
            ))}
          </ul>
          <p className="text-[13px] leading-[18px] text-muted-foreground">{info.note}</p>
        </div>

        <div className="flex items-center justify-between">
          <button onClick={onClose} className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-100 px-1">
            Cancel
          </button>
          <button onClick={onConfirm} className="h-9 px-4 rounded-lg text-[13px] font-semibold bg-primary text-primary-foreground transition-opacity duration-100 hover:opacity-90">
            Change role
          </button>
        </div>
      </div>
    </div>
  );
}
