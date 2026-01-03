import { describe, it, expect, vi } from "vitest";
import { canDeleteWithTimestamps } from "@/utils/rateLimiter";

describe("canDeleteWithTimestamps", () => {
  it("allows when under limit", () => {
    const now = 1_000_000;
    const ts = [now - 10_000, now - 20_000];
    expect(canDeleteWithTimestamps(ts, now, 5, 60_000)).toBe(true);
  });

  it("blocks when at or over limit", () => {
    const now = 1_000_000;
    const ts = [now - 1_000, now - 2_000, now - 3_000, now - 4_000, now - 5_000];
    expect(canDeleteWithTimestamps(ts, now, 5, 60_000)).toBe(false);
  });

  it("ignores timestamps outside window", () => {
    const now = 1_000_000;
    const ts = [now - 100_000, now - 200_000];
    expect(canDeleteWithTimestamps(ts, now, 1, 60_000)).toBe(true);
  });
});