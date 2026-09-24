import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json([], { status: 400 });
  }

  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: {
      classSlot: {
        include: {
          activity: true,
          gym: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bookings);
}
