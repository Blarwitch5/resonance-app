import { describe, expect, it } from "vitest";

import {
  isResonancePortraitBlob,
  MAX_PORTRAIT_UPLOAD_BYTES,
  portraitBlobPath,
  portraitKindFromBytes,
  PORTRAIT_TOO_LARGE,
  PORTRAIT_WRONG_KIND,
  readPortraitUpload,
} from "@/lib/profile/portrait";

const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 16, 0x4a, 0x46, 0x49, 0x46]);
const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
const webp = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50,
]);

describe("portraitKindFromBytes", () => {
  it("hears jpeg, png, and webp from the first bytes", () => {
    expect(portraitKindFromBytes(jpeg)).toBe("jpg");
    expect(portraitKindFromBytes(png)).toBe("png");
    expect(portraitKindFromBytes(webp)).toBe("webp");
  });

  it("stays quiet for a text file pretending to be a still", () => {
    expect(portraitKindFromBytes(new TextEncoder().encode("not a still"))).toBeUndefined();
  });
});

describe("readPortraitUpload", () => {
  it("treats an empty file as no still", async () => {
    expect(await readPortraitUpload(null)).toEqual({ status: "empty" });
    expect(await readPortraitUpload(new File([], "face.jpg", { type: "image/jpeg" }))).toEqual({
      status: "empty",
    });
  });

  it("keeps a jpeg still", async () => {
    const file = new File([jpeg], "face.jpg", { type: "image/jpeg" });
    const read = await readPortraitUpload(file);
    expect(read.status).toBe("ready");
    if (read.status === "ready") {
      expect(read.kind).toBe("jpg");
      expect(read.contentType).toBe("image/jpeg");
    }
  });

  it("refuses a file that is not a still, even with an image name", async () => {
    const file = new File(["hello"], "face.jpg", { type: "image/jpeg" });
    await expect(readPortraitUpload(file)).resolves.toEqual({
      status: "invalid",
      message: PORTRAIT_WRONG_KIND,
    });
  });

  it("refuses a still that is too large", async () => {
    const file = new File([new Uint8Array(MAX_PORTRAIT_UPLOAD_BYTES + 1)], "face.jpg", {
      type: "image/jpeg",
    });
    await expect(readPortraitUpload(file)).resolves.toEqual({
      status: "invalid",
      message: PORTRAIT_TOO_LARGE,
    });
  });
});

describe("isResonancePortraitBlob", () => {
  it("hears a public blob still and refuses anything else", () => {
    expect(
      isResonancePortraitBlob("https://abc.public.blob.vercel-storage.com/portraits/one.jpg"),
    ).toBe(true);
    expect(isResonancePortraitBlob("https://i.discogs.com/face.jpg")).toBe(false);
    expect(isResonancePortraitBlob("not a url")).toBe(false);
  });
});

describe("portraitBlobPath", () => {
  it("keeps the still under portraits/ as webp", () => {
    expect(portraitBlobPath("user_abc-1")).toBe("portraits/user_abc-1.webp");
  });

  it("drops a path that tries to leave the folder", () => {
    expect(portraitBlobPath("../etc")).toBe("portraits/etc.webp");
    expect(portraitBlobPath("..")).toBeUndefined();
  });
});
