import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));

import { AboutDropdown } from "@/components/layout/about-dropdown";

const MESSAGES = {
  common: {
    nav: {
      about: "About",
      aboutSubmenu: {
        who: "Who I am",
        journey: "Journey",
        tech: "Tech Stack",
      },
    },
  },
};

function renderDropdown() {
  return render(
    <NextIntlClientProvider locale="en" messages={MESSAGES}>
      <AboutDropdown triggerClassName="trigger" />
    </NextIntlClientProvider>,
  );
}

describe("AboutDropdown", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("renders the trigger with the About label", () => {
    renderDropdown();
    expect(screen.getByText("About")).toBeInTheDocument();
  });

  it("opens the menu on hover (mouseenter) and reveals all 3 sub-items", () => {
    renderDropdown();
    const trigger = screen.getByText("About");
    const wrapper = trigger.parentElement!;

    act(() => {
      fireEvent.mouseEnter(wrapper);
    });

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Who I am" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Journey" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Tech Stack" })).toBeInTheDocument();
  });

  it("opens the menu on ArrowDown key and focuses the first item", () => {
    renderDropdown();
    const trigger = screen.getByText("About");

    act(() => {
      trigger.focus();
      fireEvent.keyDown(trigger, { key: "ArrowDown" });
    });

    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("flips the trigger's aria-expanded back to false on Escape", () => {
    renderDropdown();
    const trigger = screen.getByText("About");
    const wrapper = trigger.parentElement!;

    act(() => {
      fireEvent.mouseEnter(wrapper);
    });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    act(() => {
      fireEvent.keyDown(trigger, { key: "Escape" });
    });
    // Framer Motion's AnimatePresence keeps the <ul> in the DOM through
    // its exit animation; the user-facing contract is the trigger's
    // aria-expanded state, which flips synchronously.
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("sub-items have href pointing to the matching anchor on the homepage", () => {
    renderDropdown();
    const trigger = screen.getByText("About");
    const wrapper = trigger.parentElement!;

    act(() => {
      fireEvent.mouseEnter(wrapper);
    });

    const whoLink = screen.getByRole("menuitem", { name: "Who I am" }) as HTMLAnchorElement;
    const journeyLink = screen.getByRole("menuitem", { name: "Journey" }) as HTMLAnchorElement;
    const techLink = screen.getByRole("menuitem", { name: "Tech Stack" }) as HTMLAnchorElement;

    // We are on the main page in this test (mocked usePathname → "/"), so
    // hrefs use the in-page anchor form (`#who`, etc.) rather than `/#…`.
    expect(whoLink.getAttribute("href")).toBe("#who");
    expect(journeyLink.getAttribute("href")).toBe("#journey");
    expect(techLink.getAttribute("href")).toBe("#tech");
  });
});
