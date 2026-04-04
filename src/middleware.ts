import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const STAFF_ROLES = new Set(["VIEWER", "EDITOR", "ADMIN"]);

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  if (pathname.startsWith("/admin/forbidden")) {
    if (!token?.sub) {
      const login = new URL("/auth/login", req.nextUrl.origin);
      login.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!token?.sub) {
      const login = new URL("/auth/login", req.nextUrl.origin);
      login.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(login);
    }
    const role = token.role as string | undefined;
    if (!role || !STAFF_ROLES.has(role)) {
      return NextResponse.redirect(new URL("/admin/forbidden", req.nextUrl.origin));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/account")) {
    if (!token?.sub) {
      const login = new URL("/auth/login", req.nextUrl.origin);
      login.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
