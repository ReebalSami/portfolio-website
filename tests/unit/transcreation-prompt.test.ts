import { describe, it, expect } from "vitest";
import { buildTranscreationPrompt } from "@/lib/i18n/transcreation-prompt";

describe("buildTranscreationPrompt", () => {
  it("includes locale, section, glossary excerpt, and persona", () => {
    const prompt = buildTranscreationPrompt({
      locale: "ar",
      section: "hero",
      sourceText: "Merging five years of engineering and business.",
      glossaryExcerpt: "- data_scientist: عالم البيانات\n- hamburg: هامبورغ",
      personaMd: "Arabic Gulf persona summary...",
      toneCell: "Confident, metric-forward. MSA. Short sentences.",
    });
    expect(prompt).toContain("ar");
    expect(prompt).toContain("hero");
    expect(prompt).toContain("عالم البيانات");
    expect(prompt).toContain("Confident, metric-forward");
    expect(prompt).toContain("Merging five years");
  });

  it("forbids paraphrasing locked glossary terms", () => {
    const prompt = buildTranscreationPrompt({
      locale: "es",
      section: "cv",
      sourceText: "Works at OTTO Group.",
      glossaryExcerpt: "- otto_group: OTTO Group (locked in all locales)",
      personaMd: "ES persona...",
      toneCell: "European Spanish, professional.",
    });
    expect(prompt).toMatch(/glossary|locked|verbatim/i);
  });

  it("includes locale for German transcreation", () => {
    const prompt = buildTranscreationPrompt({
      locale: "de",
      section: "about",
      sourceText: "Five years building data products.",
      glossaryExcerpt: "- data_scientist: Datenwissenschaftler",
      personaMd: "German persona, formal register...",
      toneCell: "Professional, clear, concise.",
    });
    expect(prompt).toContain("de");
    expect(prompt).toContain("DE");
  });

  it("includes source text verbatim in the returned prompt", () => {
    const sourceText =
      "Specialized in machine learning, NLP, and scalable data pipelines.";
    const prompt = buildTranscreationPrompt({
      locale: "es",
      section: "projects",
      sourceText,
      glossaryExcerpt: "- nlp: NLP",
      personaMd: "ES persona...",
      toneCell: "Neutral, technical.",
    });
    expect(prompt).toContain(sourceText);
  });
});
