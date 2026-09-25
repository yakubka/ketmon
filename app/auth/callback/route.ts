import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const pendingCookies: { name: string; value: string; options: CookieOptions }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          pendingCookies.push(...cookiesToSet);
        },
      },
    },
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const email = data.session.user.email;
  const providerToken = data.session.provider_token ?? null;
  const providerRefreshToken = data.session.provider_refresh_token ?? null;

  let redirectPath = "/home";

  if (email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          email,
          name: data.session.user.user_metadata?.full_name ?? null,
          role: "MEMBER",
          creditBalance: 0,
          googleAccessToken: providerToken,
          googleRefreshToken: providerRefreshToken,
        },
      });
      redirectPath = "/onboarding";
    } else {
      await prisma.user.update({
        where: { email },
        data: {
          googleAccessToken: providerToken ?? existing.googleAccessToken,
          googleRefreshToken: providerRefreshToken ?? existing.googleRefreshToken,
        },
      });
    }
  }

  const response = NextResponse.redirect(new URL(redirectPath, req.url));
  pendingCookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
  return response;
}
