"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getLastEmail } from "@/lib/auth-mock";

/**
 * Forgot password — the standard "email me a reset link" flow. Enter your
 * email → a confirmation that a link is on its way. The reset itself happens
 * from the emailed link (a real backend sends it); this is the on-screen half.
 * Resets the personal password set during activation, never the Avante PIN.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    setEmail((current) => current || getLastEmail());
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Always advances to the confirmation — a real backend only ever says
    // "if an account exists, we've sent a link" regardless, so nothing is
    // validated or revealed here.
    setSent(true);
  }

  return (
    <div
      className="w-full max-w-[400px] flex flex-col gap-6"
      style={{ animation: "msg-in 200ms ease-out both" }}
    >
      {/* Back to sign in — first row, above everything */}
      <Link
        href="/sign-in"
        className="flex items-center gap-1.5 w-fit text-[13px] leading-[20px] text-muted-foreground hover:text-foreground transition-colors duration-100"
      >
        <ArrowLeft size={14} strokeWidth={2} />
        <span>Back to sign in</span>
      </Link>

      {sent ? (
        <div className="flex flex-col gap-6" style={{ animation: "msg-in 200ms ease-out both" }}>
          <div className="flex flex-col gap-3">
            <span
              className="flex items-center justify-center w-11 h-11 rounded-full"
              style={{ background: "color-mix(in srgb, var(--accent-subtle) 45%, transparent)", color: "var(--primary)" }}
            >
              <MailCheck size={20} strokeWidth={1.5} />
            </span>
            <h1 className="text-[22px] leading-[30px] font-bold text-foreground">Check your email</h1>
            <p className="text-[14px] leading-[20px] text-muted-foreground">
              If an account exists for{" "}
              <span className="text-foreground font-medium">{email.trim() || "that address"}</span>, we&apos;ve sent a
              link to reset your password. It may take a few minutes to arrive.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-1">
            <h1 className="text-[22px] leading-[30px] lg:text-[28px] lg:leading-[36px] font-bold text-foreground">Reset your password</h1>
            <p className="text-[14px] leading-[20px] text-muted-foreground">
              Enter your email and we&apos;ll send you a link to set a new password.
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
                className="h-12 bg-surface"
              />
              {/* Reserved message line — same rhythm as the other auth fields */}
              <p aria-live="polite" className="min-h-[16px] text-[12px] leading-[16px] text-destructive" />
            </div>

            <Button type="submit" size="cta" className="w-full mt-3">
              Send reset link
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
