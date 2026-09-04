"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { demoSignIn, isSignedIn } from "@/lib/auth-mock";
import { hasManageAccess } from "@/lib/manage-access";
import { isInternalPath } from "@/lib/admin-nav";

/** A cleared admin's home is Cortex Manage (`/admin`); everyone else lands on
 *  the learner home. Read after sign-in, once the returning persona is set. */
/** The query string never changes without a navigation, so there is nothing
    to subscribe to. */
const noopSubscribe = () => () => {};

function landingRoute() {
  return hasManageAccess() ? "/admin" : "/dashboard";
}

export default function SignInPage() {
  const router = useRouter();
  /* Where to go after signing in. `AuthGate` puts the intended path here when
     it bounces a deep link, so a notification tapped on a lapsed session lands
     on the document rather than on Home. Validated with the same
     `isInternalPath` every other return param in the app uses — an unvalidated
     one is an open redirect. */
  /* Read from `window.location`, not `useSearchParams()`: that hook opts a
     page out of static prerendering unless it sits inside a Suspense
     boundary, and the build fails on it — this screen is prerendered.
     `useSyncExternalStore` gives a hydration-safe read (false on the server,
     the real value on the client) without a setState inside an effect. */
  const expired = useSyncExternalStore(
    noopSubscribe,
    () => new URLSearchParams(window.location.search).get("expired") === "1",
    () => false
  );
  /* Read at call time rather than during render — both callers run in the
     browser, so there is nothing to synchronise. */
  const readNext = () => new URLSearchParams(window.location.search).get("return");
  const afterSignIn = useCallback(() => {
    const next = readNext();
    return isInternalPath(next) ? next : landingRoute();
  }, []);
  const [email, setEmail] = useState("");
  // Whether the field has been left once. An email is invalid for as long as
  // you are typing it -- "l", "li", "lida" -- so showing the error on the
  // first keystroke tells a new hire they are wrong while they are still
  // answering. VISION also requires the error to clear on change.
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Already signed in → straight to the app.
  useEffect(() => {
    if (isSignedIn()) router.replace(afterSignIn());
  }, [router, afterSignIn]);

  // Presentation gating: both fields must be filled and the email must look
  // like one (contain "@") to enable the button — but any dummy values pass.
  // We never check the credentials themselves; the button just opens the app.
  const emailLooksValid = email.includes("@");
  const emailError = emailTouched && email.length > 0 && !emailLooksValid;
  const canSubmit = emailLooksValid && password.length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    demoSignIn();
    router.push(afterSignIn());
  }

  return (
    <div
      className="w-full max-w-[400px] flex flex-col gap-6"
      style={{ animation: "msg-in 200ms ease-out both" }}
    >
      <div className="flex flex-col gap-1">
        <h1 className="type-h1 font-bold text-foreground">
          Sign in
        </h1>
        <p className="type-label text-muted-foreground">
          {/* VISION's phrasing-table row for an expired session, which was
              written and never used. A guard whose shift ran past the window
              is told what happened, not handed a bare form. */}
          {expired
            ? "Your session has ended. Sign in again to continue."
            : "Welcome back — enter your details to continue."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-1" noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="type-label font-semibold text-foreground">
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            enterKeyHint="next"
            autoCapitalize="none"
            autoCorrect="off"
            autoFocus
            placeholder="name@avante.security"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailTouched(false); }}
            onBlur={() => setEmailTouched(true)}
            className={`h-12 bg-surface ${emailError ? "field-error" : ""}`}
          />
          {/* Reserved message line — always present so the form never jumps */}
          <p aria-live="polite" className="min-h-[16px] type-caption text-destructive">
            {emailError ? "Enter a valid email address." : ""}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          {/* Label row — the forgot link sits opposite the label */}
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="password" className="type-label font-semibold text-foreground">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="type-meta font-medium transition-opacity duration-100 hover:opacity-70"
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
              // Last field in the form — the action key signs you in.
              enterKeyHint="go"
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
          <p aria-live="polite" className="min-h-[16px] type-caption text-destructive" />
        </div>

        <Button type="submit" size="cta" className="w-full mt-3" disabled={!canSubmit}>
          Sign in
        </Button>
      </form>

      <p className="type-meta text-muted-foreground">
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
