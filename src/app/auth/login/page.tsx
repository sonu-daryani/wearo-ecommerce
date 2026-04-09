import { auth } from "@/auth";
import { isEmailOtpEnabled } from "@/lib/auth/email-otp-config";
import { isGoogleAuthEnabled } from "@/lib/google-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { callbackUrl?: string; error?: string };
}) {
  const session = await auth();
  const callbackUrl = searchParams?.callbackUrl || "/";
  const oauthError = searchParams?.error;
  if (session?.user?.id && !oauthError) {
    redirect(callbackUrl);
  }

  const googleAuthEnabled = isGoogleAuthEnabled();
  const emailOtpEnabled = isEmailOtpEnabled();

  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-24 text-center text-muted-foreground">
          Loading…
        </div>
      }
    >
      <LoginForm
        googleAuthEnabled={googleAuthEnabled}
        emailOtpEnabled={emailOtpEnabled}
      />
    </Suspense>
  );
}
