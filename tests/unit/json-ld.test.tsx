import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { JsonLd } from "@/components/seo/json-ld";

describe("JsonLd", () => {
  it("renders a script tag with application/ld+json", () => {
    const data = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Test User",
    };

    const { container } = render(<JsonLd id="test-ld" data={data} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeTruthy();
  });

  it("escapes < in the JSON output", () => {
    const data = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "</script>",
    };

    const { container } = render(<JsonLd id="xss-test" data={data} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script?.innerHTML).not.toContain("</script>");
    expect(script?.innerHTML).toContain("\\u003c");
  });
});
