"use client";

import { useEffect, useState } from "react";
import { X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FilterSelect } from "@/components/ui/filter-select";
import { showToast } from "@/components/ui/toast";
import { PinCode } from "@/components/admin/PinDialog";
import { inviteUser } from "@/lib/admin-store";
import { ROLE_LABEL, type Role } from "@/lib/user-mock";

const ROLE_OPTIONS = [
  { value: "field-agent", label: ROLE_LABEL["field-agent"] },
  { value: "admin", label: ROLE_LABEL.admin },
];

/**
 * Invite a user. Creates a staff record with status "invited" and issues a
 * one-time PIN. A real backend emails the PIN; the demo shows it here. The
 * invited person then uses the existing /activate flow (email + PIN).
 * Modal chrome follows the documented spec: scrim, scale-in, outside-click and
 * Escape close, body scroll lock.
 */
export function InviteUserModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("field-agent");
  const [emailError, setEmailError] = useState(false);
  const [result, setResult] = useState<{ pin: string; email: string } | null>(null);

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

  function submit() {
    if (!email.includes("@")) {
      setEmailError(true);
      showToast({ title: "Check the email", description: "Enter a valid email address." });
      return;
    }
    const { pin } = inviteUser({ email, role });
    setResult({ pin, email: email.trim() });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-scrim" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="relative w-[380px] max-w-[calc(100vw-32px)] rounded-[12px] bg-surface-raised p-6 flex flex-col gap-5"
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

        {result ? (
          <>
            <div className="flex flex-col gap-1">
              <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">Invitation created</h2>
              <p className="text-[14px] leading-[20px] text-muted-foreground">
                Share this PIN with {result.email}. They activate at the sign-in screen. A live system emails it.
              </p>
            </div>
            <PinCode pin={result.pin} />
            <div className="flex justify-end">
              <button onClick={onClose} className="h-9 px-4 rounded-lg text-[13px] font-semibold bg-primary text-primary-foreground transition-opacity duration-100 hover:opacity-90">
                Done
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">Invite user</h2>
              <p className="text-[14px] leading-[20px] text-muted-foreground">They get a one-time PIN to activate their account.</p>
            </div>

            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-[14px] leading-[20px] font-semibold text-foreground">Email</span>
                <Input
                  type="email"
                  autoFocus
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(false); }}
                  placeholder="name@avante.security"
                  className={emailError ? "field-error" : undefined}
                  aria-invalid={emailError}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[14px] leading-[20px] font-semibold text-foreground">Role</span>
                <FilterSelect value={role} onChange={(v) => setRole(v as Role)} options={ROLE_OPTIONS} />
              </label>
            </div>

            <div className="flex items-center justify-between">
              <button onClick={onClose} className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-100 px-1">
                Cancel
              </button>
              <button onClick={submit} className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-[13px] font-semibold bg-primary text-primary-foreground transition-opacity duration-100 hover:opacity-90">
                <Check size={14} /> Send invite
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
