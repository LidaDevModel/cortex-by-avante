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
      className="w-full max-w-[400px] flex flex-col gap-6"
      style={{ animation: "msg-in 200ms ease-out both" }}
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-[22px] leading-[30px] lg:text-[28px] lg:leading-[36px] font-bold text-foreground">
          Sign in
        </h1>
        <p className="text-[14px] leading-[20px] text-muted-foreground">
          Welcome back — enter your details to continue.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-1" noValidate>
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
          {/* Label row — the forgot link sits opposite the label */}
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="password" className="text-[14px] leading-[20px] font-semibold text-foreground">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[13px] leading-[20px] font-medium transition-opacity duration-100 hover:opacity-70"
              style={{ color: "var(--primary)" }}
            >
              Forgot your password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Your password"
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
          {/* Reserved message line — keeps field rhythm identical to email */}
          <p aria-live="polite" className="min-h-[16px] text-[12px] leading-[16px] text-destructive" />
        </div>

        <Button type="submit" size="cta" className="w-full mt-3" disabled={!canSubmit}>
          Sign in
        </Button>
      </form>

      <p className="text-[13px] leading-[20px] text-muted-foreground">
        First time here?{" "}
        <Link
          href="/activate"
          className="font-medium transition-opacity duration-100 hover:opacity-70"
          style={{ color: "var(--primary)" }}
        >
          Activate your account
        </Link>
      </p>
    </div>
  );
}
