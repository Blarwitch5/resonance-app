import { describe, expect, it } from "vitest";

import { cameraIssueFromError, canRequestCamera } from "@/lib/discogs/scan-barcode";

describe("cameraIssueFromError", () => {
  it("maps permission and missing camera", () => {
    expect(cameraIssueFromError({ name: "NotAllowedError" })).toBe("permission");
    expect(cameraIssueFromError({ name: "SecurityError" })).toBe("permission");
    expect(cameraIssueFromError({ name: "NotFoundError" })).toBe("missing");
    expect(cameraIssueFromError({ name: "OverconstrainedError" })).toBe("missing");
  });

  it("falls back to unknown", () => {
    expect(cameraIssueFromError(undefined)).toBe("unknown");
    expect(cameraIssueFromError({ name: "AbortError" })).toBe("unknown");
  });
});

describe("canRequestCamera", () => {
  it("is false in tests without mediaDevices", () => {
    expect(canRequestCamera()).toBe(false);
  });
});
