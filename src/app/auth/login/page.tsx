import { isEmailOtpEnabled } from "@/lib/auth/email-otp-config";
import { isGoogleAuthEnabled } from "@/lib/google-auth";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
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
