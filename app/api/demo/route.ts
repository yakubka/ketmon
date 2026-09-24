import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { resolveAttended, resolveNoShow } from "@/lib/booking-rules";

const prisma = new PrismaClient();

// POST /api/demo  { action: "ATTEND" | "NO_SHOW" | "CONVERT", bookingId?, userId?, gymId? }
// Presenter-only tool — not part of the real member/owner UI.
export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.action === "ATTEND" || body.action === "NO_SHOW") {
    const booking = await prisma.booking.findUniqueOrThrow({ where: { id: body.bookingId } });
    const outcome = body.action === "ATTEND"
      ? resolveAttended(booking.creditsPaid)
      : resolveNoShow(booking.creditsPaid);

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: outcome.status },
    });
    // gymPaid is surfaced to the Owner Revenue screen as a read model —
    // for the demo it's enough to compute it here and show it in the response;
    // persist to a GymPayout log if the owner revenue view needs to query it directly.
    return NextResponse.json({ booking: updated, gymPaid: outcome.gymPaid });
  }

  if (body.action === "CONVERT") {
    // README §3.6 Line B — simulated conversion commission.
    // MEMBERSHIP_PRICE and COMMISSION_RATE are cosmetic constants for the demo.
    const MEMBERSHIP_PRICE = 150000; // won, display only
    const COMMISSION_RATE = 0.2;
    const commission = await prisma.commission.create({
      data: {
        gymId: body.gymId,
        userId: body.userId,
        amount: Math.round(MEMBERSHIP_PRICE * COMMISSION_RATE),
      },
    });
    return NextResponse.json({ commission });
  }

  return NextResponse.json({ error: "UNKNOWN_ACTION" }, { status: 400 });
}
