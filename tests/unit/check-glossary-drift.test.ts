import { describe, it, expect } from "vitest";
import { detectDrift } from "../../scripts/check-glossary-drift";

describe("detectDrift", () => {
  it("returns no issues when content uses correct locale form", () => {
    const issues = detectDrift(
      { id: "data_scientist", category: "translated", forms: { en: "Data Scientist", ar: "عالم البيانات", es: "Científico de Datos", de: "Data Scientist" } },
      "ar",
      "أهلاً، أنا عالم البيانات"
    );
    expect(issues).toHaveLength(0);
  });

  it("detects wrong-locale form in target content (EN form in AR text)", () => {
    const issues = detectDrift(
      { id: "data_scientist", category: "translated", forms: { en: "Data Scientist", ar: "عالم البيانات", es: "Científico de Datos", de: "Data Scientist" } },
      "ar",
      "I am a Data Scientist"  // EN form in AR content
    );
    // Should report drift: EN form "Data Scientist" found in AR content
    expect(issues.length).toBeGreaterThan(0);
  });

  it("does not flag locked_source terms (same in all locales)", () => {
    const issues = detectDrift(
      { id: "otto_group", category: "locked_source", forms: { all: "OTTO Group" } },
      "ar",
      "أعمل في OTTO Group"
    );
    expect(issues).toHaveLength(0);
  });

  it("does not flag English tech terms in Spanish/German content (code-switch allowed)", () => {
    const issues = detectDrift(
      { id: "graphrag", category: "locked_source", forms: { all: "GraphRAG" } },
      "es",
      "Usé GraphRAG para el proyecto"
    );
    expect(issues).toHaveLength(0);
  });
});
