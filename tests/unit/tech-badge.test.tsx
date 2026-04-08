import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TechBadge } from "@/components/shared/tech-badge";

describe("TechBadge", () => {
  it("renders the tech name", () => {
    render(<TechBadge name="Python" />);
    expect(screen.getByText("Python")).toBeInTheDocument();
  });

  it("renders with a specific category", () => {
    render(<TechBadge name="React" category="framework" />);
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<TechBadge name="Docker" className="my-custom" />);
    const badge = screen.getByText("Docker");
    expect(badge).toHaveClass("my-custom");
  });

  it("defaults to 'default' category styles", () => {
    render(<TechBadge name="Other" />);
    expect(screen.getByText("Other")).toBeInTheDocument();
  });
});
