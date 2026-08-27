import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

import { RESONANCE_PATH_HEADER, signInHref } from "@/lib/auth-path";

const protectedPrefixes = ["/collection", "/profile", "/explorer/add", "/welcome", "/api/resonance"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);
  const currentPath = `${pathname}${search}`;

  if (!sessionCookie) {
    return NextResponse.redirect(new URL(signInHref(currentPath), request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(RESONANCE_PATH_HEADER, currentPath);
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/collection/:path*", "/profile/:path*", "/explorer/add/:path*", "/welcome", "/api/resonance/:path*"],
};
