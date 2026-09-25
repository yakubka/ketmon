import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "MISSING_USER_ID" }, { status: 400 });
  }

  const subscriptions = await prisma.userSubscription.findMany({
    where: { userId, expiresAt: { gte: new Date() } },
    include: { gym: { select: { name: true } } },
    orderBy: { expiresAt: "asc" },
  });

  return NextResponse.json(
    subscriptions.map((s) => ({
      id: s.id,
      gymName: s.gym.name,
      months: s.months,
      price: s.price,
      startedAt: s.startedAt,
      expiresAt: s.expiresAt,
    })),
  );
}

export async function POST(req: NextRequest) {
  const { userId, planId } = await req.json();

  try {
    const plan = await prisma.subscriptionPlan.findUniqueOrThrow({ where: { id: planId } });

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + plan.months);

    const subscription = await prisma.userSubscription.create({
      data: {
        userId,
        gymId: plan.gymId,
        planId: plan.id,
        months: plan.months,
        price: plan.price,
        expiresAt,
      },
    });

    return NextResponse.json(subscription);
  } catch {
    return NextResponse.json({ error: "SUBSCRIPTION_FAILED" }, { status: 500 });
  }
}
