/**
 * Same defaults as the login page callout (`NEXT_PUBLIC_DEMO_LOGIN_*`).
 * When email OTP is enabled, this pair skips OTP on client + server.
 */
export function isDemoLoginCredentials(email: string, password: string): boolean {
  const demoEmail = (process.env.NEXT_PUBLIC_DEMO_LOGIN_EMAIL ?? "demo@wearo.in")
    .trim()
    .toLowerCase();
  const demoPass = process.env.NEXT_PUBLIC_DEMO_LOGIN_PASSWORD ?? "admin123+";
  return email.trim().toLowerCase() === demoEmail && password === demoPass;
}
