"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PinInput } from "@/components/ui/pin-input";
import { ProgressDonut } from "@/components/ui/progress-donut";
import { showToast } from "@/components/ui/toast";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { completeActivation } from "@/lib/auth-mock";
import { USER } from "@/lib/user-mock";

const MIN_PASSWORD_LENGTH = 8;
const TOTAL_STEPS = 3; // 1 verify PIN · 2 create password · 3 profile setup

/**
 * First-run activation: Avante issues a one-time PIN; the user verifies it,
 * sets a personal password (used for every sign-in after this), and continues
 * into profile setup. Forward-only stepper — a verified PIN is never re-asked.
 */
export default function ActivatePage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 — verify PIN
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");

  // Step 2 — create password. Requirements are shown up front (not hidden in a
  // tooltip) so the user knows exactly what "strong" needs — NIST 800-63B leans
  // on clear guidance + length; we additionally require the composition below
  // because activation issues a shared-device credential. The meter/word carry
  // the strength colour; the field itself stays neutral (red = real error only).
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const passwordRules = [
    { label: `${MIN_PASSWORD_LENGTH}+ characters`, ok: password.length >= MIN_PASSWORD_LENGTH },
    { label: "Upper & lowercase", ok: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: "1 number", ok: /[0-9]/.test(password) },
    { label: "1 symbol", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const metCount = passwordRules.filter((r) => r.ok).length;
  const strength: "weak" | "medium" | "strong" =
    metCount === passwordRules.length ? "strong" : metCount >= 2 ? "medium" : "weak";
  const STRENGTH = {
    weak: { label: "Weak", color: "var(--destructive)", segments: 1 },
    medium: { label: "Medium", color: "var(--warning)", segments: 2 },
    strong: { label: "Strong", color: "var(--primary)", segments: 3 },
  } as const;
  // "Strong" (all requirements) is required to continue.
  const passwordOk = strength === "strong";

  // Presentation gating: each step's button enables once its fields are filled
  // in a valid shape (email has "@", PIN is 6 digits, password meets the length
  // rule) — but any dummy values pass. The PIN/email aren't checked against a
  // real account; the flow just advances.
  const emailLooksValid = email.includes("@");
  const emailError = email.length > 0 && !emailLooksValid;
  const step1Valid = emailLooksValid && pin.length === 6;

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!step1Valid) return;
    setStep(2);
  }

  function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordOk) return;
    // Establish the session so the app opens after profile setup.
    completeActivation(password);
    setStep(3);
  }

  function finishOnboarding() {
    showToast({ title: `Welcome, ${USER.firstName}.`, description: "Your account is ready." });
    router.push("/dashboard");
  }

  return (
    <div
      className="w-full max-w-[400px] flex flex-col gap-6"
      style={{ animation: "msg-in 200ms ease-out both" }}
    >
      {/* Back to sign in — first row, above everything (step 1 only; the
          stepper is forward-only once the PIN is verified) */}
      {step === 1 && (
        <Link
          href="/sign-in"
          className="flex items-center gap-1.5 w-fit text-[13px] leading-[20px] text-muted-foreground hover:text-foreground transition-colors duration-100"
        >
          <ArrowLeft size={14} strokeWidth={2} />
          <span>Back to sign in</span>
        </Link>
      )}

      {/* Progress + title (the brand lives in the auth layout). The step count
          reads from the same ring indicator as the dashboard readiness board,
          with "[x] of [y]" in the centre instead of a percentage. */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[22px] leading-[30px] lg:text-[28px] lg:leading-[36px] font-bold text-foreground min-w-0">
          {step === 1 ? "Activate your account" : step === 2 ? "Create your password" : "Set up your profile"}
        </h1>
        <ProgressDonut
          value={(step / TOTAL_STEPS) * 100}
          label={`${step} of ${TOTAL_STEPS}`}
          ariaLabel={`Step ${step} of ${TOTAL_STEPS}`}
          size={52}
          stroke={4}
          labelClassName="text-[11px] font-semibold"
        />
      </div>

      {step === 3 ? (
        <div key="profile" style={{ animation: "msg-in 200ms ease-out both" }}>
          <ProfileForm mode="onboarding" onDone={finishOnboarding} />
        </div>
      ) : step === 1 ? (
        <form
          key="verify"
          onSubmit={handleVerify}
          className="flex flex-col gap-1"
          style={{ animation: "msg-in 200ms ease-out both" }}
          noValidate
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[14px] leading-[20px] font-semibold text-foreground">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="name@avante.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`h-12 bg-surface ${emailError ? "field-error" : ""}`}
            />
            {/* Reserved message line — always present so the form never jumps */}
            <p aria-live="polite" className="min-h-[16px] text-[12px] leading-[16px] text-destructive">
              {emailError ? "Enter a valid email address." : ""}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] leading-[20px] font-semibold text-foreground">PIN</label>
            <PinInput value={pin} onChange={setPin} />
            <p className="text-[12px] leading-[16px] text-muted-foreground">
              Your PIN was issued by Avante — ask your manager if you don&apos;t have one.
            </p>
          </div>

          <Button type="submit" size="cta" className="w-full mt-3" disabled={!step1Valid}>
            Verify PIN
          </Button>
        </form>
      ) : (
        <form
          key="password"
          onSubmit={handleSetPassword}
          className="flex flex-col gap-1"
          style={{ animation: "msg-in 200ms ease-out both" }}
          noValidate
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="new-password" className="text-[14px] leading-[20px] font-semibold text-foreground">
              New password
            </label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                autoFocus
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-surface pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex items-center justify-center w-11 text-muted-foreground hover:text-foreground transition-colors duration-100"
              >
                {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
              </button>
            </div>
            {/* Strength meter + word — always rendered (its height is reserved)
                so nothing jumps when the assessment appears. Fill and word show
                only once typing starts; the meter/word carry the colour, the
                field stays neutral. */}
            <div
              className="flex items-center gap-3"
              style={{ visibility: password.length > 0 ? "visible" : "hidden" }}
            >
              <div className="flex-1 flex gap-1.5" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 flex-1 rounded-full transition-colors duration-150"
                    style={{
                      background: i < STRENGTH[strength].segments ? STRENGTH[strength].color : "var(--progress-track)",
                    }}
                  />
                ))}
              </div>
              <span
                aria-live="polite"
                className="text-[12px] leading-[16px] font-semibold shrink-0 tabular-nums text-right min-w-[3.5rem]"
                style={{ color: STRENGTH[strength].color }}
              >
                {STRENGTH[strength].label}
              </span>
            </div>

            {/* Requirements — all four are required for "strong". Read-only
                status tags: ring-outlined, no fill (so dark shows no background
                and light gets a visible ring). Short + borderless-fill so they
                don't read as inputs or tappable filter pills. Met = green ring +
                check; unmet = neutral ring, muted text. */}
            <ul className="grid grid-cols-2 gap-2 pt-0.5">
              {passwordRules.map((r) => (
                <li
                  key={r.label}
                  aria-label={`${r.label} — ${r.ok ? "met" : "not met"}`}
                  className="flex items-center justify-between gap-2 h-8 px-2.5 rounded-[8px] border text-[12px] leading-[16px] font-medium transition-colors duration-150"
                  style={
                    r.ok
                      ? { borderColor: "color-mix(in srgb, var(--primary) 45%, transparent)", color: "var(--primary)" }
                      : { borderColor: "var(--border)", color: "var(--muted-foreground)" }
                  }
                >
                  <span className="truncate">{r.label}</span>
                  {r.ok && <Check size={14} strokeWidth={2.5} className="shrink-0" />}
                </li>
              ))}
            </ul>
          </div>

          <Button type="submit" size="cta" className="w-full mt-3" disabled={!passwordOk}>
            Set password
          </Button>
        </form>
      )}
    </div>
  );
}
