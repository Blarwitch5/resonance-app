import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { COVER_EDGE, MAX_COVER_STORED_BYTES, coverBlobPath } from "@/lib/collection/cover";
import { compressCoverStill } from "@/lib/collection/cover-compress";

describe("compressCoverStill", () => {
  it("keeps the long side and folds the weight", async () => {
    const source = await sharp({
      create: {
        width: 1600,
        height: 1200,
        channels: 3,
        background: { r: 48, g: 32, b: 72 },
      },
    })
      .jpeg({ quality: 95 })
      .toBuffer();

    const still = await compressCoverStill(new Uint8Array(source));
    const meta = await sharp(still).metadata();

    expect(meta.format).toBe("webp");
    expect(meta.width).toBe(COVER_EDGE);
    expect(meta.height).toBe(450);
    expect(still.byteLength).toBeLessThanOrEqual(MAX_COVER_STORED_BYTES);
    expect(still.byteLength).toBeLessThan(source.byteLength);
  });
});

describe("coverBlobPath", () => {
  it("keeps the still under covers/ as webp", () => {
    expect(coverBlobPath("user_abc-1")).toBe("covers/user_abc-1.webp");
    expect(coverBlobPath("../etc")).toBe("covers/etc.webp");
    expect(coverBlobPath("..")).toBeUndefined();
  });
});
