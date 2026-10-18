import { describe, it, expect } from "vitest";
import { enquirySchema } from "../lib/validation";

describe("Enquiry Validation Schema", () => {
  it("validates a well-formed enquiry", () => {
    const validData = {
      name: "Ananya Sharma",
      phone: "9876543210",
      eventType: "wedding" as const,
      eventDate: "2026-12-25",
      message: "Looking for royal mandap and sangeet planning in Jaipur.",
      website_hp: "",
    };

    const result = enquirySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects bot submissions when honeypot field is populated", () => {
    const botData = {
      name: "Spam Bot",
      phone: "1234567890",
      eventType: "birthday" as const,
      message: "Buy cheap crypto now!",
      website_hp: "http://spam.example.com",
    };

    const result = enquirySchema.safeParse(botData);
    expect(result.success).toBe(false);
  });

  it("rejects phone numbers with invalid characters", () => {
    const invalidPhone = {
      name: "Test User",
      phone: "abcd123456",
      eventType: "function" as const,
      message: "Corporate gala dinner inquiry for 200 guests.",
      website_hp: "",
    };

    const result = enquirySchema.safeParse(invalidPhone);
    expect(result.success).toBe(false);
  });

  it("enforces minimum message length", () => {
    const shortMessage = {
      name: "Test User",
      phone: "9876543210",
      eventType: "wedding" as const,
      message: "Hi",
      website_hp: "",
    };

    const result = enquirySchema.safeParse(shortMessage);
    expect(result.success).toBe(false);
  });
});
