import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = ["/profile", "/jobs", "/settings", "/agent", "/alerts", "/onboarding"];
const AUTH_ROUTES = ["/signin", "/signup", "/forgot-password"];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isAuthPath(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function hasSession(request: NextRequest): boolean {
  return Boolean(request.cookies.get("session_token")?.value);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isProtectedPath(pathname)) {
    if (!hasSession(request)) {
      const signin = new URL("/signin", request.url);
      signin.searchParams.set("from", pathname);
      return NextResponse.redirect(signin);
    }
  }

  if (isAuthPath(pathname)) {
    if (hasSession(request)) {
      return NextResponse.redirect(new URL("/profile", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico
     * - api (API routes)
     * - common static extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
