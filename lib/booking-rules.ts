import { BookingStatus } from "@prisma/client";
import { gymPayout } from "./pricing";

export const CANCEL_WINDOW_HOURS = 6;

export function hoursUntil(startTime: Date, now: Date = new Date()): number {
  return (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
}

export function isFreeCancel(startTime: Date, now: Date = new Date()): boolean {
  return hoursUntil(startTime, now) >= CANCEL_WINDOW_HOURS;
}

export type CancelOutcome = {
  status: BookingStatus;
  refundCredits: number; // credited back to user balance; 0 if forfeited
  gymPaid: number; // credits paid out to the gym for this outcome
};

/**
 * Free cancel (>=6h out): full refund, gym is NOT paid — the slot can
 * realistically be resold with 6h notice.
 * NOTE: the README states forfeited credits pay the gym, but does not
 * explicitly say whether a free-cancel pays the gym. This function assumes
 * "no" on the reasoning above — flagged as an assumption to confirm.
 */
export function resolveCancellation(creditsPaid: number, startTime: Date, now: Date = new Date()): CancelOutcome {
  if (isFreeCancel(startTime, now)) {
    return { status: BookingStatus.CANCELLED, refundCredits: creditsPaid, gymPaid: 0 };
  }
  return { status: BookingStatus.LATE_CANCELLED, refundCredits: 0, gymPaid: gymPayout(creditsPaid) };
}

/** No-show: credits forfeited, gym is compensated as if the class ran. */
export function resolveNoShow(creditsPaid: number): CancelOutcome {
  return { status: BookingStatus.NO_SHOW, refundCredits: 0, gymPaid: gymPayout(creditsPaid) };
}

/** Attended: normal path, gym is paid its payout share. */
export function resolveAttended(creditsPaid: number): CancelOutcome {
  return { status: BookingStatus.ATTENDED, refundCredits: 0, gymPaid: gymPayout(creditsPaid) };
}
