import { describe, expect, it } from "vitest";
import {
  getDefaultActiveIndex,
  journeyEntries,
  resolveJourneyString,
  type JourneyEntry,
  type JourneyLocale,
} from "@/content/journey";

const ALL_LOCALES: JourneyLocale[] = ["en", "de", "es", "ar"];

describe("journey data", () => {
  it("has the expected number of condensed entries (matches Claude design mock)", () => {
    expect(journeyEntries.length).toBeGreaterThanOrEqual(6);
    expect(journeyEntries.length).toBeLessThanOrEqual(8);
  });

  it("entries are in chronological-ASC order by year", () => {
    for (let i = 1; i < journeyEntries.length; i += 1) {
      const prev = parseInt(journeyEntries[i - 1].year, 10);
      const curr = parseInt(journeyEntries[i].year, 10);
      expect(curr).toBeGreaterThanOrEqual(prev);
    }
  });

  it("every entry has a unique id", () => {
    const ids = journeyEntries.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every entry has at least one keyword and ≤ 4 keywords (chip layout sanity)", () => {
    for (const entry of journeyEntries) {
      expect(entry.keywords.length).toBeGreaterThanOrEqual(1);
      expect(entry.keywords.length).toBeLessThanOrEqual(4);
    }
  });

  it("every entry has a non-empty role, org, place, year, yearRange", () => {
    for (const entry of journeyEntries) {
      expect(entry.role.trim()).not.toBe("");
      expect(entry.org.trim()).not.toBe("");
      expect(entry.place.trim()).not.toBe("");
      expect(entry.year.trim()).not.toBe("");
      expect(entry.yearRange.trim()).not.toBe("");
    }
  });

  it("every entry has a chapter and tagline translation for ALL 4 locales", () => {
    for (const entry of journeyEntries) {
      for (const locale of ALL_LOCALES) {
        expect(entry.chapter[locale]).toBeTypeOf("string");
        expect(entry.chapter[locale].trim()).not.toBe("");
        expect(entry.tagline[locale]).toBeTypeOf("string");
        expect(entry.tagline[locale].trim()).not.toBe("");
      }
    }
  });

  it("exactly one entry is marked active (the current present role)", () => {
    const activeEntries = journeyEntries.filter((e) => e.active);
    expect(activeEntries.length).toBe(1);
  });

  describe("getDefaultActiveIndex", () => {
    it("returns the index of the entry flagged active: true (newest-first ordering)", () => {
      const orderedEntries = [...journeyEntries].reverse();
      const idx = getDefaultActiveIndex(orderedEntries);
      // Whichever entry has `active: true` should be the initial focus.
      // For the canonical data this is the M.Sc. — let's assert it lands
      // on an entry whose role mentions M.Sc. (most stable surface check).
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(orderedEntries[idx].active).toBe(true);
      expect(orderedEntries[idx].role).toMatch(/M\.?Sc\.?/i);
    });

    it("falls back to the highest-year entry when no entry is flagged", () => {
      const stripped: JourneyEntry[] = journeyEntries.map((e) => ({
        ...e,
        active: false,
      }));
      const idx = getDefaultActiveIndex(stripped);
      // Highest year wins. Verify by computing it from the data.
      const max = stripped.reduce(
        (acc, e, i) =>
          parseInt(e.year, 10) > acc.year
            ? { year: parseInt(e.year, 10), idx: i }
            : acc,
        { year: -Infinity, idx: 0 },
      );
      expect(idx).toBe(max.idx);
    });

    it("returns 0 for an empty list (defensive)", () => {
      expect(getDefaultActiveIndex([])).toBe(0);
    });
  });

  describe("resolveJourneyString", () => {
    const sample = {
      en: "English",
      de: "Deutsch",
      es: "Español",
      ar: "العربية",
    };

    it("returns the locale-specific string", () => {
      expect(resolveJourneyString(sample, "en")).toBe("English");
      expect(resolveJourneyString(sample, "de")).toBe("Deutsch");
      expect(resolveJourneyString(sample, "es")).toBe("Español");
      expect(resolveJourneyString(sample, "ar")).toBe("العربية");
    });

    it("falls back to English when locale is missing", () => {
      const partial = { en: "English" } as Parameters<
        typeof resolveJourneyString
      >[0];
      expect(resolveJourneyString(partial, "de")).toBe("English");
    });
  });
});
