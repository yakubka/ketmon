import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, TxnType, BookingStatus } from "@prisma/client";
import { createCalendarEvent } from "@/lib/google-calendar";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { userId, classSlotId } = await req.json();

  const result = await prisma.$transaction(async (tx) => {
    const slot = await tx.classSlot.findUniqueOrThrow({
      where: { id: classSlotId },
      include: { gym: true, activity: true },
    });
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });

    if (slot.booked >= slot.capacity) {
      throw new Error("SLOT_FULL");
    }
    if (user.creditBalance < slot.creditCost) {
      throw new Error("INSUFFICIENT_CREDITS");
    }

    const booking = await tx.booking.create({
      data: {
        userId,
        classSlotId,
        creditsPaid: slot.creditCost,
        status: BookingStatus.BOOKED,
      },
    });

    await tx.classSlot.update({
      where: { id: classSlotId },
      data: { booked: { increment: 1 } },
    });

    await tx.user.update({
      where: { id: userId },
      data: { creditBalance: { decrement: slot.creditCost } },
    });

    await tx.creditTransaction.create({
      data: {
        userId,
        amount: -slot.creditCost,
        type: TxnType.SPEND,
        bookingId: booking.id,
      },
    });

    if (user.googleAccessToken) {
      try {
        const event = await createCalendarEvent(user.googleAccessToken, {
          gymName: slot.gym.name,
          activityName: slot.activity.name,
          startTime: slot.startTime.toISOString(),
          durationMin: slot.activity.durationMin,
          address: slot.gym.address,
        });
        if (event.id) {
          await tx.booking.update({
            where: { id: booking.id },
            data: { calendarEventId: event.id },
          });
        }
      } catch {
        // calendar event creation is best-effort
      }
    }

    return booking;
  });

  return NextResponse.json(result);
}
