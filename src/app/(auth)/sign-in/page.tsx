"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { demoSignIn, isSignedIn } from "@/lib/auth-mock";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Already signed in → straight to the app.
  useEffect(() => {
    if (isSignedIn()) router.replace("/dashboard");
  }, [router]);

  // Presentation gating: both fields must be filled and the email must look
  // like one (contain "@") to enable the button — but any dummy values pass.
  // We never check the credentials themselves; the button just opens the app.
  const emailLooksValid = email.includes("@");
  const emailError = email.length > 0 && !emailLooksValid;
  const canSubmit = emailLooksValid && password.length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    demoSignIn();
    router.push("/dashboard");
  }

  return (
    <div
      className="w-full max-w-[400px] rounded-[12px] p-6 flex flex-col gap-6 bg-surface-raised"
      style={{ border: "1px solid var(--border)", boxShadow: "var(--card-glow-shadow)" }}
    >
      {/* Brand + title */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <span className="text-[16px] leading-[22px] font-semibold tracking-tight" style={{ color: "var(--primary)" }}>
            Cortex
          </span>
          <span className="text-[12px] leading-[16px] text-muted-foreground">Avante Security</span>
        </div>
        <h1 className="text-[22px] leading-[30px] font-bold text-foreground">Sign in</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
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
          <label htmlFor="password" className="text-[14px] leading-[20px] font-semibold text-foreground">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
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
          <Link
            href="/forgot-password"
            className="self-end text-[13px] leading-[20px] font-medium transition-opacity duration-100 hover:opacity-70"
            style={{ color: "var(--primary)" }}
          >
            Forgot your password?
          </Link>
        </div>

        <Button type="submit" size="cta" className="w-full mt-1" disabled={!canSubmit}>
          Sign in
        </Button>
      </form>

      <div className="flex flex-col gap-2">
        <Link
          href="/activate"
          className="text-[13px] leading-[20px] font-medium transition-opacity duration-100 hover:opacity-70"
          style={{ color: "var(--primary)" }}
        >
          First time here? Activate your account
        </Link>
      </div>
    </div>
  );
}
