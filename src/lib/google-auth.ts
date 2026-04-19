export function isGoogleAuthEnabled(): boolean {
  const enabledFlag = (process.env.AUTH_GOOGLE_ENABLED ?? "").trim().toLowerCase();
  const enabled = enabledFlag === "true" || enabledFlag === "1";

  return Boolean(
    enabled && process.env.AUTH_GOOGLE_ID?.trim() && process.env.AUTH_GOOGLE_SECRET?.trim()
  );
}
