import { describe, it, expect } from "vitest";
import {
  buildAbsoluteUrl,
  buildLocaleUrl,
  buildLanguageAlternates,
  ogLocale,
  ogAlternateLocales,
  resolveTwitterCard,
  safeJsonLd,
  getMetadataBase,
} from "@/lib/seo";

describe("seo helpers", () => {
  describe("buildAbsoluteUrl", () => {
    it("prefixes relative paths with site URL", () => {
      const url = buildAbsoluteUrl("/images/og.png");
      expect(url).toMatch(/^https?:\/\//);
      expect(url).toContain("/images/og.png");
    });

    it("returns absolute URLs unchanged", () => {
      const url = buildAbsoluteUrl("https://example.com/img.png");
      expect(url).toBe("https://example.com/img.png");
    });

    it("handles empty path", () => {
      const url = buildAbsoluteUrl();
      expect(url).toMatch(/^https?:\/\//);
      expect(url).not.toContain("undefined");
    });
  });

  describe("buildLocaleUrl", () => {
    it("includes locale in URL", () => {
      const url = buildLocaleUrl("de", "/blog/test");
      expect(url).toContain("/de/blog/test");
    });

    it("handles empty path", () => {
      const url = buildLocaleUrl("en");
      expect(url).toContain("/en");
      expect(url).not.toContain("undefined");
    });
  });

  describe("buildLanguageAlternates", () => {
    it("returns all locales plus x-default", () => {
      const alts = buildLanguageAlternates("/about");
      expect(alts).toHaveProperty("en");
      expect(alts).toHaveProperty("de");
      expect(alts).toHaveProperty("x-default");
      expect(alts["x-default"]).toContain("/en/about");
    });
  });

  describe("ogLocale", () => {
    it("maps en to en_US", () => {
      expect(ogLocale("en")).toBe("en_US");
    });

    it("maps de to de_DE", () => {
      expect(ogLocale("de")).toBe("de_DE");
    });

    it("maps ar to ar_SA", () => {
      expect(ogLocale("ar")).toBe("ar_SA");
    });

    it("returns unknown locales as-is", () => {
      expect(ogLocale("fr")).toBe("fr");
    });
  });

  describe("ogAlternateLocales", () => {
    it("excludes current locale", () => {
      const alts = ogAlternateLocales("en");
      expect(alts).not.toContain("en_US");
      expect(alts.length).toBeGreaterThan(0);
    });
  });

  describe("resolveTwitterCard", () => {
    it("returns a valid twitter card type", () => {
      const card = resolveTwitterCard();
      expect(["summary_large_image", "summary", "player", "app"]).toContain(card);
    });
  });

  describe("safeJsonLd", () => {
    it("escapes < to prevent XSS", () => {
      const result = safeJsonLd({ test: "</script><script>alert(1)</script>" });
      expect(result).not.toContain("</script>");
      expect(result).toContain("\\u003c");
    });

    it("produces valid JSON after unescaping", () => {
      const data = { name: "Test", url: "https://example.com" };
      const result = safeJsonLd(data);
      const parsed = JSON.parse(result.replace(/\\u003c/g, "<"));
      expect(parsed).toEqual(data);
    });
  });

  describe("getMetadataBase", () => {
    it("returns a URL object", () => {
      const base = getMetadataBase();
      expect(base).toBeInstanceOf(URL);
      expect(base.protocol).toMatch(/^https?:$/);
    });
  });
});
