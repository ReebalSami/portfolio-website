import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, act } from "@testing-library/react";
import { TechMarquee } from "@/components/shared/tech-marquee";
import type { TechCategory } from "@/content/tech-stack";

const languagesGroup: TechCategory = {
  label: "Programming Languages",
  category: "language",
  skills: [
    { name: "Python", category: "language" },
    { name: "TypeScript", category: "language" },
    { name: "JavaScript", category: "language" },
    { name: "Java", category: "language" },
  ],
};

describe("TechMarquee — SSR / initial render", () => {
  // No layout in these tests: getBoundingClientRect returns 0s in jsdom, so
  // the client-side measurement step bails and we observe the SSR fallback
  // (1 sub-row containing every skill).

  it("renders the category label tied to the section via aria-labelledby", () => {
    const { container } = render(<TechMarquee group={languagesGroup} index={0} />);
    const section = container.querySelector("section");
    expect(section).not.toBeNull();
    const labelId = section?.getAttribute("aria-labelledby");
    expect(labelId).toBeTruthy();
    const label = container.querySelector(`#${labelId}`);
    expect(label?.textContent).toBe("Programming Languages");
  });

  it("renders every skill in the primary (non-aria-hidden) track", () => {
    const { container } = render(<TechMarquee group={languagesGroup} index={0} />);
    const primaryTrack = container.querySelector("ul:not([aria-hidden])");
    expect(primaryTrack).not.toBeNull();
    const items = primaryTrack!.querySelectorAll("li");
    expect(items).toHaveLength(4);
    const names = Array.from(items).map((li) => li.textContent);
    expect(names).toEqual(["Python", "TypeScript", "JavaScript", "Java"]);
  });

  it("renders duplicate tracks marked aria-hidden for seamless loop", () => {
    const { container } = render(<TechMarquee group={languagesGroup} index={0} />);
    const dupes = container.querySelectorAll('ul[aria-hidden="true"]');
    expect(dupes.length).toBeGreaterThanOrEqual(1);
    dupes.forEach((ul) => {
      expect(ul.querySelectorAll("li")).toHaveLength(4);
    });
  });

  it("BUG REGRESSION: primary <ul> has one <li> per skill with token boundaries", () => {
    const { container } = render(<TechMarquee group={languagesGroup} index={0} />);
    const primaryTrack = container.querySelector("ul:not([aria-hidden])") as HTMLUListElement;
    expect(primaryTrack).not.toBeNull();
    const liTexts = Array.from(primaryTrack.querySelectorAll("li")).map(
      (li) => li.textContent?.trim(),
    );
    expect(liTexts).toContain("Python");
    expect(liTexts).toContain("TypeScript");
    expect(liTexts).toContain("JavaScript");
    expect(liTexts).toContain("Java");
    liTexts.forEach((t) => {
      expect(t).not.toMatch(/PythonTypeScript/);
    });
  });

  it("applies [animation-direction:reverse] on odd-index categories (LTR)", () => {
    const { container } = render(<TechMarquee group={languagesGroup} index={1} />);
    const primary = container.querySelector("ul:not([aria-hidden])")!;
    expect(primary.className).toContain("[animation-direction:reverse]");
  });

  it("does NOT apply reverse on even-index categories (LTR)", () => {
    const { container } = render(<TechMarquee group={languagesGroup} index={0} />);
    const primary = container.querySelector("ul:not([aria-hidden])")!;
    expect(primary.className).not.toContain("[animation-direction:reverse]");
  });

  it("inverts the direction pattern when isRtl is true", () => {
    const { container: ltr } = render(
      <TechMarquee group={languagesGroup} index={0} isRtl={false} />,
    );
    const { container: rtl } = render(
      <TechMarquee group={languagesGroup} index={0} isRtl={true} />,
    );
    const ltrTrack = ltr.querySelector("ul:not([aria-hidden])")!;
    const rtlTrack = rtl.querySelector("ul:not([aria-hidden])")!;
    expect(ltrTrack.className).not.toContain("[animation-direction:reverse]");
    expect(rtlTrack.className).toContain("[animation-direction:reverse]");
  });

  it("sets --duration proportional to skill count on the sub-row container", () => {
    const shortGroup: TechCategory = {
      ...languagesGroup,
      skills: languagesGroup.skills.slice(0, 2),
    };
    const longGroup: TechCategory = {
      ...languagesGroup,
      skills: Array.from({ length: 20 }, (_, i) => ({
        name: `Skill${i}`,
        category: "language" as const,
      })),
    };
    const { container: shortC } = render(<TechMarquee group={shortGroup} index={0} />);
    const { container: longC } = render(<TechMarquee group={longGroup} index={0} />);
    const shortDur = shortC
      .querySelector<HTMLDivElement>("[data-subrow]")!
      .style.getPropertyValue("--duration");
    const longDur = longC
      .querySelector<HTMLDivElement>("[data-subrow]")!
      .style.getPropertyValue("--duration");
    expect(shortDur).toBe("30s");
    expect(parseInt(longDur)).toBeGreaterThanOrEqual(parseInt(shortDur));
  });

  it("every track ul has the pause-on-hover class", () => {
    const { container } = render(<TechMarquee group={languagesGroup} index={0} />);
    const tracks = container.querySelectorAll("ul.animate-marquee");
    expect(tracks.length).toBeGreaterThanOrEqual(2);
    tracks.forEach((track) => {
      expect(track.className).toContain("group-hover:[animation-play-state:paused]");
    });
  });
});

describe("TechMarquee — dynamic row splitting", () => {
  // These tests mock getBoundingClientRect (per <li>) and container.clientWidth
  // so the measurement step sees realistic widths and packs accordingly.

  let getBoundingSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Each <li> is 100px wide. GAP_PX = 8 → each item costs 108px.
    getBoundingSpy = vi
      .spyOn(Element.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: Element) {
        if (this.tagName === "LI") {
          return {
            width: 100,
            height: 20,
            top: 0,
            left: 0,
            right: 100,
            bottom: 20,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          } as DOMRect;
        }
        return {
          width: 0,
          height: 0,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        } as DOMRect;
      });
  });

  afterEach(() => {
    getBoundingSpy.mockRestore();
  });

  const mockContainerWidth = (width: number) => {
    // Force <section> clientWidth to the given value.
    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      get() {
        if (this.tagName === "SECTION") return width;
        return 0;
      },
    });
  };

  it("keeps a single sub-row when the natural row width fits the container", async () => {
    // 4 skills * 108px = 432px total. Container 800px → fits in one row.
    mockContainerWidth(800);
    const { container } = render(<TechMarquee group={languagesGroup} index={0} />);
    // Allow useLayoutEffect to run.
    await act(async () => {});
    const subRows = container.querySelectorAll("[data-subrow]");
    expect(subRows.length).toBe(1);
    const primary = container.querySelector("ul:not([aria-hidden])")!;
    expect(primary.querySelectorAll("li")).toHaveLength(4);
  });

  it("splits into multiple sub-rows when the natural row width exceeds the container", async () => {
    // 4 skills * 108px = 432px. Container 200px → must split.
    // maxRow = 200 - 24 = 176. With cost 108 each: row 0 = [skill 0] (108),
    // next skill (216>176) → new row. Result: 4 sub-rows of 1 item each.
    mockContainerWidth(200);
    const { container } = render(<TechMarquee group={languagesGroup} index={0} />);
    await act(async () => {});
    const subRows = container.querySelectorAll("[data-subrow]");
    expect(subRows.length).toBeGreaterThanOrEqual(2);
  });

  it("sub-rows within a category alternate scroll direction (zigzag)", async () => {
    // Force multiple sub-rows.
    mockContainerWidth(200);
    const { container } = render(<TechMarquee group={languagesGroup} index={0} />);
    await act(async () => {});
    const primaries = container.querySelectorAll("ul:not([aria-hidden])");
    expect(primaries.length).toBeGreaterThanOrEqual(2);
    const rev0 = primaries[0].className.includes("[animation-direction:reverse]");
    const rev1 = primaries[1].className.includes("[animation-direction:reverse]");
    expect(rev0).not.toBe(rev1);
  });

  it("every skill appears exactly once across primary sub-rows (no loss, no duplication)", async () => {
    mockContainerWidth(250); // forces a split
    const { container } = render(<TechMarquee group={languagesGroup} index={0} />);
    await act(async () => {});
    const primaries = container.querySelectorAll("ul:not([aria-hidden])");
    const allNames: string[] = [];
    primaries.forEach((ul) => {
      ul.querySelectorAll("li").forEach((li) => {
        allNames.push(li.textContent?.trim() ?? "");
      });
    });
    expect(allNames.sort()).toEqual(
      ["Java", "JavaScript", "Python", "TypeScript"].sort(),
    );
  });
});
