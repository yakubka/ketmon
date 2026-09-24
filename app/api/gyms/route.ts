import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const horizon = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const gyms = await prisma.gym.findMany({
    select: {
      id: true,
      name: true,
      lat: true,
      lng: true,
      rating: true,
      popularity: true,
      tier: true,
      area: true,
      imageUrl: true,
      activities: {
        select: {
          sport: true,
          name: true,
          slots: {
            where: { startTime: { gte: now, lt: horizon } },
            orderBy: { startTime: "asc" },
            take: 6,
            select: { id: true, startTime: true, creditCost: true, timeBand: true, booked: true, capacity: true },
          },
        },
      },
    },
  });

  const result = gyms.map((g) => {
    let nextSlot: {
      id: string;
      startTime: Date;
      creditCost: number;
      timeBand: string;
      activityName: string;
    } | null = null;

    for (const a of g.activities) {
      const slot = a.slots.find((s) => s.booked < s.capacity);
      if (slot && (!nextSlot || slot.startTime < nextSlot.startTime)) {
        nextSlot = {
          id: slot.id,
          startTime: slot.startTime,
          creditCost: slot.creditCost,
          timeBand: slot.timeBand,
          activityName: a.name,
        };
      }
    }

    return {
      id: g.id,
      name: g.name,
      lat: g.lat,
      lng: g.lng,
      rating: g.rating,
      popularity: g.popularity,
      tier: g.tier,
      area: g.area,
      imageUrl: g.imageUrl,
      sports: [...new Set(g.activities.map((a) => a.sport))],
      nextSlot,
    };
  });

  return NextResponse.json(result);
}
