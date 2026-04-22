import { describe, it, expect, beforeEach } from "vitest";
import { validateLocale } from "@/app/api/chat/route-helpers";

describe("validateLocale", () => {
  it("accepts valid locales", () => {
    expect(validateLocale("en")).toBe("en");
    expect(validateLocale("de")).toBe("de");
    expect(validateLocale("es")).toBe("es");
    expect(validateLocale("ar")).toBe("ar");
  });
  it("falls back to en on invalid or missing", () => {
    expect(validateLocale("fr")).toBe("en");
    expect(validateLocale(undefined)).toBe("en");
    expect(validateLocale("")).toBe("en");
    expect(validateLocale(null)).toBe("en");
  });
});

import { loadLocaleContext } from "@/app/api/chat/route-helpers";
import fs from "node:fs";
import path from "node:path";

describe("loadLocaleContext", () => {
  const tmpDir = path.resolve("/tmp/chatbot-ctx-test");
  beforeEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    fs.mkdirSync(tmpDir, { recursive: true });
    fs.writeFileSync(path.join(tmpDir, "chatbot-context.md"), "EN content");
    fs.writeFileSync(path.join(tmpDir, "chatbot-context.ar.md"), "AR content");
  });
  it("loads locale-specific file when it exists", async () => {
    const c = await loadLocaleContext("ar", tmpDir);
    expect(c).toBe("AR content");
  });
  it("falls back to EN when locale file missing", async () => {
    const c = await loadLocaleContext("de", tmpDir);
    expect(c).toBe("EN content");
  });
});

import { buildSystemPrompt } from "@/app/api/chat/route-helpers";

describe("buildSystemPrompt", () => {
  it("ar: contains Arabic persona text", () => {
    const p = buildSystemPrompt("ar", "<context>bio</context>");
    expect(p).toContain("العربية");
    expect(p).toContain("<context>bio</context>");
    expect(p).not.toMatch(/respond in german|use sie/i);
  });
  it("de: uses Du-form persona block", () => {
    const p = buildSystemPrompt("de", "ctx");
    expect(p).toMatch(/\bDu\b/);
    expect(p).not.toMatch(/\bSie\b/);
  });
  it("es: uses tú-form persona block", () => {
    const p = buildSystemPrompt("es", "ctx");
    expect(p).toMatch(/\btú\b/);
  });
  it("en: uses English persona with Reebal reference", () => {
    const p = buildSystemPrompt("en", "ctx");
    expect(p).toContain("Reebal");
    expect(p).toMatch(/friendly|competent|modern/i);
  });
});
