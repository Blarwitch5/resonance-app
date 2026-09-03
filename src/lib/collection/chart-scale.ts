/** Share of a peak, as a visible percentage for bars and columns. */
export function chartShare(count: number, peak: number, floor = 8): number {
  if (peak <= 0 || count <= 0) {
    return 0;
  }

  return Math.max(floor, Math.round((count / peak) * 100));
}

/** How many discs to draw for a ranked row — one per record, capped. */
export function chartMarks(count: number, peak: number, maxMarks = 12): number {
  if (peak <= 0 || count <= 0) {
    return 0;
  }

  if (peak <= maxMarks) {
    return count;
  }

  return Math.max(1, Math.round((count / peak) * maxMarks));
}
