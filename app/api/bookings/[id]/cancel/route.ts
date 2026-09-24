import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, TxnType } from "@prisma/client";
import { resolveCancellation } from "@/lib/booking-rules";

const prisma = new PrismaClient();

// POST /api/bookings/:id/cancel
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const result = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUniqueOrThrow({
      where: { id: params.id },
      include: { classSlot: true },
    });

    const outcome = resolveCancellation(booking.creditsPaid, booking.classSlot.startTime);

    await tx.booking.update({
      where: { id: booking.id },
      data: { status: outcome.status },
    });

    await tx.classSlot.update({
      where: { id: booking.classSlotId },
      data: { booked: { decrement: 1 } },
    });

    if (outcome.refundCredits > 0) {
      await tx.user.update({
        where: { id: booking.userId },
        data: { creditBalance: { increment: outcome.refundCredits } },
      });
      await tx.creditTransaction.create({
        data: {
          userId: booking.userId,
          amount: outcome.refundCredits,
          type: TxnType.REFUND,
          bookingId: booking.id,
        },
      });
    }

    return { booking, outcome };
  });

  return NextResponse.json(result);
}
