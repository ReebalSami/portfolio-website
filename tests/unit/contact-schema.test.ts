import { describe, it, expect } from "vitest";
import { contactFormSchema } from "@/lib/contact-schema";

describe("contactFormSchema", () => {
  const validData = {
    name: "Jane Doe",
    email: "jane@example.com",
    subject: "Hello",
    message: "This is a test message that is long enough.",
    website: "",
  };

  it("accepts valid data", () => {
    const result = contactFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects name shorter than 2 chars", () => {
    const result = contactFormSchema.safeParse({ ...validData, name: "A" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = contactFormSchema.safeParse({ ...validData, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects subject shorter than 3 chars", () => {
    const result = contactFormSchema.safeParse({ ...validData, subject: "Hi" });
    expect(result.success).toBe(false);
  });

  it("rejects message shorter than 10 chars", () => {
    const result = contactFormSchema.safeParse({ ...validData, message: "Short" });
    expect(result.success).toBe(false);
  });

  it("rejects honeypot field with content (bot detection)", () => {
    const result = contactFormSchema.safeParse({ ...validData, website: "spam" });
    expect(result.success).toBe(false);
  });

  it("accepts missing website field (optional honeypot)", () => {
    const { website: _website, ...noWebsite } = validData;
    void _website;
    const result = contactFormSchema.safeParse(noWebsite);
    expect(result.success).toBe(true);
  });
});
