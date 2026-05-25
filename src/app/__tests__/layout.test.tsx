import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import RootLayout, { metadata, viewport } from "../layout";

afterEach(() => {
  cleanup();
});

describe("RootLayout", () => {
  it("renders children within the layout", () => {
    render(
      <RootLayout>
        <div data-testid="child">child content</div>
      </RootLayout>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByTestId("child")).toHaveTextContent("child content");
  });

  it("sets lang attribute to ko on html element", () => {
    render(
      <RootLayout>
        <span>test</span>
      </RootLayout>
    );
    const htmlEl = document.documentElement;
    expect(htmlEl.getAttribute("lang")).toBe("ko");
  });

  it("applies Tailwind CSS classes to body", () => {
    render(
      <RootLayout>
        <span>test</span>
      </RootLayout>
    );
    const body = document.body;
    expect(body.className).toContain("min-h-screen");
  });
});

describe("RootLayout mobile-optimized meta tags", () => {
  it("exports viewport with device-width and initialScale 1", () => {
    expect(viewport).toBeDefined();
    expect(viewport.width).toBe("device-width");
    expect(viewport.initialScale).toBe(1);
  });

  it("exports viewport with maximumScale 1 and userScalable false to prevent unwanted zoom", () => {
    expect(viewport.maximumScale).toBe(1);
    expect(viewport.userScalable).toBe(false);
  });

  it("exports viewport with themeColor for mobile browser chrome", () => {
    expect(viewport.themeColor).toBe("#4F46E5");
  });

  it("exports metadata with apple-mobile-web-app-capable enabled", () => {
    expect(metadata.appleWebApp).toBeDefined();
    const appleWebApp = metadata.appleWebApp as {
      capable: boolean;
      statusBarStyle: string;
      title: string;
    };
    expect(appleWebApp.capable).toBe(true);
    expect(appleWebApp.statusBarStyle).toBe("default");
    expect(appleWebApp.title).toBe("FORMA 회의록");
  });

  it("exports metadata with manifest for PWA", () => {
    expect(metadata.manifest).toBe("/manifest.json");
  });
});
