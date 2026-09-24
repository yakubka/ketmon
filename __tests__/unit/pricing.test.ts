import { resolveTimeBand, creditPrice, creditsToWonDisplay, gymPayout, platformMargin, WON_PER_CREDIT } from "@/lib/pricing";

describe("resolveTimeBand", () => {
  it("weekday 14:00 is OFF_PEAK", () => {
    const d = new Date("2026-09-28T14:00:00"); // Monday
    expect(resolveTimeBand(d)).toBe("OFF_PEAK");
  });

  it("weekday 08:00 is PEAK", () => {
    const d = new Date("2026-09-28T08:00:00");
    expect(resolveTimeBand(d)).toBe("PEAK");
  });

  it("weekday 18:00 is PEAK", () => {
    const d = new Date("2026-09-28T18:00:00");
    expect(resolveTimeBand(d)).toBe("PEAK");
  });

  it("weekday 23:00 is STANDARD", () => {
    const d = new Date("2026-09-28T23:00:00");
    expect(resolveTimeBand(d)).toBe("STANDARD");
  });

  it("Saturday 14:00 is STANDARD", () => {
    const d = new Date("2026-10-03T14:00:00"); // Saturday
    expect(resolveTimeBand(d)).toBe("STANDARD");
  });

  it("Sunday 09:00 is STANDARD", () => {
    const d = new Date("2026-10-04T09:00:00"); // Sunday
    expect(resolveTimeBand(d)).toBe("STANDARD");
  });

  it("weekday 10:00 boundary is OFF_PEAK", () => {
    const d = new Date("2026-09-28T10:00:00");
    expect(resolveTimeBand(d)).toBe("OFF_PEAK");
  });

  it("weekday 17:00 boundary is PEAK", () => {
    const d = new Date("2026-09-28T17:00:00");
    expect(resolveTimeBand(d)).toBe("PEAK");
  });
});

describe("creditPrice", () => {
  it("NEIGHBORHOOD OFF_PEAK = 2", () => {
    expect(creditPrice("NEIGHBORHOOD" as any, "OFF_PEAK" as any)).toBe(2);
  });

  it("MID STANDARD = 4", () => {
    expect(creditPrice("MID" as any, "STANDARD" as any)).toBe(4);
  });

  it("PREMIUM PEAK = 6", () => {
    expect(creditPrice("PREMIUM" as any, "PEAK" as any)).toBe(6);
  });

  it("PREMIUM OFF_PEAK = 4", () => {
    expect(creditPrice("PREMIUM" as any, "OFF_PEAK" as any)).toBe(4);
  });
});

describe("creditsToWonDisplay", () => {
  it("1 credit = 3000 won", () => {
    expect(creditsToWonDisplay(1)).toBe(3000);
  });

  it("30 credits = 90000 won", () => {
    expect(creditsToWonDisplay(30)).toBe(90000);
  });
});

describe("gymPayout / platformMargin", () => {
  it("payout is 70% of credit cost", () => {
    expect(gymPayout(10)).toBeCloseTo(7);
  });

  it("margin is 30% of credit cost", () => {
    expect(platformMargin(10)).toBeCloseTo(3);
  });

  it("payout + margin = credit cost", () => {
    for (const cost of [2, 3, 4, 5, 6]) {
      expect(gymPayout(cost) + platformMargin(cost)).toBeCloseTo(cost);
    }
  });
});
