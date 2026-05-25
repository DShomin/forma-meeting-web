import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import HomePage from "../page";

afterEach(() => {
  cleanup();
});

describe("HomePage", () => {
  it("renders the root page with Korean heading", () => {
    render(<HomePage />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("회의록 업로드");
  });

  it("renders a main landmark element", () => {
    render(<HomePage />);
    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();
  });

  it("renders description text in Korean", () => {
    render(<HomePage />);
    expect(
      screen.getByText(/Confluence 회의록을 자동으로 생성합니다/)
    ).toBeInTheDocument();
  });

  it("uses responsive mobile-friendly layout classes on main", () => {
    render(<HomePage />);
    const main = screen.getByRole("main");
    expect(main.className).toContain("min-h-");
    expect(main.className).toContain("flex");
    expect(main.className).toContain("px-4");
  });

  it("uses a width-constrained container for readable mobile layout", () => {
    render(<HomePage />);
    const heading = screen.getByRole("heading", { level: 1 });
    // The card wrapping the form should have max-w-lg
    const card = heading.closest("[data-slot='card']");
    expect(card).not.toBeNull();
    expect(card!.className).toContain("max-w-lg");
  });
});
