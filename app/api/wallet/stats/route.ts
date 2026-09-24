import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "missing userId" }, { status: 400 });
  }

  const bookings = await prisma.booking.findMany({
    where: { userId, status: { not: "CANCELLED" } },
    include: {
      classSlot: {
        include: {
          activity: true,
        },
      },
    },
  });

  const sportTotals: Record<string, number> = {};
  for (const b of bookings) {
    const sport = b.classSlot.activity.sport;
    sportTotals[sport] = (sportTotals[sport] ?? 0) + b.creditsPaid;
  }

  const spending = Object.entries(sportTotals)
    .map(([sport, credits]) => ({ sport, credits }))
    .sort((a, b) => b.credits - a.credits);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { planName: true, planExpiresAt: true },
  });

  return NextResponse.json({
    spending,
    planName: user?.planName ?? null,
    planExpiresAt: user?.planExpiresAt ?? null,
  });
}
