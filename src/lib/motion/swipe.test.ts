import { describe, expect, it } from "vitest";

import {
  clampSwipeOffset,
  snapSwipeOffset,
  SWIPE_ACTION_WIDTH,
  SWIPE_LOCK_PAN_PX,
  SWIPE_SCROLL_SLOP_PX,
  SWIPE_SLOP_PX,
  shouldArmSwipe,
  shouldLockPagePan,
  shouldRestSwipeOnScroll,
  swipeAxis,
  swipeOffsetFromPointer,
  swipeRevealWidth,
} from "@/lib/motion/swipe";

describe("shouldArmSwipe", () => {
  it("arms a primary press in the hand, not on a wide desk", () => {
    expect(shouldArmSwipe({ isDesktop: false, button: 0 })).toBe(true);
    expect(shouldArmSwipe({ isDesktop: true, button: 0 })).toBe(false);
  });

  it("ignores a secondary button", () => {
    expect(shouldArmSwipe({ isDesktop: false, button: 2 })).toBe(false);
  });
});

describe("swipeAxis", () => {
  it("waits through a small tremor", () => {
    expect(swipeAxis(0, 0)).toBe("undecided");
    expect(swipeAxis(SWIPE_SLOP_PX, 0)).toBe("undecided");
    expect(swipeAxis(0, SWIPE_SLOP_PX)).toBe("undecided");
  });

  it("locks horizontal when the finger travels sideways first", () => {
    expect(swipeAxis(SWIPE_SLOP_PX + 1, 4)).toBe("horizontal");
    expect(swipeAxis(-(SWIPE_SLOP_PX + 1), 2)).toBe("horizontal");
  });

  it("keeps the row when the swipe drifts a little down", () => {
    expect(swipeAxis(20, 22)).toBe("horizontal");
    expect(swipeAxis(SWIPE_SLOP_PX + 1, SWIPE_SLOP_PX + 1)).toBe("horizontal");
  });

  it("leaves the shelf to scroll when the finger travels down", () => {
    expect(swipeAxis(4, SWIPE_SLOP_PX + 1)).toBe("vertical");
    expect(swipeAxis(8, 20)).toBe("vertical");
  });
});

describe("swipeRevealWidth", () => {
  it("gives each action a quiet column", () => {
    expect(swipeRevealWidth(0)).toBe(0);
    expect(swipeRevealWidth(1)).toBe(SWIPE_ACTION_WIDTH);
    expect(swipeRevealWidth(3)).toBe(SWIPE_ACTION_WIDTH * 3);
  });
});

describe("clampSwipeOffset", () => {
  it("stays between rest and the revealed actions", () => {
    expect(clampSwipeOffset(-12, 168)).toBe(0);
    expect(clampSwipeOffset(80, 168)).toBe(80);
    expect(clampSwipeOffset(200, 168)).toBe(168);
    expect(clampSwipeOffset(40, 0)).toBe(0);
  });
});

describe("snapSwipeOffset", () => {
  it("opens once the row has travelled far enough", () => {
    expect(snapSwipeOffset(20, 168, false)).toBe(0);
    expect(snapSwipeOffset(60, 168, false)).toBe(168);
  });

  it("closes only after a real return when already open", () => {
    expect(snapSwipeOffset(150, 168, true)).toBe(168);
    expect(snapSwipeOffset(100, 168, true)).toBe(0);
  });
});

describe("swipeOffsetFromPointer", () => {
  it("opens as the finger travels left", () => {
    expect(swipeOffsetFromPointer(200, 140, 0, 168)).toBe(60);
  });

  it("closes as the finger travels right from an open row", () => {
    expect(swipeOffsetFromPointer(100, 160, 168, 168)).toBe(108);
  });
});

describe("shouldLockPagePan", () => {
  it("waits through a small tremor", () => {
    expect(shouldLockPagePan(0, 0)).toBe(false);
    expect(shouldLockPagePan(SWIPE_LOCK_PAN_PX - 1, 0)).toBe(false);
  });

  it("holds the page once the finger is travelling sideways", () => {
    expect(shouldLockPagePan(SWIPE_LOCK_PAN_PX, 2)).toBe(true);
    expect(shouldLockPagePan(-20, 12)).toBe(true);
  });

  it("leaves a downward scroll to the shelf", () => {
    expect(shouldLockPagePan(4, 16)).toBe(false);
    expect(shouldLockPagePan(10, 20)).toBe(false);
  });
});

describe("shouldRestSwipeOnScroll", () => {
  it("ignores a one-pixel chrome shift", () => {
    expect(shouldRestSwipeOnScroll(80, 81)).toBe(false);
    expect(shouldRestSwipeOnScroll(80, 80 + SWIPE_SCROLL_SLOP_PX - 1)).toBe(false);
  });

  it("closes after the shelf really moved", () => {
    expect(shouldRestSwipeOnScroll(80, 80 + SWIPE_SCROLL_SLOP_PX)).toBe(true);
    expect(shouldRestSwipeOnScroll(40, 20)).toBe(true);
  });
});
