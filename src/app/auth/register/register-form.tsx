"use client";

import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApiLoading } from "@/hooks/use-api-loading";
import { postEnvelope } from "@/lib/http/request-handler";
import { useState } from "react";
import { toast } from "react-toastify";

type Props = {
  googleAuthEnabled: boolean;
  emailOtpEnabled: boolean;
};

type Step = "details" | "otp";

export function RegisterForm({ googleAuthEnabled, emailOtpEnabled }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<Step>("details");
  const [error, setError] = useState("");
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
      <div className="max-w-md mx-auto px-4 py-16 md:py-24">
        <h1 className="text-3xl font-bold text-foreground mb-2">Check your email</h1>
        <p className="text-muted-foreground text-sm mb-6">
          We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>.
        </p>

        <form onSubmit={onSubmitOtp} className="space-y-4">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium mb-1.5">
              Verification code
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm tracking-widest font-mono outline-none ring-ring focus-visible:ring-2"
              placeholder="000000"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="w-full rounded-full h-12 bg-slate-900 text-white hover:bg-slate-800 shadow-sm border-0"
            disabled={loading}
          >
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <div className="mt-6 flex flex-col gap-3 text-sm">
          <button
            type="button"
            className="text-slate-700 underline decoration-slate-400 underline-offset-4 hover:text-indigo-700 disabled:opacity-50"
            onClick={() => onResendOtp()}
            disabled={loading}
          >
            Resend code
          </button>
          <button
            type="button"
            className="text-slate-600 hover:text-foreground text-left"
            onClick={() => {
              setStep("details");
              setOtp("");
              setError("");
            }}
            disabled={loading}
          >
            ← Back
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-slate-900 underline decoration-slate-900/50 underline-offset-4 hover:text-indigo-700 hover:decoration-indigo-700"
          >
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 md:py-24">
      <h1 className="text-3xl font-bold text-foreground mb-2">Create account</h1>
      <p className="text-muted-foreground text-sm mb-6">
        {googleAuthEnabled
          ? "Join Wearo.in with Google or email"
          : "Join Wearo.in with your email"}
      </p>

      {googleAuthEnabled && (
        <>
          <GoogleSignInButton callbackUrl="/" label="Sign up with Google" />

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or register with email
              </span>
            </div>
          </div>
        </>
      )}

      <form onSubmit={onSubmitDetails} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1.5">
            Name <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none ring-ring focus-visible:ring-2"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1.5">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none ring-ring focus-visible:ring-2"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium mb-1.5"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none ring-ring focus-visible:ring-2"
          />
          <p className="text-xs text-muted-foreground mt-1">At least 8 characters</p>
        </div>
        {emailOtpEnabled && (
          <p className="text-xs text-muted-foreground">
            We will email you a one-time code to verify this address before creating your account.
          </p>
        )}
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <Button
          type="submit"
          className="w-full rounded-full h-12 bg-slate-900 text-white hover:bg-slate-800 shadow-sm border-0"
          disabled={loading}
        >
          {loading
            ? emailOtpEnabled
              ? "Sending code…"
              : "Creating account…"
            : emailOtpEnabled
              ? "Continue"
              : "Create account"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-slate-900 underline decoration-slate-900/50 underline-offset-4 hover:text-indigo-700 hover:decoration-indigo-700"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
