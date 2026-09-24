import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Badge } from "@/components/ui/Badge";

describe("Badge", () => {
  it("renders children text", () => {
    render(<Badge>Off-peak</Badge>);
    expect(screen.getByText("Off-peak")).toBeInTheDocument();
  });

  it("OFF_PEAK variant has emerald styling", () => {
    render(<Badge variant="OFF_PEAK">Test</Badge>);
    const el = screen.getByText("Test");
    expect(el.className).toContain("emerald");
  });

  it("PEAK variant has amber styling", () => {
    render(<Badge variant="PEAK">Test</Badge>);
    const el = screen.getByText("Test");
    expect(el.className).toContain("amber");
  });

  it("STANDARD variant has slate styling", () => {
    render(<Badge variant="STANDARD">Test</Badge>);
    const el = screen.getByText("Test");
    expect(el.className).toContain("slate");
  });

  it("defaults to STANDARD without variant prop", () => {
    render(<Badge>Default</Badge>);
    const el = screen.getByText("Default");
    expect(el.className).toContain("slate");
  });

  it("all three variants produce visually distinct classes", () => {
    const { container: c1 } = render(<Badge variant="OFF_PEAK">A</Badge>);
    const { container: c2 } = render(<Badge variant="STANDARD">B</Badge>);
    const { container: c3 } = render(<Badge variant="PEAK">C</Badge>);
    const cls1 = c1.firstChild as HTMLElement;
    const cls2 = c2.firstChild as HTMLElement;
    const cls3 = c3.firstChild as HTMLElement;
    expect(cls1.className).not.toBe(cls2.className);
    expect(cls2.className).not.toBe(cls3.className);
    expect(cls1.className).not.toBe(cls3.className);
  });
});
