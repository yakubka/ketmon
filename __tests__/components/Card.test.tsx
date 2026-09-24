import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Card } from "@/components/ui/Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card><p>Content</p></Card>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("has border class (not shadow-heavy)", () => {
    const { container } = render(<Card>Test</Card>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("border");
  });

  it("accepts custom className", () => {
    const { container } = render(<Card className="p-8">Test</Card>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("p-8");
  });

  it("has rounded corners", () => {
    const { container } = render(<Card>Test</Card>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("rounded");
  });
});
