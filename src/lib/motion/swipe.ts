export const SWIPE_SLOP_PX = 12;
export const SWIPE_ACTION_WIDTH = 56;

export type SwipeAxis = "undecided" | "horizontal" | "vertical";

export function shouldArmSwipe(input: { isDesktop: boolean; button: number }): boolean {
  return !input.isDesktop && input.button === 0;
}

export function swipeAxis(dx: number, dy: number, slop = SWIPE_SLOP_PX): SwipeAxis {
  const travelX = Math.abs(dx);
  const travelY = Math.abs(dy);

  if (travelX <= slop && travelY <= slop) {
    return "undecided";
  }

  return travelX > travelY ? "horizontal" : "vertical";
}

export function swipeRevealWidth(actionCount: number, actionWidth = SWIPE_ACTION_WIDTH): number {
  if (!Number.isInteger(actionCount) || actionCount < 1 || actionWidth < 1) {
    return 0;
  }

  return actionCount * actionWidth;
}

export function clampSwipeOffset(offset: number, reveal: number): number {
  if (reveal <= 0) {
    return 0;
  }

  return Math.min(reveal, Math.max(0, offset));
}

export function snapSwipeOffset(offset: number, reveal: number, wasOpen: boolean): number {
  if (reveal <= 0) {
    return 0;
  }

  const line = wasOpen ? reveal * 0.65 : reveal * 0.35;
  return offset >= line ? reveal : 0;
}

export function swipeOffsetFromPointer(originX: number, currentX: number, startOffset: number, reveal: number): number {
  return clampSwipeOffset(startOffset - (currentX - originX), reveal);
}
