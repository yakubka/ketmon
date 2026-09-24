import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";

const PROTECTED_MEMBER = ["/home", "/wallet", "/bookings", "/map", "/gym", "/profile"];
const PROTECTED_OWNER = ["/owner"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  const path = req.nextUrl.pathname;

  const needsAuth =
    PROTECTED_MEMBER.some((p) => path.startsWith(p)) ||
    PROTECTED_OWNER.some((p) => path.startsWith(p));

  if (needsAuth && !session) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (PROTECTED_OWNER.some((p) => path.startsWith(p)) && session) {
    const email = session.user.email;
    if (email) {
      const userRes = await fetch(
        `${req.nextUrl.origin}/api/auth/role?email=${encodeURIComponent(email)}`,
      );
      if (userRes.ok) {
        const { role } = await userRes.json();
        if (role !== "OWNER") {
          return NextResponse.redirect(new URL("/home", req.url));
        }
      }
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/home/:path*",
    "/wallet/:path*",
    "/bookings/:path*",
    "/map/:path*",
    "/gym/:path*",
    "/profile/:path*",
    "/owner/:path*",
  ],
};
