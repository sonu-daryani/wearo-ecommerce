import { isEmailOtpEnabled } from "@/lib/auth/email-otp-config";
import { isGoogleAuthEnabled } from "@/lib/google-auth";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <RegisterForm
      googleAuthEnabled={isGoogleAuthEnabled()}
      emailOtpEnabled={isEmailOtpEnabled()}
    />
  );
}
