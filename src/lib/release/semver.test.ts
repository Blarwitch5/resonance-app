import { describe, expect, it } from "vitest";

import { bumpSemver, compareSemver, parseReleaseKind, parseSemver } from "@/lib/release/semver";
import { APP_VERSION, appSemver } from "@/lib/release/version";

describe("parseSemver", () => {
  it("reads major.minor.patch", () => {
    expect(parseSemver("1.4.2")).toEqual({ major: 1, minor: 4, patch: 2 });
  });

  it("rejects a freeform label", () => {
    expect(() => parseSemver("1.4")).toThrow("This version is not semver");
    expect(() => parseSemver("v1.4.2")).toThrow("This version is not semver");
  });
});

describe("bumpSemver", () => {
  const start = { major: 0, minor: 2, patch: 3 };

  it("raises a patch for a fix", () => {
    expect(bumpSemver(start, "patch")).toEqual({ major: 0, minor: 2, patch: 4 });
  });

  it("raises a minor for a feature and resets patch", () => {
    expect(bumpSemver(start, "minor")).toEqual({ major: 0, minor: 3, patch: 0 });
  });

  it("raises a major for a break and resets the rest", () => {
    expect(bumpSemver(start, "major")).toEqual({ major: 1, minor: 0, patch: 0 });
  });
});

describe("compareSemver", () => {
  it("orders releases", () => {
    expect(compareSemver(parseSemver("0.2.0"), parseSemver("0.1.9"))).toBeGreaterThan(0);
    expect(compareSemver(parseSemver("1.0.0"), parseSemver("1.0.0"))).toBe(0);
    expect(compareSemver(parseSemver("0.9.9"), parseSemver("1.0.0"))).toBeLessThan(0);
  });
});

describe("parseReleaseKind", () => {
  it("keeps only major, minor, and patch", () => {
    expect(parseReleaseKind("patch")).toBe("patch");
    expect(parseReleaseKind("build")).toBeNull();
  });
});

describe("appSemver", () => {
  it("stays in sync with the current app version", () => {
    expect(appSemver()).toEqual(parseSemver(APP_VERSION));
  });
});
