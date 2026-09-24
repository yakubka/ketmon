import { TimeBand, VenueTier } from "@prisma/client";

/**
 * README §3.3 — every class slot resolves to a TimeBand from its start time.
 * OFF_PEAK  = weekdays 10:00–17:00
 * PEAK      = weekdays 06:00–10:00 and 17:00–22:00
 * STANDARD  = everything else (weekends, and weekday 22:00–24:00 / 05:00–06:00)
 */
export function resolveTimeBand(startTime: Date): TimeBand {
  const day = startTime.getDay(); // 0 = Sunday, 6 = Saturday
  const hour = startTime.getHours();
  const isWeekday = day >= 1 && day <= 5;

  if (!isWeekday) return TimeBand.STANDARD;

  if (hour >= 10 && hour < 17) return TimeBand.OFF_PEAK;
  if ((hour >= 6 && hour < 10) || (hour >= 17 && hour < 22)) return TimeBand.PEAK;
  return TimeBand.STANDARD;
}

/**
 * README §3.4 — dynamic credit price matrix (credits per class).
 * Price = f(venue tier, time band). Shown before booking, always.
 */
const CREDIT_MATRIX: Record<VenueTier, Record<TimeBand, number>> = {
  [VenueTier.NEIGHBORHOOD]: {
    [TimeBand.OFF_PEAK]: 2,
    [TimeBand.STANDARD]: 3,
    [TimeBand.PEAK]: 4,
  },
  [VenueTier.MID]: {
    [TimeBand.OFF_PEAK]: 3,
    [TimeBand.STANDARD]: 4,
    [TimeBand.PEAK]: 5,
  },
  [VenueTier.PREMIUM]: {
    [TimeBand.OFF_PEAK]: 4,
    [TimeBand.STANDARD]: 5,
    [TimeBand.PEAK]: 6,
  },
};

export function creditPrice(tier: VenueTier, band: TimeBand): number {
  return CREDIT_MATRIX[tier][band];
}

/** README §3.1 — display-only won equivalent. Never used for real charges. */
export const WON_PER_CREDIT = 3000;

export function creditsToWonDisplay(credits: number): number {
  return credits * WON_PER_CREDIT;
}

/** README §3.6 — Line A guardrail. Must hold on every booking. */
export const PAYOUT_RATE = 0.7; // gym receives 70% of the credit's value

export function gymPayout(creditCost: number): number {
  return Math.round(creditCost * PAYOUT_RATE * 100) / 100;
}

export function platformMargin(creditCost: number): number {
  return Math.round(creditCost * (1 - PAYOUT_RATE) * 100) / 100;
}
