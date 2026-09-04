import { describe, expect, it } from "vitest";

import { SHELF_ARRIVE_STEP_MS, shelfArriveDelayMs } from "@/lib/collection/layout";

describe("shelfArriveDelayMs", () => {
  it("lets the first records arrive in a short stagger", () => {
    expect(shelfArriveDelayMs(0)).toBe(0);
    expect(shelfArriveDelayMs(2)).toBe(SHELF_ARRIVE_STEP_MS * 2);
  });

  it("stops stacking delay after a breath of records", () => {
    expect(shelfArriveDelayMs(20)).toBe(shelfArriveDelayMs(11));
  });
});
