import { describe, expect, it } from "vitest";

import {
  PULL_REFRESH_THRESHOLD,
  pullProgress,
  resistedPull,
  shouldReleaseRefresh,
} from "@/lib/motion/pull";

describe("resistedPull", () => {
  it("stays still against an upward drag", () => {
    expect(resistedPull(-40)).toBe(0);
    expect(resistedPull(0)).toBe(0);
  });

  it("softens the pull so the shelf does not snap", () => {
    expect(resistedPull(80)).toBe(36);
    expect(resistedPull(400)).toBe(120);
  });
});

describe("pullProgress", () => {
  it("fills toward the refresh threshold", () => {
    expect(pullProgress(0)).toBe(0);
    expect(pullProgress(PULL_REFRESH_THRESHOLD / 0.45)).toBe(1);
    expect(pullProgress(20)).toBeCloseTo(9 / PULL_REFRESH_THRESHOLD);
  });
});

describe("shouldReleaseRefresh", () => {
  it("listens only once the wave is full", () => {
    expect(shouldReleaseRefresh(80)).toBe(false);
    expect(shouldReleaseRefresh(PULL_REFRESH_THRESHOLD / 0.45)).toBe(true);
  });
});
