import type { MediaFormat } from "@/lib/collection/types";

export interface ShelfCopy {
  id: string;
  format: MediaFormat;
  isWishlist: boolean;
}

export function confirmFormats(
  enabled: readonly MediaFormat[],
  copies: readonly ShelfCopy[],
): MediaFormat[] {
  const taken = new Set(copies.map((copy) => copy.format));
  return enabled.filter((format) => !taken.has(format));
}

export function confirmOwnedCopy(copies: readonly ShelfCopy[]): ShelfCopy | undefined {
  return copies.find((copy) => !copy.isWishlist);
}

export function confirmWaitingCopy(copies: readonly ShelfCopy[]): ShelfCopy | undefined {
  return copies.find((copy) => copy.isWishlist);
}

export function confirmInitialFormat(
  remaining: readonly MediaFormat[],
  pressingFormat: MediaFormat,
  preferred?: MediaFormat | null,
): MediaFormat | undefined {
  if (remaining.includes(pressingFormat)) {
    return pressingFormat;
  }

  if (preferred && remaining.includes(preferred)) {
    return preferred;
  }

  return remaining[0];
}
