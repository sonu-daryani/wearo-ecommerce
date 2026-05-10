"use client";

import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SITE_DOMAIN, SITE_NAME } from "@/lib/site-config";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useEffect, useId, useState } from "react";
import { toast } from "react-toastify";
import { getAuthPageErrorMessage } from "@/lib/auth/auth-error-messages";
import { isDemoLoginCredentials } from "@/lib/auth/demo-login";
import { postEnvelope } from "@/lib/http/request-handler";
import { useApiLoading } from "@/hooks/use-api-loading";
import {
  AuthPageShell,
  ContinueShoppingLink,
  authCardClass,
  authInputClass,
  authPrimaryCtaClass,
} from "@/components/auth/auth-page-shell";
import { Eye, EyeOff, Info, Lock, ShoppingBag } from "lucide-react";

/** Shown on the login card; override with NEXT_PUBLIC_DEMO_LOGIN_*; set NEXT_PUBLIC_HIDE_LOGIN_DEMO=true to hide. */
const DEMO_LOGIN_EMAIL =
  process.env.NEXT_PUBLIC_DEMO_LOGIN_EMAIL ?? "demo@wearo.in";
const DEMO_LOGIN_PASSWORD =
  process.env.NEXT_PUBLIC_DEMO_LOGIN_PASSWORD ?? "admin123+";
const HIDE_DEMO_CALLOUT = process.env.NEXT_PUBLIC_HIDE_LOGIN_DEMO === "true";

type Props = {
  googleAuthEnabled: boolean;
  emailOtpEnabled: boolean;
  callbackUrl: string;
  error?: string;
  registered: boolean;
};

type Step = "credentials" | "otp";

export function LoginForm({
  googleAuthEnabled,
  emailOtpEnabled,
  callbackUrl,
  registered: registerOk,
  error: oauthError,
}: Props) {
  const router = useRouter();
  const oauthErrorMessage = getAuthPageErrorMessage(oauthError);
  const emailId = useId();
  const passwordId = useId();
  const otpId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<Step>("credentials");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { loading: otpActionLoading, withLoading: withOtpActionLoading } =
    useApiLoading();

  useEffect(() => {
    if (registerOk) {
      toast.success("Account created. You can sign in now.");
    }
  }, [registerOk]);

  useEffect(() => {
    if (oauthErrorMessage) {
      toast.error(oauthErrorMessage);
    }
  }, [oauthErrorMessage]);

  async function requestLoginOtp() {
    const res = await postEnvelope<{ sent: true }>("/api/auth/login/send-otp", {
      email: email.trim().toLowerCase(),
      password,
    });
    if (!res.ok) {
      setError(res.message);
      toast.error(res.message);
      return false;
    }
    toast.success(res.message);
    return true;
  }

  async function onSubmitCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const emailNorm = email.trim().toLowerCase();
      const bypassOtpForDemo =
        emailOtpEnabled && isDemoLoginCredentials(emailNorm, password);

      if (emailOtpEnabled && !bypassOtpForDemo) {
        const ok = await requestLoginOtp();
        if (ok) {
          setOtp("");
          setStep("otp");
        }
        setLoading(false);
        return;
      }

      const res = await signIn("credentials", {
        email: emailNorm,
        password,
        redirect: false,
      });
      if (res?.error) {
        const msg = "Invalid email or password.";
        setError(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }
      toast.success("Signed in");
      router.push(callbackUrl);
      router.refresh();
    } catch {
      const msg = "Something went wrong.";
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  }

  async function onSubmitOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        otp: otp.trim(),
        redirect: false,
      });
      if (res?.error) {
        const msg = "Invalid email, password, or verification code.";
        setError(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }
      toast.success("Signed in");
      router.push(callbackUrl);
      router.refresh();
    } catch {
      const msg = "Something went wrong.";
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  }

  if (emailOtpEnabled && step === "otp") {
    return (
      <AuthPageShell>
        <div className="w-full max-w-[440px] space-y-6">
          <ContinueShoppingLink />
          <div className={authCardClass}>
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-lg shadow-slate-900/30 ring-1 ring-white/15 dark:from-white dark:to-slate-200 dark:text-slate-900 dark:shadow-white/10">
                <ShoppingBag className="h-7 w-7" strokeWidth={1.75} aria-hidden />
              </div>
              <p className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Lock className="h-3 w-3" aria-hidden />
                Email verification
              </p>
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-[1.65rem]">
                Check your email
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Enter the 6-digit code we sent to{" "}
                <span className="font-medium text-foreground">{email}</span>.
              </p>
            </div>

            <form onSubmit={onSubmitOtp} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor={otpId} className="text-sm font-medium text-foreground">
                  Verification code
                </label>
                <input
                  id={otpId}
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="\d{6}"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className={cn(authInputClass, "tracking-widest font-mono")}
                  placeholder="000000"
                />
              </div>
              {error && (
                <p className="text-sm font-medium text-destructive" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" className={authPrimaryCtaClass} disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>

            <div className="mt-6 flex flex-col gap-3 text-sm">
              <button
                type="button"
                className="text-muted-foreground underline decoration-muted-foreground/50 underline-offset-4 hover:text-foreground disabled:opacity-50"
                onClick={() =>
                  withOtpActionLoading(async () => {
                    setError("");
                    await requestLoginOtp();
                  })
                }
                disabled={otpActionLoading}
              >
                Resend code
              </button>
              <button
                type="button"
                className="text-left text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setStep("credentials");
                  setOtp("");
                  setError("");
                }}
                disabled={loading}
              >
                ← Back to sign in
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            No account?{" "}
            <Link
              href="/auth/register"
              className="font-semibold text-slate-900 underline decoration-slate-400 underline-offset-4 hover:text-slate-700 dark:text-white dark:decoration-slate-600 dark:hover:text-slate-200"
            >
              Create one
            </Link>
          </p>
        </div>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell>
      <div className="w-full max-w-[440px] space-y-6">
        <ContinueShoppingLink />
        <div className={authCardClass}>
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-lg shadow-slate-900/30 ring-1 ring-white/15 dark:from-white dark:to-slate-200 dark:text-slate-900 dark:shadow-white/10">
              <ShoppingBag className="h-7 w-7" strokeWidth={1.75} aria-hidden />
            </div>
            <p className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              <Lock className="h-3 w-3" aria-hidden />
              Customer account
            </p>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-[1.65rem]">
              Sign in to {SITE_DOMAIN}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {SITE_NAME} · {SITE_DOMAIN} — shop, cart, orders, and your profile.
            </p>
          </div>

          {!HIDE_DEMO_CALLOUT && (
            <div
              className="mb-6 flex gap-3 rounded-xl border border-sky-300/80 bg-gradient-to-b from-sky-50 to-sky-100/90 px-4 py-3.5 text-left shadow-sm shadow-sky-900/5 dark:border-sky-800/60 dark:from-sky-950/80 dark:to-sky-950/40"
              role="note"
            >
              <Info
                className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400"
                aria-hidden
              />
              <div className="min-w-0 text-sm">
                <p className="font-semibold text-sky-950 dark:text-sky-100">
                  Public storefront demo (CUSTOMER)
                </p>
                <p className="mt-1 text-xs leading-relaxed text-sky-900/85 dark:text-sky-200/90">
                  Email{" "}
                  <span className="rounded bg-white/80 px-1.5 py-0.5 font-mono text-[13px] text-foreground dark:bg-sky-900/80">
                    {DEMO_LOGIN_EMAIL}
                  </span>
                  <span className="mx-1 text-sky-700/80 dark:text-sky-400/80">·</span>
                  Password{" "}
                  <span className="rounded bg-white/80 px-1.5 py-0.5 font-mono text-[13px] text-foreground dark:bg-sky-900/80">
                    {DEMO_LOGIN_PASSWORD}
                  </span>
                </p>
                <p className="mt-2 text-[11px] leading-snug text-sky-800/75 dark:text-sky-300/75">
                  {emailOtpEnabled
                    ? "Skips email OTP for this pair only — other sign-ins still receive a code. Requires a seeded user in your database."
                    : "Browse and buy with a seeded customer account in your database."}
                </p>
              </div>
            </div>
          )}

          {oauthErrorMessage && (
            <div
              className="mb-7 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100"
              role="alert"
            >
              <p className="font-semibold text-red-950 dark:text-red-50">Sign-in could not complete</p>
              <p className="mt-2 leading-relaxed text-red-900/95 dark:text-red-100/95">{oauthErrorMessage}</p>
              {oauthError && (
                <p className="mt-3 text-xs leading-relaxed text-red-800/80 dark:text-red-200/80">
                  Code: <span className="font-mono">{oauthError}</span>
                </p>
              )}
            </div>
          )}

          {googleAuthEnabled && (
            <>
              <div className="space-y-3">
                <GoogleSignInButton callbackUrl={callbackUrl} />
              </div>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center text-[11px] font-medium uppercase tracking-widest">
                  <span className="bg-white px-3 text-slate-500 dark:bg-slate-950 dark:text-slate-500">
                    Or use email
                  </span>
                </div>
              </div>
            </>
          )}

          <form onSubmit={onSubmitCredentials} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor={emailId} className="text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id={emailId}
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={authInputClass}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor={passwordId} className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  id={passwordId}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={cn(authInputClass, "pr-12")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden />
                  )}
                </button>
              </div>
            </div>
            {emailOtpEnabled && (
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                After you continue, we email a one-time code — unless you use the public demo
                credentials above.
              </p>
            )}
            {error && (
              <p className="text-sm font-medium text-destructive" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className={authPrimaryCtaClass} disabled={loading}>
              {loading
                ? emailOtpEnabled
                  ? "Sending code…"
                  : "Signing in…"
                : emailOtpEnabled
                  ? "Continue"
                  : "Sign in"}
            </Button>
          </form>
        </div>

        <div className="space-y-2 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No account?{" "}
            <Link
              href="/auth/register"
              className="font-semibold text-slate-900 underline decoration-slate-400 underline-offset-4 hover:text-slate-700 dark:text-white dark:decoration-slate-600 dark:hover:text-slate-200"
            >
              Create one
            </Link>
          </p>
          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-500">
            Public demo credentials are optional — disable them when you go live.
          </p>
        </div>
      </div>
    </AuthPageShell>
  );
}
