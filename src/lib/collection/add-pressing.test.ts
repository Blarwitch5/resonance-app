import { describe, expect, it } from "vitest";

import { shouldShowAddPressing } from "@/lib/collection/add-pressing";

describe("shouldShowAddPressing", () => {
  it("stays on the shelf and explorer when signed in", () => {
    expect(shouldShowAddPressing("/collection", true)).toBe(true);
    expect(shouldShowAddPressing("/explorer", true)).toBe(true);
  });

  it("stays quiet on the journal, forms, and profile", () => {
    expect(shouldShowAddPressing("/collection/rec-1", true)).toBe(false);
    expect(shouldShowAddPressing("/explorer/manual", true)).toBe(false);
    expect(shouldShowAddPressing("/explorer/add/2313422", true)).toBe(false);
    expect(shouldShowAddPressing("/profile", true)).toBe(false);
  });

  it("stays quiet when the room is unsigned", () => {
    expect(shouldShowAddPressing("/explorer", false)).toBe(false);
    expect(shouldShowAddPressing("/collection", false)).toBe(false);
  });
});
