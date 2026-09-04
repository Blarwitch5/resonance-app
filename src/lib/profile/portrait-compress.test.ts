import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { MAX_PORTRAIT_STORED_BYTES, PORTRAIT_EDGE } from "@/lib/profile/portrait";
import { compressPortraitStill } from "@/lib/profile/portrait-compress";

describe("compressPortraitStill", () => {
  it("folds a large still into a small webp square", async () => {
    const source = await sharp({
      create: {
        width: 1200,
        height: 800,
        channels: 3,
        background: { r: 92, g: 48, b: 28 },
      },
    })
      .jpeg({ quality: 95 })
      .toBuffer();

    const still = await compressPortraitStill(new Uint8Array(source));
    const meta = await sharp(still).metadata();

    expect(meta.format).toBe("webp");
    expect(meta.width).toBe(PORTRAIT_EDGE);
    expect(meta.height).toBe(PORTRAIT_EDGE);
    expect(still.byteLength).toBeLessThanOrEqual(MAX_PORTRAIT_STORED_BYTES);
    expect(still.byteLength).toBeLessThan(source.byteLength);
  });
});
