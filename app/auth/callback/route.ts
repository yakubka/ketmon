import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const supabase = createRouteHandlerClient({ cookies });
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const email = data.session.user.email;
  const providerToken = data.session.provider_token ?? null;
  const providerRefreshToken = data.session.provider_refresh_token ?? null;

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
      return NextResponse.redirect(new URL("/onboarding", req.url));
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

  return NextResponse.redirect(new URL("/home", req.url));
}
