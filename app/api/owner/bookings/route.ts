import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const ownerId = req.nextUrl.searchParams.get("ownerId");
  if (!ownerId) {
    return NextResponse.json([], { status: 400 });
  }

  const gyms = await prisma.gym.findMany({
    where: { ownerId },
    select: { id: true },
  });
  const gymIds = gyms.map((g) => g.id);

  const bookings = await prisma.booking.findMany({
    where: { classSlot: { gymId: { in: gymIds } } },
    include: {
      classSlot: {
        include: { activity: true, gym: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bookings);
}
