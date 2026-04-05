/** Build absolute origin from incoming request headers (works behind proxies). */
export function originFromRequest(req: Request): string {
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  const proto =
    req.headers.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  if (!host) return "";
  return `${proto}://${host}`;
}
