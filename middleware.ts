import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Protect /admin/* routes.
 * Set ADMIN_TOKEN in env; the browser must present it in the `admin_token` cookie.
 * If the env var is not set, admin routes are open (dev convenience).
 */
export function middleware(req: NextRequest) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) return NextResponse.next();

  const cookie = req.cookies.get("admin_token")?.value;
  if (cookie === adminToken) return NextResponse.next();

  const loginUrl = new URL("/admin/login", req.url);
  loginUrl.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
