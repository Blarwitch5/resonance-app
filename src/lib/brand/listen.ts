export const LISTENING_TRAIL = [0, 1, 2] as const;

export const LISTENING_TRAIL_LEFT = ["88.62%", "100.42%", "112.22%"] as const;

export const LISTENING_TRAIL_TOP = "48.09%";

export function listeningTrailDelayMs(index: number): number {
  return index * 220;
}
