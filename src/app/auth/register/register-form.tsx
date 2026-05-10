"use client";

import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import {
  AuthPageShell,
  ContinueShoppingLink,
  authCardClass,
  authInputClass,
  authPrimaryCtaClass,
} from "@/components/auth/auth-page-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SITE_DOMAIN, SITE_NAME } from "@/lib/site-config";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApiLoading } from "@/hooks/use-api-loading";
import { postEnvelope } from "@/lib/http/request-handler";
import { Eye, EyeOff, Lock, Mail, UserPlus } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "react-toastify";

type Props = {
  googleAuthEnabled: boolean;
  emailOtpEnabled: boolean;
};

type Step = "details" | "otp";

export function RegisterForm({ googleAuthEnabled, emailOtpEnabled }: Props) {
  const router = useRouter();
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const otpId = useId();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<Step>("details");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { loading, withLoading } = useApiLoading();

  async function submitRegister() {
    const res = await postEnvelope<{ registered: true }>("/api/auth/register", {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      ...(emailOtpEnabled ? { otp: otp.trim() } : {}),
    });
    if (!res.ok) {
      setError(res.message);
      toast.error(res.message);
      return;
    }
    toast.success(res.message);
    router.push("/auth/login?registered=1");
    router.refresh();
  }

  async function sendSignupOtp() {
    const res = await postEnvelope<{ sent: true }>("/api/auth/register/send-otp", {
      name: name.trim(),
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

  async function onSubmitDetails(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    await withLoading(async () => {
      if (emailOtpEnabled) {
        const ok = await sendSignupOtp();
        if (ok) {
          setOtp("");
          setStep("otp");
        }
        return;
      }
      await submitRegister();
    });
  }

  async function onSubmitOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    await withLoading(async () => {
      await submitRegister();
    });
  }

  async function onResendOtp() {
    setError("");
    await withLoading(async () => {
      await sendSignupOtp();
    });
  }

  if (emailOtpEnabled && step === "otp") {
    return (
      <AuthPageShell>
        <div className="w-full max-w-[440px] space-y-6">
          <ContinueShoppingLink />
          <div className={authCardClass}>
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-lg shadow-slate-900/30 ring-1 ring-white/15 dark:from-white dark:to-slate-200 dark:text-slate-900 dark:shadow-white/10">
                <Mail className="h-7 w-7" strokeWidth={1.75} aria-hidden />
              </div>
              <p className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                <Lock className="h-3 w-3" aria-hidden />
                Email verification
              </p>
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-[1.65rem]">
                Check your email
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                We sent a 6-digit code to{" "}
                <span className="font-medium text-slate-900 dark:text-white">{email}</span>.
              </p>
            </div>

            <form onSubmit={onSubmitOtp} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor={otpId} className="text-sm font-medium text-slate-900 dark:text-white">
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
                <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" className={authPrimaryCtaClass} disabled={loading}>
                {loading ? "Creating account…" : "Create account"}
              </Button>
            </form>

            <div className="mt-6 flex flex-col gap-3 text-sm">
              <button
                type="button"
                className="text-muted-foreground underline decoration-muted-foreground/50 underline-offset-4 hover:text-foreground disabled:opacity-50"
                onClick={() => onResendOtp()}
                disabled={loading}
              >
                Resend code
              </button>
              <button
                type="button"
                className="text-left text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setStep("details");
                  setOtp("");
                  setError("");
                }}
                disabled={loading}
              >
                ← Back to registration
              </button>
            </div>
          </div>

          <div className="space-y-2 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-slate-900 underline decoration-slate-400 underline-offset-4 hover:text-slate-700 dark:text-white dark:decoration-slate-600 dark:hover:text-slate-200"
              >
                Sign in
              </Link>
            </p>
          </div>
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
              <UserPlus className="h-7 w-7" strokeWidth={1.75} aria-hidden />
            </div>
            <p className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              <Lock className="h-3 w-3" aria-hidden />
              New account
            </p>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-[1.65rem]">
              Create account
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {googleAuthEnabled
                ? `${SITE_NAME} · ${SITE_DOMAIN} — join with Google or email.`
                : `${SITE_NAME} · ${SITE_DOMAIN} — join with your email.`}
            </p>
          </div>

          {googleAuthEnabled && (
            <>
              <div className="space-y-3">
                <GoogleSignInButton callbackUrl="/" label="Sign up with Google" />
              </div>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center text-[11px] font-medium uppercase tracking-widest">
                  <span className="bg-white px-3 text-slate-500 dark:bg-slate-950 dark:text-slate-500">
                    Or register with email
                  </span>
                </div>
              </div>
            </>
          )}

          <form onSubmit={onSubmitDetails} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor={nameId} className="text-sm font-medium text-slate-900 dark:text-white">
                Name <span className="font-normal text-slate-500 dark:text-slate-400">(optional)</span>
              </label>
              <input
                id={nameId}
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className={authInputClass}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor={emailId} className="text-sm font-medium text-slate-900 dark:text-white">
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
              <label htmlFor={passwordId} className="text-sm font-medium text-slate-900 dark:text-white">
                Password
              </label>
              <div className="relative">
                <input
                  id={passwordId}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
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
              <p className="text-xs text-slate-500 dark:text-slate-400">At least 8 characters</p>
            </div>
            {emailOtpEnabled && (
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                We will email you a one-time code to verify this address before creating your account.
              </p>
            )}
            {error && (
              <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className={authPrimaryCtaClass} disabled={loading}>
              {loading
                ? emailOtpEnabled
                  ? "Sending code…"
                  : "Creating account…"
                : emailOtpEnabled
                  ? "Continue"
                  : "Create account"}
            </Button>
          </form>
        </div>

        <div className="space-y-2 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-slate-900 underline decoration-slate-400 underline-offset-4 hover:text-slate-700 dark:text-white dark:decoration-slate-600 dark:hover:text-slate-200"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthPageShell>
  );
}
