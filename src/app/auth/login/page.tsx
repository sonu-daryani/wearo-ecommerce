import { auth } from "@/auth";
import { isEmailOtpEnabled } from "@/lib/auth/email-otp-config";
import { isGoogleAuthEnabled } from "@/lib/google-auth";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { callbackUrl?: string; error?: string; registered?: string };
}) {
  const session = await auth();
  const callbackUrl = searchParams?.callbackUrl || "/";
  const oauthError = searchParams?.error;
  if (session?.user?.id && !oauthError) {
    redirect(callbackUrl);
  }

  const googleAuthEnabled = isGoogleAuthEnabled();
  const emailOtpEnabled = isEmailOtpEnabled();
  const registered = searchParams?.registered === "1";

  return (
    <LoginForm
      googleAuthEnabled={googleAuthEnabled}
      emailOtpEnabled={emailOtpEnabled}
      callbackUrl={callbackUrl}
      error={oauthError}
      registered={registered}
    />
  );
}
