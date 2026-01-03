import { describe, it, expect } from "vitest";
import { isAdmin } from "@/utils/admin";

describe("isAdmin", () => {
  it("returns false for empty email", () => {
    expect(isAdmin(undefined, "", "")).toBe(false);
  });

  it("allows email in allowlist", () => {
    expect(isAdmin("alice@example.com", "alice@example.com,bob@test.com", "")).toBe(true);
  });

  it("allows email matching domain", () => {
    expect(isAdmin("root@admin.com", "", "admin.com")).toBe(true);
  });

  it("denies email not in allowlist or domain", () => {
    expect(isAdmin("user@public.com", "alice@example.com", "admin.com")).toBe(false);
  });
});