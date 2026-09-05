import sharp from "sharp";

import { COVER_EDGES, COVER_TOO_LARGE, MAX_COVER_STORED_BYTES } from "@/lib/collection/cover";

const QUALITIES = [72, 56, 42] as const;

export async function compressCoverStill(bytes: Uint8Array): Promise<Uint8Array> {
  let smallest: Uint8Array | undefined;

  for (const edge of COVER_EDGES) {
    for (const quality of QUALITIES) {
      const out = await sharp(bytes)
        .rotate()
        .resize(edge, edge, { fit: "inside", withoutEnlargement: true })
        .webp({ quality, effort: 6, alphaQuality: 40 })
        .toBuffer();
      const still = new Uint8Array(out);

      if (!smallest || still.byteLength < smallest.byteLength) {
        smallest = still;
      }

      if (still.byteLength <= MAX_COVER_STORED_BYTES) {
        return still;
      }
    }
  }

  if (smallest && smallest.byteLength <= MAX_COVER_STORED_BYTES) {
    return smallest;
  }

  throw new Error(COVER_TOO_LARGE);
}
