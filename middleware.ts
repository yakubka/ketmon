import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

const PROTECTED_MEMBER = ["/home", "/wallet", "/bookings", "/map", "/gym", "/profile", "/onboarding"];
const PROTECTED_OWNER = ["/owner"];

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    },
  );

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
    "/onboarding/:path*",
  ],
};
