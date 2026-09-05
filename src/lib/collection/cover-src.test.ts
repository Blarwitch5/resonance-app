import { describe, expect, it } from "vitest";

import { coverDisplaySrc, coverSlotFromSizes, isBlobCoverUrl } from "@/lib/collection/cover-src";

describe("coverSlotFromSizes", () => {
  it("maps the shelf and player slots", () => {
    expect(coverSlotFromSizes("48px")).toBe("player");
    expect(coverSlotFromSizes("64px")).toBe("row");
    expect(coverSlotFromSizes("(max-width: 640px) 80vw, 256px")).toBe("confirm");
    expect(coverSlotFromSizes("(max-width: 1024px) 80vw, 320px")).toBe("journal");
    expect(coverSlotFromSizes("(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw")).toBe("tile");
  });
});

describe("isBlobCoverUrl", () => {
  it("keeps only https Vercel blobs", () => {
    expect(isBlobCoverUrl("https://abc.public.blob.vercel-storage.com/covers/user.webp")).toBe(true);
    expect(isBlobCoverUrl("https://i.discogs.com/cover.jpeg")).toBe(false);
    expect(isBlobCoverUrl("http://abc.public.blob.vercel-storage.com/covers/user.webp")).toBe(false);
  });
});

describe("coverDisplaySrc", () => {
  const url = "https://i.discogs.com/full.jpeg";
  const compactUrl = "https://i.discogs.com/thumb.jpeg";

  it("keeps a single still when no compact sleeve exists", () => {
    expect(coverDisplaySrc({ url, slot: "row" })).toEqual({ src: url });
    expect(coverDisplaySrc({ url, compactUrl: url, slot: "row" })).toEqual({ src: url });
  });

  it("uses the thumb on a row and in the player", () => {
    expect(coverDisplaySrc({ url, compactUrl, slot: "row" })).toEqual({ src: compactUrl });
    expect(coverDisplaySrc({ url, compactUrl, slot: "player" })).toEqual({ src: compactUrl });
  });

  it("offers both widths on a tile and in the journal", () => {
    expect(coverDisplaySrc({ url, compactUrl, slot: "tile" })).toEqual({
      src: url,
      srcSet: `${compactUrl} 150w, ${url} 600w`,
    });
    expect(coverDisplaySrc({ url, compactUrl, slot: "journal" }).srcSet).toContain("150w");
  });
});
