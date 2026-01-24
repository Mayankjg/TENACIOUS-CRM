// frontend/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// MUST export a function named `proxy` OR default export
export function proxy(req: NextRequest) {
  const token = req.cookies.get("ts-token")?.value;
  const pathname = req.nextUrl.pathname;

  const publicPaths = ["/login", "/signup", "/_next", "/api", "/public"];

  // Not logged in → block private routes
  if (!token && !publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Logged in → block login/signup
  if (
    token &&
    (pathname === "/login" ||
      pathname === "/signup" ||
      pathname === "/")
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

// matcher config is STILL REQUIRED
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/leads/:path*",
    "/manage-items/:path*",
    "/manage-salespersons/:path*",
    "/reports/:path*",
    "/newsletter/:path*",
    "/lead-capture-form/:path*",
    "/login",
    "/signup",
    "/",
  ],
};
