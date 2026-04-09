"use client";

import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getAuthPageErrorMessage } from "@/lib/auth/auth-error-messages";
import { postEnvelope } from "@/lib/http/request-handler";
import { useApiLoading } from "@/hooks/use-api-loading";

type Props = {
  googleAuthEnabled: boolean;
  emailOtpEnabled: boolean;
};

type Step = "credentials" | "otp";

export function LoginForm({ googleAuthEnabled, emailOtpEnabled }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const registerOk = searchParams.get("registered") === "1";
  const errorParam = searchParams.get("error");
  const oauthErrorMessage = getAuthPageErrorMessage(errorParam);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<Step>("credentials");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
      if (emailOtpEnabled) {
        const ok = await requestLoginOtp();
        if (ok) {
          setOtp("");
          setStep("otp");
        }
        setLoading(false);
        return;
      }

      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
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
      <div className="max-w-md mx-auto px-4 py-16 md:py-24">
        <h1 className="text-3xl font-bold text-foreground mb-2">Check your email</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Enter the 6-digit code we sent to <span className="font-medium text-foreground">{email}</span>.
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
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="mt-6 flex flex-col gap-3 text-sm">
          <button
            type="button"
            className="text-slate-700 underline decoration-slate-400 underline-offset-4 hover:text-indigo-700 disabled:opacity-50"
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
            className="text-slate-600 hover:text-foreground text-left"
            onClick={() => {
              setStep("credentials");
              setOtp("");
              setError("");
            }}
            disabled={loading}
          >
            ← Back
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-slate-600">
          No account?{" "}
          <Link
            href="/auth/register"
            className="font-semibold text-slate-900 underline decoration-slate-900/50 underline-offset-4 hover:text-indigo-700 hover:decoration-indigo-700"
          >
            Create one
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 md:py-24">
      <h1 className="text-3xl font-bold text-foreground mb-2">Sign in</h1>
      <p className="text-muted-foreground text-sm mb-8">
        Welcome back to Wearo.in
      </p>

      {oauthErrorMessage && (
        <div
          className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          <p className="font-medium text-destructive">Sign-in could not complete</p>
          <p className="mt-1.5 text-destructive/90 leading-relaxed">{oauthErrorMessage}</p>
          {errorParam && (
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              Code: <span className="font-mono">{errorParam}</span>
            </p>
          )}
        </div>
      )}

      {googleAuthEnabled && (
        <>
          <div className="space-y-3 mb-8">
            <GoogleSignInButton callbackUrl={callbackUrl} />
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or use email
              </span>
            </div>
          </div>
        </>
      )}

      <form onSubmit={onSubmitCredentials} className="space-y-4">
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
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none ring-ring focus-visible:ring-2"
          />
        </div>
        {emailOtpEnabled && (
          <p className="text-xs text-muted-foreground">
            After you continue, we will email you a one-time code to finish signing in.
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
              : "Signing in…"
            : emailOtpEnabled
              ? "Continue"
              : "Sign in"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600">
        No account?{" "}
        <Link
          href="/auth/register"
          className="font-semibold text-slate-900 underline decoration-slate-900/50 underline-offset-4 hover:text-indigo-700 hover:decoration-indigo-700"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
