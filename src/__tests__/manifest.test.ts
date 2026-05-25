import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("PWA manifest.json", () => {
  const manifestPath = path.resolve(__dirname, "../../public/manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

  it("is valid JSON with required PWA fields", () => {
    expect(manifest).toBeDefined();
    expect(typeof manifest).toBe("object");
  });

  it("has a name field", () => {
    expect(manifest.name).toBeDefined();
    expect(typeof manifest.name).toBe("string");
    expect(manifest.name.length).toBeGreaterThan(0);
  });

  it("has a short_name field", () => {
    expect(manifest.short_name).toBeDefined();
    expect(typeof manifest.short_name).toBe("string");
    expect(manifest.short_name.length).toBeGreaterThan(0);
  });

  it("has start_url set to /", () => {
    expect(manifest.start_url).toBe("/");
  });

  it("has display set to minimal-ui", () => {
    expect(manifest.display).toBe("minimal-ui");
  });

  it("has lang set to ko", () => {
    expect(manifest.lang).toBe("ko");
  });

  it("has icons array with at least one icon", () => {
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(1);
  });

  it("has icons with required sub-fields (src, sizes, type)", () => {
    for (const icon of manifest.icons) {
      expect(icon.src).toBeDefined();
      expect(typeof icon.src).toBe("string");
      expect(icon.sizes).toBeDefined();
      expect(typeof icon.sizes).toBe("string");
      expect(icon.type).toBeDefined();
      expect(typeof icon.type).toBe("string");
    }
  });

  it("has a 192x192 icon", () => {
    const icon192 = manifest.icons.find(
      (i: { sizes: string }) => i.sizes === "192x192"
    );
    expect(icon192).toBeDefined();
  });

  it("has a 512x512 icon", () => {
    const icon512 = manifest.icons.find(
      (i: { sizes: string }) => i.sizes === "512x512"
    );
    expect(icon512).toBeDefined();
  });

  it("has background_color field", () => {
    expect(manifest.background_color).toBeDefined();
    expect(typeof manifest.background_color).toBe("string");
  });

  it("has theme_color field", () => {
    expect(manifest.theme_color).toBeDefined();
    expect(typeof manifest.theme_color).toBe("string");
  });

  it("icon files exist on disk", () => {
    for (const icon of manifest.icons) {
      const iconPath = path.resolve(
        __dirname,
        "../../public",
        icon.src.replace(/^\//, "")
      );
      expect(fs.existsSync(iconPath)).toBe(true);
    }
  });
});
