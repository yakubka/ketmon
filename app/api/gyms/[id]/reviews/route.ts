import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const reviews = await prisma.review.findMany({
    where: { gymId: params.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reviews);
}
