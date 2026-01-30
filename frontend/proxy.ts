// frontend/proxy.ts - COMPLETE MULTI-TENANT FIX

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ============================================
// PUBLIC PATHS (No Auth Required)
// ============================================
const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/_next",
  "/api",
  "/public",
  "/favicon.ico",
  "/images",
  "/uploads",
];

// ============================================
// PROTECTED PATHS (Auth Required)
// ============================================
const PROTECTED_PATHS = [
  "/dashboard",
  "/leads",
  "/manage-items",
  "/manage-salespersons",
  "/reports",
  "/newsletter",
  "/lead-capture-form",
];

// ============================================
// MIDDLEWARE FUNCTION
// ============================================
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("ts-token")?.value;

  console.log("🔒 Proxy Check:", {
    path: pathname,
    hasToken: !!token,
  });

  //  Allow public paths
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  if (isPublicPath) {
    console.log(" Public path - allowing");
    return NextResponse.next();
  }

  //  Check if path requires authentication
  const isProtectedPath = PROTECTED_PATHS.some((path) => 
    pathname.startsWith(path)
  );

  // ============================================
  // NOT LOGGED IN → BLOCK PROTECTED ROUTES
  // ============================================
  if (!token && isProtectedPath) {
    console.log("❌ No token - redirecting to login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ============================================
  // LOGGED IN → BLOCK LOGIN/SIGNUP
  // ============================================
  if (token && (pathname === "/login" || pathname === "/signup" || pathname === "/")) {
    console.log("Already logged in - redirecting to dashboard");
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  //Allow all other requests
  console.log("✅ Allowing request");
  return NextResponse.next();
}

// ============================================
// MATCHER CONFIG (REQUIRED)
// ============================================
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|images|public).*)",
  ],
};