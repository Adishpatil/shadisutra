import { describe, it, expect } from "vitest";
import {
  usernameToEmail,
  emailToUsername,
  sanitizeUsername,
} from "../lib/auth/synthetic-email";
import { loginSchema } from "../lib/auth/schemas";

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
});
