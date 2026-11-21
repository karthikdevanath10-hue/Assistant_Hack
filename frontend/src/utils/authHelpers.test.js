import { describe, expect, it } from "vitest";
import { resolveInitialAuthMode, validateLoginForm, validateSignUpForm } from "./authHelpers";

describe("authHelpers", () => {
  it("resolves login vs signup initial mode from pathname and hash", () => {
    expect(resolveInitialAuthMode("/signup", "")).toBe("signup");
    expect(resolveInitialAuthMode("/", "#/signup")).toBe("signup");
    expect(resolveInitialAuthMode("/", "#/login")).toBe("login");
    expect(resolveInitialAuthMode("/", "")).toBe("landing");
  });

  it("validates login credentials clearly with phone or email", () => {
    expect(validateLoginForm({ identifier: "", password: "abc" })).toMatch(/mobile number or email/i);
    expect(validateLoginForm({ identifier: "bad-email@", password: "abc" })).toMatch(/valid email/i);
    expect(validateLoginForm({ identifier: "12345", password: "abc" })).toMatch(/10-digit mobile/i);
    expect(validateLoginForm({ identifier: "9876543210", password: "" })).toMatch(/password/i);
    expect(validateLoginForm({ identifier: "9876543210", password: "secret" })).toBe("");
    expect(validateLoginForm({ identifier: "shop@example.com", password: "secret" })).toBe("");
  });

  it("validates sign up fields with mandatory phone and optional email", () => {
    // Missing name
    expect(
      validateSignUpForm({ name: "A", phone: "9876543210", email: "", password: "secret", confirmPassword: "secret" })
    ).toMatch(/2 characters/i);

    // Missing phone (phone is mandatory!)
    expect(
      validateSignUpForm({ name: "Karthik", phone: "", email: "shop@example.com", password: "secret", confirmPassword: "secret" })
    ).toMatch(/mandatory/i);

    // Invalid phone
    expect(
      validateSignUpForm({ name: "Karthik", phone: "123", email: "", password: "secret", confirmPassword: "secret" })
    ).toMatch(/10-digit mobile number/i);

    // Valid phone, empty email (email is optional!) -> should PASS!
    expect(
      validateSignUpForm({ name: "Karthik", phone: "9876543210", email: "", password: "secret", confirmPassword: "secret" })
    ).toBe("");

    // Valid phone, invalid email format -> should fail
    expect(
      validateSignUpForm({ name: "Karthik", phone: "9876543210", email: "bad-email", password: "secret", confirmPassword: "secret" })
    ).toMatch(/valid email/i);

    // Short password
    expect(
      validateSignUpForm({ name: "Karthik", phone: "9876543210", email: "", password: "123", confirmPassword: "123" })
    ).toMatch(/6 characters/i);

    // Mismatched passwords
    expect(
      validateSignUpForm({ name: "Karthik", phone: "9876543210", email: "", password: "secret1", confirmPassword: "secret2" })
    ).toMatch(/do not match/i);
  });
});

