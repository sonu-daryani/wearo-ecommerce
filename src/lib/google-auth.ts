/**
 * Google sign-in is on when `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are both set.
 * Set `AUTH_GOOGLE_ENABLED=false` (or `0`) to disable even if credentials exist.
 */
export function isGoogleAuthEnabled(): boolean {
  const forceOff = (process.env.AUTH_GOOGLE_ENABLED ?? "").trim().toLowerCase();
  if (forceOff === "false" || forceOff === "0") return false;

  const id = process.env.AUTH_GOOGLE_ID?.trim();
  const secret = process.env.AUTH_GOOGLE_SECRET?.trim();
  return Boolean(id && secret);
}
