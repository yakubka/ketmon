import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
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
        select: { sport: true },
      },
    },
  });

  const result = gyms.map((g) => ({
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
  }));

  return NextResponse.json(result);
}
