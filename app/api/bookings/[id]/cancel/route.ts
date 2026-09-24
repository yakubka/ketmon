import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, TxnType } from "@prisma/client";
import { resolveCancellation } from "@/lib/booking-rules";
import { deleteCalendarEvent } from "@/lib/google-calendar";

const prisma = new PrismaClient();

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUniqueOrThrow({
      where: { id },
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

    if (booking.calendarEventId) {
      const user = await tx.user.findUnique({ where: { id: booking.userId } });
      if (user?.googleAccessToken) {
        try {
          await deleteCalendarEvent(user.googleAccessToken, booking.calendarEventId);
        } catch {
          // best-effort
        }
      }
    }

    return { booking, outcome };
  });

  return NextResponse.json(result);
}
