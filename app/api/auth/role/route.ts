import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ role: null }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  });

  return NextResponse.json({ role: user?.role ?? null });
}
