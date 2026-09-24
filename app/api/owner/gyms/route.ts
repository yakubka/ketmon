import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { gymPayout } from "@/lib/pricing";

export async function GET(req: NextRequest) {
  const ownerId = req.nextUrl.searchParams.get("ownerId");
  if (!ownerId) {
    return NextResponse.json([], { status: 400 });
  }

  const gyms = await prisma.gym.findMany({
    where: { ownerId },
    include: {
      slots: {
        include: { bookings: true },
      },
    },
  });

  const result = gyms.map((gym) => {
    const offPeakSlots = gym.slots.filter((s) => s.timeBand === "OFF_PEAK");
    const offPeakBooked = offPeakSlots.reduce((sum, s) => sum + s.booked, 0);
    const offPeakCapacity = offPeakSlots.reduce((sum, s) => sum + s.capacity, 0);
    const offPeakFillPct = offPeakCapacity > 0 ? Math.round((offPeakBooked / offPeakCapacity) * 100) : 0;

    const allBookings = gym.slots.flatMap((s) => s.bookings);
    const upcomingCount = allBookings.filter(
      (b) => b.status === "BOOKED",
    ).length;

    const revenueBookings = allBookings.filter(
      (b) => b.status === "ATTENDED" || b.status === "NO_SHOW" || b.status === "LATE_CANCELLED",
    );
    const revenueToDate = revenueBookings.reduce(
      (sum, b) => sum + gymPayout(b.creditsPaid),
      0,
    );

    return {
      id: gym.id,
      name: gym.name,
      tier: gym.tier,
      allowsPeak: gym.allowsPeak,
      popularity: gym.popularity,
      offPeakFillPct,
      upcomingCount,
      revenueToDate: Math.round(revenueToDate * 100) / 100,
      slots: gym.slots.map((s) => ({
        id: s.id,
        timeBand: s.timeBand,
        capacity: s.capacity,
        booked: s.booked,
        creditCost: s.creditCost,
        startTime: s.startTime,
      })),
    };
  });

  return NextResponse.json(result);
}
