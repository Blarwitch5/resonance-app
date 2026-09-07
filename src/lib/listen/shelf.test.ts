import { describe, expect, it } from "vitest";

import { sharedShelfHeadline } from "@/lib/listen/shelf-title";
import { listenShelfHref } from "@/lib/listen/href";

describe("listenShelfHref", () => {
  it("builds an unlisted shelf path", () => {
    expect(listenShelfHref("abc_token-1234567890")).toBe("/listen/shelf/abc_token-1234567890");
  });
});

describe("sharedShelfHeadline", () => {
  it("names the whole shelf", () => {
    expect(sharedShelfHeadline({}, "en")).toBe("Records kept close");
  });

  it("names a filtered listen", () => {
    expect(sharedShelfHeadline({ genre: "Jazz", decade: 1970 }, "en")).toContain("Jazz");
    expect(sharedShelfHeadline({ genre: "Jazz", decade: 1970 }, "en")).toContain("1970");
  });
});
