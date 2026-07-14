"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PinInput } from "@/components/ui/pin-input";
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

  // Step 2 — create password
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const passwordOk = password.length >= MIN_PASSWORD_LENGTH;

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
      className="w-full max-w-[400px] rounded-[12px] p-6 flex flex-col gap-6 bg-surface-raised"
      style={{ border: "1px solid var(--border)", boxShadow: "var(--card-glow-shadow)" }}
    >
      {/* Brand + stepper */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <span className="text-[16px] leading-[22px] font-semibold tracking-tight" style={{ color: "var(--primary)" }}>
            Cortex
          </span>
          <span className="text-[12px] leading-[16px] text-muted-foreground">Avante Security</span>
        </div>

        {/* Step progress — same segmented idiom as the readiness board */}
        <div className="flex flex-col gap-2">
          <div
            className="flex gap-1.5"
            role="progressbar"
            aria-valuenow={step}
            aria-valuemax={TOTAL_STEPS}
            aria-label={`Step ${step} of ${TOTAL_STEPS}`}
          >
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className="h-1.5 flex-1 rounded-full transition-colors duration-300"
                style={{ background: i < step ? "var(--primary)" : "var(--border)" }}
              />
            ))}
          </div>
          <p className="text-[12px] leading-[16px] text-muted-foreground tabular-nums">
            Step {step} of {TOTAL_STEPS}
          </p>
        </div>

        <h1 className="text-[22px] leading-[30px] font-bold text-foreground">
          {step === 1 ? "Activate your account" : step === 2 ? "Create your password" : "Set up your profile"}
        </h1>
      </div>

      {step === 3 ? (
        <div key="profile" style={{ animation: "msg-in 200ms ease-out both" }}>
          <ProfileForm mode="onboarding" onDone={finishOnboarding} />
        </div>
      ) : step === 1 ? (
        <form
          key="verify"
          onSubmit={handleVerify}
          className="flex flex-col gap-4"
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`h-10 bg-surface ${emailError ? "field-error" : ""}`}
            />
            {emailError && (
              <p className="text-[12px] leading-[16px] text-destructive">
                Enter a valid email address.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] leading-[20px] font-semibold text-foreground">PIN</label>
            <PinInput value={pin} onChange={setPin} />
            <p className="text-[12px] leading-[16px] text-muted-foreground">
              Your PIN was issued by Avante — ask your manager if you don&apos;t have one.
            </p>
          </div>

          <Button type="submit" size="cta" className="w-full mt-1" disabled={!step1Valid}>
            Verify PIN
          </Button>

          <Link
            href="/sign-in"
            className="flex items-center gap-1.5 w-fit text-[13px] leading-[20px] text-muted-foreground hover:text-foreground transition-colors duration-100"
          >
            <ArrowLeft size={14} strokeWidth={2} />
            <span>Back to sign in</span>
          </Link>
        </form>
      ) : (
        <form
          key="password"
          onSubmit={handleSetPassword}
          className="flex flex-col gap-4"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 bg-surface pr-11"
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
            {/* The rule lives up front, not in an error message */}
            <p
              className={`flex items-center gap-1.5 text-[12px] leading-[16px] transition-colors duration-100 ${
                passwordOk ? "font-medium" : "text-muted-foreground"
              }`}
              style={passwordOk ? { color: "var(--primary)" } : undefined}
            >
              {passwordOk && <Check size={13} strokeWidth={2.5} />}
              At least {MIN_PASSWORD_LENGTH} characters
            </p>
          </div>

          <p className="text-[12px] leading-[16px] text-muted-foreground">
            You&apos;ll use this password to sign in from now on.
          </p>

          <Button type="submit" size="cta" className="w-full mt-1" disabled={!passwordOk}>
            Set password
          </Button>
        </form>
      )}
    </div>
  );
}
