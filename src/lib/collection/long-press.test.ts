import { describe, expect, it } from "vitest";

import {
  LONG_PRESS_SLOP_PX,
  pointerLeftPressZone,
  shouldArmLongPress,
} from "@/lib/collection/long-press";

describe("shouldArmLongPress", () => {
  it("arms a primary press in the hand, not on a wide desk", () => {
    expect(shouldArmLongPress({ isDesktop: false, button: 0 })).toBe(true);
    expect(shouldArmLongPress({ isDesktop: true, button: 0 })).toBe(false);
  });

  it("ignores a secondary button", () => {
    expect(shouldArmLongPress({ isDesktop: false, button: 2 })).toBe(false);
  });
});

describe("pointerLeftPressZone", () => {
  it("stays in the zone through a small tremor", () => {
    expect(pointerLeftPressZone({ x: 40, y: 80 }, { x: 40, y: 80 })).toBe(false);
    expect(pointerLeftPressZone({ x: 40, y: 80 }, { x: 40 + LONG_PRESS_SLOP_PX, y: 80 })).toBe(
      false,
    );
  });

  it("cancels when the finger has started to travel", () => {
    expect(pointerLeftPressZone({ x: 40, y: 80 }, { x: 40 + LONG_PRESS_SLOP_PX + 1, y: 80 })).toBe(
      true,
    );
    expect(pointerLeftPressZone({ x: 40, y: 80 }, { x: 40, y: 80 + LONG_PRESS_SLOP_PX + 1 })).toBe(
      true,
    );
  });
});
