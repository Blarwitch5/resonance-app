import { describe, expect, it } from "vitest";

import { searchFieldHasClear } from "@/components/ui/search-field";

describe("searchFieldHasClear", () => {
  it("stays quiet on an empty listen", () => {
    expect(searchFieldHasClear(undefined)).toBe(false);
    expect(searchFieldHasClear("")).toBe(false);
  });

  it("offers to release a typed listen", () => {
    expect(searchFieldHasClear("ok")).toBe(true);
    expect(searchFieldHasClear("  ")).toBe(true);
  });
});
