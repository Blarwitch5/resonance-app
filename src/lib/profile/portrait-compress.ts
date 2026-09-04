import sharp from "sharp";

import {
  MAX_PORTRAIT_STORED_BYTES,
  PORTRAIT_EDGE,
  PORTRAIT_TOO_LARGE,
} from "@/lib/profile/portrait";

const QUALITIES = [70, 56, 42] as const;

export async function compressPortraitStill(bytes: Uint8Array): Promise<Uint8Array> {
  for (const quality of QUALITIES) {
    const out = await sharp(bytes)
      .rotate()
      .resize(PORTRAIT_EDGE, PORTRAIT_EDGE, { fit: "cover" })
      .webp({ quality, effort: 6, alphaQuality: 40 })
      .toBuffer();
    const still = new Uint8Array(out);

    if (still.byteLength <= MAX_PORTRAIT_STORED_BYTES) {
      return still;
    }
  }

  throw new Error(PORTRAIT_TOO_LARGE);
}
