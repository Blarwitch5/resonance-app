export const SWIPE_SLOP_PX = 12;
export const SWIPE_ACTION_WIDTH = 56;
/** Hold the page still once the finger is clearly travelling sideways. */
export const SWIPE_LOCK_PAN_PX = 6;
/** Ignore tiny layout / chrome scrolls so an open row does not snap shut. */
export const SWIPE_SCROLL_SLOP_PX = 8;
/** Vertical must clearly dominate; a slight downward drift must not steal the row. */
export const SWIPE_VERTICAL_RATIO = 1.5;

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

  if (travelY > slop && travelY >= travelX * SWIPE_VERTICAL_RATIO) {
    return "vertical";
  }

  if (travelX > slop) {
    return "horizontal";
  }

  return "undecided";
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

export function shouldLockPagePan(dx: number, dy: number, slop = SWIPE_LOCK_PAN_PX): boolean {
  return Math.abs(dx) >= slop && Math.abs(dx) >= Math.abs(dy);
}

export function shouldRestSwipeOnScroll(fromY: number, toY: number, slop = SWIPE_SCROLL_SLOP_PX): boolean {
  return Math.abs(toY - fromY) >= slop;
}
