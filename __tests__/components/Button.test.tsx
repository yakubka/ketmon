import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button")).toHaveTextContent("Click me");
  });

  it("defaults to type=button", () => {
    render(<Button>Test</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("fires onClick", () => {
    const fn = jest.fn();
    render(<Button onClick={fn}>Go</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("disabled button does not fire onClick", () => {
    const fn = jest.fn();
    render(<Button disabled onClick={fn}>No</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(fn).not.toHaveBeenCalled();
  });

  it("primary variant has brand background class", () => {
    render(<Button variant="primary">P</Button>);
    expect(screen.getByRole("button").className).toContain("bg-brand");
  });

  it("secondary variant has border", () => {
    render(<Button variant="secondary">S</Button>);
    expect(screen.getByRole("button").className).toContain("border");
  });

  it("ghost variant is transparent", () => {
    render(<Button variant="ghost">G</Button>);
    expect(screen.getByRole("button").className).toContain("bg-transparent");
  });

  it("accepts custom className", () => {
    render(<Button className="mt-4">Custom</Button>);
    expect(screen.getByRole("button").className).toContain("mt-4");
  });
});
