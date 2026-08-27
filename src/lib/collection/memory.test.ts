import { describe, expect, it } from "vitest";

import { memoryExcerpt } from "@/lib/collection/memory";

describe("memoryExcerpt", () => {
  it("returns the first non-empty line", () => {
    expect(memoryExcerpt("\n  Bought in the rain.\nAnother line.")).toBe("Bought in the rain.");
  });

  it("collapses inner whitespace", () => {
    expect(memoryExcerpt("A   shop,   a friend.")).toBe("A shop, a friend.");
  });

  it("clips a long line at a word boundary", () => {
    const excerpt = memoryExcerpt(
      "This memory stretches far beyond the first glance along the shelf, past the window, into the rain, and keeps going until it must be cut before the last word.",
    );

    expect(excerpt?.endsWith("…")).toBe(true);
    expect(excerpt && excerpt.length <= 121).toBe(true);
  });

  it("returns nothing without a memory", () => {
    expect(memoryExcerpt(null)).toBeUndefined();
    expect(memoryExcerpt("   \n  ")).toBeUndefined();
  });
});
