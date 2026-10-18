import { describe, it, expect } from "vitest";
import {
  usernameToEmail,
  emailToUsername,
  sanitizeUsername,
} from "../lib/auth/synthetic-email";
import {
  loginSchema,
  changePasswordSchema,
  createCustomerSchema,
} from "../lib/auth/schemas";

describe("Synthetic Email Mapping", () => {
  it("converts usernames to synthetic emails properly", () => {
    expect(usernameToEmail("sharma_wedding")).toBe(
      "sharma_wedding@shadisutra.app"
    );
    expect(usernameToEmail("ADMIN")).toBe("admin@shadisutra.app");
    expect(usernameToEmail("  rajesh_mehta  ")).toBe(
      "rajesh_mehta@shadisutra.app"
    );
  });

  it("extracts username from synthetic email properly", () => {
    expect(emailToUsername("sharma_wedding@shadisutra.app")).toBe(
      "sharma_wedding"
    );
  });

  it("sanitizes username characters", () => {
    expect(sanitizeUsername("John.Doe#123")).toBe("johndoe123");
    expect(sanitizeUsername("sharma-wedding_01")).toBe("sharma-wedding_01");
  });
});

describe("Auth Validation Schemas", () => {
  it("validates login credentials", () => {
    const valid = loginSchema.safeParse({
      username: "admin_user",
      password: "SecretPassword123",
    });
    expect(valid.success).toBe(true);

    const invalid = loginSchema.safeParse({
      username: "a", // too short
      password: "",
    });
    expect(invalid.success).toBe(false);
  });

  it("validates change password requirements", () => {
    // Valid password
    const valid = changePasswordSchema.safeParse({
      newPassword: "SafePassword2026",
      confirmPassword: "SafePassword2026",
    });
    expect(valid.success).toBe(true);

    // Mismatched passwords
    const mismatch = changePasswordSchema.safeParse({
      newPassword: "SafePassword2026",
      confirmPassword: "DifferentPassword2026",
    });
    expect(mismatch.success).toBe(false);

    // Missing number
    const noNumber = changePasswordSchema.safeParse({
      newPassword: "SafePasswordOnly",
      confirmPassword: "SafePasswordOnly",
    });
    expect(noNumber.success).toBe(false);

    // Too short
    const tooShort = changePasswordSchema.safeParse({
      newPassword: "P1a",
      confirmPassword: "P1a",
    });
    expect(tooShort.success).toBe(false);
  });

  it("validates customer creation schema", () => {
    const valid = createCustomerSchema.safeParse({
      fullName: "Ananya Sharma",
      username: "ananya_wedding",
      password: "CustomPassword123",
      eventId: "123e4567-e89b-12d3-a456-426614174000",
    });
    expect(valid.success).toBe(true);

    const invalidUsername = createCustomerSchema.safeParse({
      fullName: "Ananya Sharma",
      username: "Ananya Wedding With Spaces",
    });
    expect(invalidUsername.success).toBe(false);
  });
});
