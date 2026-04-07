export type SmtpOtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  secure: boolean;
};

/**
 * SMTP settings for OTP mail. When all required fields are set, signup + credentials login
 * require a 6-digit code (see `.env.example` for free-tier providers: Gmail, Brevo, etc.).
 */
export function getSmtpOtpConfig(): SmtpOtpConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass =
    process.env.SMTP_PASS?.trim() || process.env.SMTP_PASSWORD?.trim();
  const from = process.env.SMTP_FROM?.trim();
  if (!host || !user || !pass || !from) return null;

  const portRaw = process.env.SMTP_PORT?.trim();
  const port = portRaw ? Number(portRaw) : 587;
  if (!Number.isFinite(port) || port < 1) return null;

  const secure =
    process.env.SMTP_SECURE === "true" || port === 465;

  return { host, port, user, pass, from, secure };
}

export function isEmailOtpEnabled(): boolean {
  return getSmtpOtpConfig() !== null;
}
