import { NextRequest, NextResponse } from "next/server";
import { Prisma, PrismaClient, TxnType, BookingStatus } from "@prisma/client";
import { createCalendarEvent } from "@/lib/google-calendar";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { userId, classSlotId } = await req.json();

  try {
    const result = await prisma.$transaction(
      async (tx) => {
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

        const activeBookings = await tx.booking.findMany({
          where: { userId, status: { in: [BookingStatus.BOOKED, BookingStatus.ATTENDED] } },
          include: { classSlot: true },
        });
        // Only the exact same start time conflicts - different slots on the
        // same day (or the same hour on a different day) are fine.
        const sameTime = activeBookings.some(
          (b) => b.classSlot.startTime.getTime() === slot.startTime.getTime(),
        );
        if (sameTime) {
          throw new Error("SLOT_OVERLAP");
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
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && (err.code === "P2002" || err.code === "P2034")) {
      // Unique constraint hit, or a serializable write conflict from a
      // concurrent request racing to book the same slot.
      return NextResponse.json({ error: "SLOT_OVERLAP" }, { status: 409 });
    }
    const message = err instanceof Error ? err.message : "UNKNOWN";
    const status = ["SLOT_FULL", "INSUFFICIENT_CREDITS", "SLOT_OVERLAP"].includes(message) ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
