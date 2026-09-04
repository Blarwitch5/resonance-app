export const PULL_REFRESH_THRESHOLD = 64;
const PULL_RESISTANCE = 0.45;
const PULL_MAX = 120;

export function resistedPull(distance: number): number {
  if (distance <= 0) {
    return 0;
  }

  return Math.min(distance * PULL_RESISTANCE, PULL_MAX);
}

export function pullProgress(distance: number): number {
  return Math.min(1, resistedPull(distance) / PULL_REFRESH_THRESHOLD);
}

export function shouldReleaseRefresh(distance: number): boolean {
  return resistedPull(distance) >= PULL_REFRESH_THRESHOLD;
}

export function shouldContinuePull(dx: number, dy: number, slop = 8): boolean {
  if (dy <= slop) {
    return false;
  }

  return dy >= Math.abs(dx) * 1.5;
}
