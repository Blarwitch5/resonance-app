import { describe, expect, it } from "vitest";

import {
  PULL_REFRESH_THRESHOLD,
  pullProgress,
  resistedPull,
  shouldContinuePull,
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

describe("shouldContinuePull", () => {
  it("lets a sideways swipe keep the shelf still", () => {
    expect(shouldContinuePull(40, 6)).toBe(false);
    expect(shouldContinuePull(32, 20)).toBe(false);
  });

  it("keeps listening when the finger travels down", () => {
    expect(shouldContinuePull(4, 24)).toBe(true);
    expect(shouldContinuePull(0, 8)).toBe(false);
  });

  it("does not start a refresh on a sideways swipe that dips", () => {
    expect(shouldContinuePull(16, 20)).toBe(false);
  });
});
