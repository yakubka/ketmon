import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { kstDateString, kstDayRange } from "@/lib/kst";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(req.url);
  const dateStr = url.searchParams.get("date") ?? kstDateString();

  const { start: dayStart, end: dayEnd } = kstDayRange(dateStr);

  const now = new Date();
  const filterStart = dayStart < now ? now : dayStart;

  const gym = await prisma.gym.findUnique({
    where: { id },
    include: {
      activities: {
        include: {
          slots: {
            where: { startTime: { gte: filterStart, lt: dayEnd } },
            orderBy: { startTime: "asc" },
          },
        },
      },
    },
  });

  if (!gym) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(gym);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const updated = await prisma.gym.update({
    where: { id },
    data: { allowsPeak: body.allowsPeak },
  });

  return NextResponse.json(updated);
}
