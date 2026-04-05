/** @param {string | undefined} base */
function patternsFromPublicBase(base) {
  const patterns = [];
  if (!base) return patterns;
  try {
    const u = new URL(base);
    if (u.hostname) {
      patterns.push({
        protocol: u.protocol.replace(":", ""),
        hostname: u.hostname,
        pathname: "/**",
      });
    }
  } catch {
    /* ignore */
  }
  return patterns;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.r2.dev", pathname: "/**" },
      ...patternsFromPublicBase(process.env.R2_PUBLIC_BASE_URL),
    ],
  },
  /**
   * Optional: same-origin rewrite to an internal admin app (SSR). For JSON/API hiding,
   * prefer `src/app/api/proxy/[...path]/route.ts` + BACKEND_PROXY_TARGET so the browser
   * only sees `/api/proxy/...`.
   */
  async rewrites() {
    const admin = process.env.ADMIN_APP_ORIGIN?.trim();
    if (!admin) return [];
    const base = admin.replace(/\/$/, "");
    return [
      {
        source: "/__/admin/:path*",
        destination: `${base}/admin/:path*`,
      },
    ];
  },
};

export default nextConfig;
