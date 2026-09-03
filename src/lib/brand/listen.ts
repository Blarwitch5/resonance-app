export const LISTENING_TRAIL = [0, 1, 2] as const;

export const LISTENING_SIDES = ["left", "right"] as const;

export type ListeningSide = (typeof LISTENING_SIDES)[number];

export const LISTENING_TRAIL_RIGHT = ["88.62%", "100.42%", "112.22%"] as const;

export const LISTENING_TRAIL_TOP = "48.09%";

export function listeningTrailIndexes(side: ListeningSide): readonly number[] {
  return side === "left" ? [1, 2] : LISTENING_TRAIL;
}

export function listeningTrailFill(_side: ListeningSide): "bg-primary" {
  return "bg-primary";
}

export function listeningTrailLeft(side: ListeningSide, index: number): string {
  const right = LISTENING_TRAIL_RIGHT[index] ?? LISTENING_TRAIL_RIGHT[0];

  if (side === "right") {
    return right;
  }

  return `${(100 - Number.parseFloat(right)).toFixed(2)}%`;
}

export function listeningTrailDelayMs(index: number): number {
  return index * 220;
}
