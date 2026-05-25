import { describe, it, expect } from "vitest";
import { viewport, metadata } from "../app/layout";
import fs from "fs";
import path from "path";

describe("Mobile phone browser accessibility", () => {
  describe("viewport configuration for mobile rendering", () => {
    it("sets width to device-width for proper mobile scaling", () => {
      expect(viewport.width).toBe("device-width");
    });

    it("sets initialScale to 1 so content is not zoomed in or out", () => {
      expect(viewport.initialScale).toBe(1);
    });

    it("prevents unwanted zoom with maximumScale and userScalable", () => {
      expect(viewport.maximumScale).toBe(1);
      expect(viewport.userScalable).toBe(false);
    });

    it("has themeColor for mobile browser chrome styling", () => {
      expect(viewport.themeColor).toBeDefined();
      expect(typeof viewport.themeColor).toBe("string");
    });
  });

  describe("PWA installability on mobile", () => {
    it("references manifest.json in metadata", () => {
      expect(metadata.manifest).toBe("/manifest.json");
    });

    it("manifest.json exists and has standalone display for app-like mobile experience", () => {
      const manifestPath = path.resolve(
        __dirname,
        "../public/manifest.json"
      );
      // Adjust path since __dirname is in src/__tests__
      const altPath = path.resolve(
        __dirname,
        "../../public/manifest.json"
      );
      const filePath = fs.existsSync(manifestPath)
        ? manifestPath
        : altPath;
      const manifest = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      expect(manifest.display).toBe("standalone");
      expect(manifest.start_url).toBe("/");
    });

    it("manifest has icons sized for mobile home screen (192x192 and 512x512)", () => {
      const manifestPath = path.resolve(
        __dirname,
        "../../public/manifest.json"
      );
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      const sizes = manifest.icons.map(
        (i: { sizes: string }) => i.sizes
      );
      expect(sizes).toContain("192x192");
      expect(sizes).toContain("512x512");
    });
  });

  describe("iOS Safari support", () => {
    it("enables apple-mobile-web-app-capable for fullscreen on iOS", () => {
      const appleWebApp = metadata.appleWebApp as {
        capable: boolean;
        statusBarStyle: string;
        title: string;
      };
      expect(appleWebApp).toBeDefined();
      expect(appleWebApp.capable).toBe(true);
    });

    it("sets apple-mobile-web-app status bar style", () => {
      const appleWebApp = metadata.appleWebApp as {
        capable: boolean;
        statusBarStyle: string;
        title: string;
      };
      expect(appleWebApp.statusBarStyle).toBe("default");
    });

    it("provides a title for iOS home screen", () => {
      const appleWebApp = metadata.appleWebApp as {
        capable: boolean;
        statusBarStyle: string;
        title: string;
      };
      expect(appleWebApp.title).toBeDefined();
      expect(appleWebApp.title.length).toBeGreaterThan(0);
    });
  });

  describe("Korean language for Korean mobile users", () => {
    it("metadata title is in Korean", () => {
      expect(metadata.title).toMatch(/회의록/);
    });

    it("metadata description is in Korean", () => {
      expect(metadata.description).toMatch(/회의/);
    });
  });
});
