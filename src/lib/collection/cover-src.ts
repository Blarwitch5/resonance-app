export type CoverSlot = "row" | "tile" | "journal" | "player" | "confirm";

export const COVER_COMPACT_WIDTH = 150;
export const COVER_FULL_WIDTH = 600;

export function coverSlotFromSizes(sizes: string): CoverSlot {
  if (sizes === "48px") {
    return "player";
  }

  if (sizes === "64px") {
    return "row";
  }

  if (sizes.includes("256px")) {
    return "confirm";
  }

  if (sizes.includes("320px")) {
    return "journal";
  }

  if (sizes.includes("25vw") || sizes.includes("33vw") || sizes.includes("50vw")) {
    return "tile";
  }

  return "journal";
}

export function isBlobCoverUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export function canOptimizeCoverUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export function coverDisplaySrc(input: {
  url: string;
  compactUrl?: string | null;
  slot: CoverSlot;
}): { src: string; srcSet?: string } {
  const compact = input.compactUrl && input.compactUrl !== input.url ? input.compactUrl : null;

  if (!compact) {
    return { src: input.url };
  }

  if (input.slot === "row" || input.slot === "player") {
    return { src: compact };
  }

  return {
    src: input.url,
    srcSet: `${compact} ${COVER_COMPACT_WIDTH}w, ${input.url} ${COVER_FULL_WIDTH}w`,
  };
}
