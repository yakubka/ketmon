import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { gymPayout } from "@/lib/pricing";

export async function GET(req: NextRequest) {
  const ownerId = req.nextUrl.searchParams.get("ownerId");
  if (!ownerId) {
    return NextResponse.json({}, { status: 400 });
  }

  const gyms = await prisma.gym.findMany({
    where: { ownerId },
    select: { id: true },
  });
  const gymIds = gyms.map((g) => g.id);

  const paidBookings = await prisma.booking.findMany({
    where: {
      classSlot: { gymId: { in: gymIds } },
      status: { in: ["ATTENDED", "NO_SHOW", "LATE_CANCELLED"] },
    },
  });

  const payoutsTotal = paidBookings.reduce(
    (sum, b) => sum + gymPayout(b.creditsPaid),
    0,
  );

  const noShowBookings = paidBookings.filter((b) => b.status === "NO_SHOW");
  const noShowCompensation = noShowBookings.reduce(
    (sum, b) => sum + gymPayout(b.creditsPaid),
    0,
  );

  const commissions = await prisma.commission.findMany({
    where: { gymId: { in: gymIds } },
    orderBy: { createdAt: "desc" },
  });
  const commissionsTotal = commissions.reduce((sum, c) => sum + c.amount, 0);

  return NextResponse.json({
    payoutsTotal: Math.round(payoutsTotal * 100) / 100,
    noShowCompensation: Math.round(noShowCompensation * 100) / 100,
    commissionsTotal,
    commissions,
  });
}
