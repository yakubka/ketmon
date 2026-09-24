import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  const { userId, name, favoriteSports, preferredTimeBand } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const data: {
    name?: string;
    favoriteSports?: string;
    preferredTimeBand?: string;
  } = {};
  if (typeof name === "string" && name.trim()) data.name = name.trim();
  if (Array.isArray(favoriteSports)) data.favoriteSports = favoriteSports.join(",");
  if (typeof preferredTimeBand === "string") data.preferredTimeBand = preferredTimeBand;

  const user = await prisma.user.update({ where: { id: userId }, data });

  return NextResponse.json({
    id: user.id,
    name: user.name,
    favoriteSports: user.favoriteSports,
    preferredTimeBand: user.preferredTimeBand,
  });
}
