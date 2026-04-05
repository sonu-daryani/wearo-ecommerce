import axios from "axios";

let instance: ReturnType<typeof axios.create> | null = null;

/**
 * Browser: same-origin relative URLs. Server (if used): set AUTH_URL or NEXT_PUBLIC_SITE_URL for absolute base.
 */
export function getApiClient() {
  if (!instance) {
    const baseURL =
      typeof window !== "undefined"
        ? ""
        : (process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "") || "";
    instance = axios.create({
      baseURL,
      headers: { "Content-Type": "application/json" },
      validateStatus: () => true,
    });
  }
  return instance;
}
