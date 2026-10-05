import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth/auth.config";
import { resolvePostLoginPath } from "@/lib/auth/redirects";
import { isStaffAdmin } from "@/lib/auth/roles";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  const isLoggedIn = !!req.auth?.user?.id;
  const roles = req.auth?.user?.roles ?? [];

  const isLoginPage = pathname === "/admin/login";
  const isAdminRoute = pathname.startsWith("/admin");
  const isPortalRoute = pathname.startsWith("/portal");

  if (isLoginPage) {
    if (isLoggedIn) {
      const callbackUrl = nextUrl.searchParams.get("callbackUrl");
      const destination = resolvePostLoginPath(roles, callbackUrl);
      return NextResponse.redirect(new URL(destination, nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn && (isAdminRoute || isPortalRoute)) {
    const loginUrl = new URL("/admin/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname + nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isAdminRoute && !isStaffAdmin(roles)) {
    return NextResponse.redirect(new URL("/unauthorized", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*"],
};
