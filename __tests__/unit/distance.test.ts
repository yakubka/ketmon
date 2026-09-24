import { distanceKm } from "@/lib/distance";

describe("distanceKm", () => {
  it("same point returns 0", () => {
    expect(distanceKm(37.4979, 127.0276, 37.4979, 127.0276)).toBe(0);
  });

  it("Gangnam to Seoul Station is ~7-10 km", () => {
    const d = distanceKm(37.4979, 127.0276, 37.5547, 126.9707);
    expect(d).toBeGreaterThan(7);
    expect(d).toBeLessThan(10);
  });

  it("Seoul to Busan is ~320-330 km", () => {
    const d = distanceKm(37.5665, 126.978, 35.1796, 129.0756);
    expect(d).toBeGreaterThan(310);
    expect(d).toBeLessThan(340);
  });

  it("returns positive regardless of argument order", () => {
    const a = distanceKm(37.4979, 127.0276, 37.5547, 126.9707);
    const b = distanceKm(37.5547, 126.9707, 37.4979, 127.0276);
    expect(a).toBeCloseTo(b);
  });
});
