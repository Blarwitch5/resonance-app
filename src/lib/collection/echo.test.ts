import { describe, expect, it } from "vitest";

import { echoDiscoveries, echoHeadline, echoSeedFromInsight } from "@/lib/collection/echo";
import { summarizeCollection, type CollectionStatItem } from "@/lib/collection/stats";
import type { ReleaseDraft } from "@/lib/collection/types";

function item(partial: Partial<CollectionStatItem> = {}): CollectionStatItem {
  return {
    format: "vinyl",
    artist: "Miles Davis",
    year: 1959,
    label: "Columbia",
    purchaseLocation: null,
    purchaseDate: null,
    createdAt: new Date("2024-03-15T00:00:00.000Z"),
    genres: ["Jazz"],
    ...partial,
  };
}

function draft(partial: Partial<ReleaseDraft> = {}): ReleaseDraft {
  return {
    discogsId: 1,
    format: "vinyl",
    title: "Kind of Blue",
    artist: "Miles Davis",
    year: 1959,
    label: "Columbia",
    genres: ["Jazz"],
    coverUrl: null,
    barcode: null,
    catalogNumber: null,
    ...partial,
  };
}

describe("echoSeedFromInsight", () => {
  it("stays quiet on an empty shelf", () => {
    expect(echoSeedFromInsight(summarizeCollection([]))).toBeNull();
  });

  it("follows the artist who stays", () => {
    const seed = echoSeedFromInsight(
      summarizeCollection([item(), item({ year: 1970, artist: "Miles Davis" }), item({ artist: "Other" })]),
    );

    expect(seed).toEqual({ kind: "artist", query: "Miles Davis", name: "Miles Davis" });
  });

  it("follows a sound you keep when no artist repeats", () => {
    const seed = echoSeedFromInsight(
      summarizeCollection([
        item({ artist: "Alice Coltrane", genres: ["Jazz"] }),
        item({ artist: "Pharoah Sanders", genres: ["Jazz"] }),
      ]),
    );

    expect(seed).toEqual({ kind: "genre", query: "Jazz", name: "Jazz" });
  });

  it("falls back to the most present artist without a genre", () => {
    const seed = echoSeedFromInsight(
      summarizeCollection([item({ artist: "Unknown", genres: [] })]),
    );

    expect(seed).toEqual({ kind: "artist", query: "Unknown", name: "Unknown" });
  });
});

describe("echoHeadline", () => {
  it("names how many new albums sit nearby", () => {
    expect(echoHeadline({ kind: "artist", query: "Miles Davis", name: "Miles Davis" }, 3)).toBe(
      "3 new albums found in your echo range — more from Miles Davis.",
    );
    expect(echoHeadline({ kind: "genre", query: "Jazz", name: "Jazz" }, 1)).toBe(
      "1 new album found in your echo range — more Jazz.",
    );
  });
});

describe("echoDiscoveries", () => {
  it("keeps pressings that are not already on the shelf", () => {
    const found = echoDiscoveries(
      [
        draft({ discogsId: 1, title: "Kind of Blue" }),
        draft({ discogsId: 2, title: "Bitches Brew" }),
        draft({ discogsId: null, title: "Untitled" }),
        draft({ discogsId: 3, title: "In a Silent Way" }),
      ],
      new Set([1]),
    );

    expect(found.map((entry) => entry.title)).toEqual(["Bitches Brew", "In a Silent Way"]);
  });

  it("caps the echo at eight pressings", () => {
    const drafts = Array.from({ length: 12 }, (_, index) =>
      draft({ discogsId: index + 1, title: `Pressing ${index + 1}` }),
    );

    expect(echoDiscoveries(drafts, new Set()).length).toBe(8);
  });
});
