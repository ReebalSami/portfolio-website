import { describe, it, expect } from "vitest";
import { loadGlossary, formFor } from "@/lib/i18n/glossary";

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
});
