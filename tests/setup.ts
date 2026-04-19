import "@testing-library/jest-dom/vitest";

// jsdom does not implement ResizeObserver. Provide a minimal stub so that
// components which observe layout size (e.g. TechMarquee) can mount in unit
// tests without throwing.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}
