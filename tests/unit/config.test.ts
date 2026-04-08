import { describe, it, expect } from "vitest";
import { getConfig, getSiteConfig, getContactConfig } from "@/lib/config";

describe("config", () => {
  it("loads and parses config/site.yaml without errors", () => {
    const config = getConfig();
    expect(config).toBeDefined();
    expect(config.site).toBeDefined();
    expect(config.contact).toBeDefined();
    expect(config.social).toBeDefined();
  });

  it("site config has required fields", () => {
    const site = getSiteConfig();
    expect(site.name).toBeTruthy();
    expect(site.title).toBeTruthy();
    expect(site.url).toMatch(/^https?:\/\//);
    expect(site.description).toBeTruthy();
  });

  it("contact config has email and location", () => {
    const contact = getContactConfig();
    expect(contact.email).toMatch(/@/);
    expect(contact.location).toBeTruthy();
  });

  it("i18n config has locales with a default", () => {
    const config = getConfig();
    expect(config.i18n.locales).toContain("en");
    expect(config.i18n.defaultLocale).toBe("en");
    expect(config.i18n.locales.length).toBeGreaterThanOrEqual(2);
  });

  it("features config has boolean flags", () => {
    const config = getConfig();
    expect(typeof config.features.chatbot).toBe("boolean");
    expect(typeof config.features.analytics).toBe("boolean");
    expect(typeof config.features.downloadCV).toBe("boolean");
  });
});
