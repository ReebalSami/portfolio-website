import { describe, it, expect } from "vitest";
import { loadGlossary, formFor, type Glossary } from "@/lib/i18n/glossary";

describe("glossary", () => {
  const g = loadGlossary();

  it("loads and parses glossary.yaml", () => {
    expect(g.meta.version).toBe(1);
    expect(g.meta.locales).toEqual(["en", "de", "es", "ar"]);
  });

  it("resolves locked_source to same form for all locales", () => {
    expect(formFor(g, "otto_group", "ar")).toBe("OTTO Group");
    expect(formFor(g, "otto_group", "de")).toBe("OTTO Group");
  });

  it("resolves translated term per locale", () => {
    expect(formFor(g, "data_scientist", "ar")).toBe("عالم البيانات");
    expect(formFor(g, "data_scientist", "es")).toBe("Científico de Datos");
  });

  it("throws on unknown id", () => {
    expect(() => formFor(g, "nonexistent_id", "en")).toThrow();
  });

  it("throws on valid id but missing locale form", () => {
    // Simulate a translated entry with only 2 locale forms
    const partial = {
      meta: { version: 1, locales: ["en", "de", "es", "ar"], last_review: "2026-04-22" },
      test: [{ id: "partial_term", category: "translated", forms: { en: "English", de: "German" } }],
    } as unknown as Glossary;
    expect(() => formFor(partial, "partial_term", "ar")).toThrow("no form for id=partial_term locale=ar");
  });
});
