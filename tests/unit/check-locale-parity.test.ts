import { describe, it, expect } from "vitest";
import { checkLocaleParity, flattenKeys } from "../../scripts/check-locale-parity";

describe("flattenKeys", () => {
  it("flattens a nested object into dot-separated keys", () => {
    const obj = { a: { b: "1", c: "2" }, d: "3" };
    expect(flattenKeys(obj).sort()).toEqual(["a.b", "a.c", "d"]);
  });
});

describe("checkLocaleParity", () => {
  const en = { home: { hero: { title: "Hello", subtitle: "World" } }, contact: { email: "Email" } };
  const matching = { home: { hero: { title: "Hola", subtitle: "Mundo" } }, contact: { email: "Email" } };
  const missingKey = { home: { hero: { title: "Hola" } }, contact: { email: "Email" } };
  const extraKey = { home: { hero: { title: "Hola", subtitle: "Mundo", extra: "Extra" } }, contact: { email: "Email" } };

  it("returns empty array when locales match", () => {
    expect(checkLocaleParity(en, matching)).toEqual([]);
  });

  it("reports missing key", () => {
    const issues = checkLocaleParity(en, missingKey);
    expect(issues).toContain("missing: home.hero.subtitle");
  });

  it("reports extra key", () => {
    const issues = checkLocaleParity(en, extraKey);
    expect(issues).toContain("extra: home.hero.extra");
  });
});
