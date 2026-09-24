import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const PLAN_MAP: Record<number, string> = {
  20: "Starter",
  40: "Standard",
  80: "Premium",
};

export async function POST(req: NextRequest) {
  const { userId, amount } = await req.json();

  const planName = PLAN_MAP[amount] ?? "Starter";
  const planExpiresAt = new Date();
  planExpiresAt.setDate(planExpiresAt.getDate() + 30);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: {
        creditBalance: { increment: amount },
        planName,
        planExpiresAt,
      },
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

  return NextResponse.json({
    creditBalance: result.creditBalance,
    planName: result.planName,
    planExpiresAt: result.planExpiresAt,
  });
}
