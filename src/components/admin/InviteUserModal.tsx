"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FilterSelect } from "@/components/ui/filter-select";
import { showToast } from "@/components/ui/toast";
import { PinCode } from "@/components/admin/PinDialog";
import { inviteUser } from "@/lib/admin-store";
import { ROLE_LABEL, type Role } from "@/lib/user-mock";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

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

  function submit() {
    if (!email.includes("@")) {
      setEmailError(true);
      showToast({ tone: "error", title: "Couldn't send invite", description: "Enter a valid email address." });
      return;
    }
    const { pin } = inviteUser({ email, role });
    setResult({ pin, email: email.trim() });
  }

  // Two views in one dialog, so the TITLE has to change with them — a static
  // title would leave a screen reader announcing "Invite user" over a screen
  // that now shows a created invitation.
  return result ? (
    <Modal
      open
      onClose={onClose}
      title="Invitation created"
      description={`Share this PIN with ${result.email}. They activate at the sign-in screen. A live system emails it.`}
    >
      <PinCode pin={result.pin} />
      <div className="flex justify-end">
        <Button size="cta" onClick={onClose}>
          Done
        </Button>
      </div>
    </Modal>
  ) : (
    <Modal
      open
      onClose={onClose}
      title="Invite user"
      description="They get a one-time PIN to activate their account."
    >
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
        <button
          onClick={onClose}
          className="min-h-11 -ml-1 px-1 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-100"
        >
          Cancel
        </button>
        <Button size="cta" onClick={submit}>
          <Check size={14} /> Send invite
        </Button>
      </div>
    </Modal>
  );
}
