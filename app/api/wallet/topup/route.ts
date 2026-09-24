import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { userId, amount } = await req.json();

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: { creditBalance: { increment: amount } },
    });

    await tx.creditTransaction.create({
      data: {
        userId,
        amount,
        type: "PURCHASE",
      },
    });

    return user;
  });

  return NextResponse.json({ creditBalance: result.creditBalance });
}
