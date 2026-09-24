import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  const { userId, name } = await req.json();

  if (!userId || !name) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { name },
  });

  return NextResponse.json({ id: user.id, name: user.name });
}
