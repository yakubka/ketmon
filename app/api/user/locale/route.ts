import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const { email, locale } = await req.json();
  if (!email || !locale) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  await prisma.user.update({
    where: { email },
    data: { locale },
  });

  return NextResponse.json({ ok: true });
}
