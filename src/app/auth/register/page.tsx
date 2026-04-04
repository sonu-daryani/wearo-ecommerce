import { isGoogleAuthEnabled } from "@/lib/google-auth";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return <RegisterForm googleAuthEnabled={isGoogleAuthEnabled()} />;
}
