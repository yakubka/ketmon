import { hoursUntil, isFreeCancel, resolveCancellation, resolveNoShow, resolveAttended, CANCEL_WINDOW_HOURS } from "@/lib/booking-rules";

describe("hoursUntil", () => {
  it("returns correct hours between two dates", () => {
    const now = new Date("2026-09-28T10:00:00Z");
    const later = new Date("2026-09-28T16:00:00Z");
    expect(hoursUntil(later, now)).toBe(6);
  });

  it("returns negative when start is in the past", () => {
    const now = new Date("2026-09-28T18:00:00Z");
    const past = new Date("2026-09-28T10:00:00Z");
    expect(hoursUntil(past, now)).toBeLessThan(0);
  });
});

describe("isFreeCancel", () => {
  it("true when 6+ hours before", () => {
    const now = new Date("2026-09-28T10:00:00Z");
    const start = new Date("2026-09-28T16:00:00Z");
    expect(isFreeCancel(start, now)).toBe(true);
  });

  it("true at exactly 6 hours", () => {
    const now = new Date("2026-09-28T10:00:00Z");
    const start = new Date("2026-09-28T16:00:00Z");
    expect(isFreeCancel(start, now)).toBe(true);
  });

  it("false when less than 6 hours", () => {
    const now = new Date("2026-09-28T10:01:00Z");
    const start = new Date("2026-09-28T16:00:00Z");
    expect(isFreeCancel(start, now)).toBe(false);
  });
});

describe("resolveCancellation", () => {
  it("free cancel: full refund, gym not paid", () => {
    const now = new Date("2026-09-28T08:00:00Z");
    const start = new Date("2026-09-28T16:00:00Z");
    const result = resolveCancellation(4, start, now);
    expect(result.status).toBe("CANCELLED");
    expect(result.refundCredits).toBe(4);
    expect(result.gymPaid).toBe(0);
  });

  it("late cancel: no refund, gym paid", () => {
    const now = new Date("2026-09-28T14:00:00Z");
    const start = new Date("2026-09-28T16:00:00Z");
    const result = resolveCancellation(4, start, now);
    expect(result.status).toBe("LATE_CANCELLED");
    expect(result.refundCredits).toBe(0);
    expect(result.gymPaid).toBeGreaterThan(0);
  });
});

describe("resolveNoShow", () => {
  it("credits forfeited, gym paid", () => {
    const result = resolveNoShow(5);
    expect(result.status).toBe("NO_SHOW");
    expect(result.refundCredits).toBe(0);
    expect(result.gymPaid).toBeCloseTo(3.5);
  });
});

describe("resolveAttended", () => {
  it("gym paid normal payout", () => {
    const result = resolveAttended(6);
    expect(result.status).toBe("ATTENDED");
    expect(result.refundCredits).toBe(0);
    expect(result.gymPaid).toBeCloseTo(4.2);
  });
});
