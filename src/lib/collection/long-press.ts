export const LONG_PRESS_MS = 480;
export const LONG_PRESS_SLOP_PX = 12;

export function shouldArmLongPress(input: { isDesktop: boolean; button: number }): boolean {
  return !input.isDesktop && input.button === 0;
}

export function pointerLeftPressZone(
  origin: { x: number; y: number },
  point: { x: number; y: number },
  slop = LONG_PRESS_SLOP_PX,
): boolean {
  return Math.hypot(point.x - origin.x, point.y - origin.y) > slop;
}
