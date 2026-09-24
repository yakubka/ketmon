import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();

  const updated = await prisma.gym.update({
    where: { id: params.id },
    data: { allowsPeak: body.allowsPeak },
  });

  return NextResponse.json(updated);
}
