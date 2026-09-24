import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const gyms = await prisma.gym.findMany({
    include: {
      activities: {
        include: {
          slots: {
            where: { startTime: { gte: new Date() } },
            orderBy: { startTime: "asc" },
          },
        },
      },
    },
  });

  return NextResponse.json(gyms);
}
