import { describe, expect, it } from "vitest";

import {
  toRecordSides,
  toReleaseDraft,
  toReleaseDraftFromCollection,
  toReleaseDraftFromSearch,
  toReleasePreview,
} from "@/lib/discogs/adapter";
import type { DiscogsRelease, DiscogsSearchHit } from "@/lib/discogs/types";

const hit: DiscogsSearchHit = {
  id: 12345,
  title: "Miles Davis - Kind of Blue",
  year: "1959",
  format: ["Vinyl"],
  label: ["Columbia"],
  genre: ["Jazz"],
  barcode: ["07464405791"],
  cover_image: "https://img.discogs.com/cover.jpg",
};

const release: DiscogsRelease = {
  id: 12345,
  title: " Kind of Blue ",
  year: 1959,
  artists: [{ name: "Miles Davis" }],
  labels: [{ name: "Columbia" }],
  genres: ["Jazz"],
  styles: ["Modal"],
  country: " US ",
  formats: [{ name: "Vinyl" }, { name: "LP" }],
  images: [
    { uri: "https://img.discogs.com/spacer.gif", type: "secondary" },
    { uri: "https://img.discogs.com/cover.jpg", type: "primary" },
  ],
  identifiers: [
    { type: "Catalog Number", value: "CL 1355" },
    { type: "Barcode", value: "07464405791" },
  ],
  extraartists: [{ name: "Teo Macero", role: "Producer" }],
  tracklist: [
    { type_: "heading", title: " Side A " },
    { position: "A1", title: " So What ", duration: "9:22" },
    { type_: "heading", title: "Side B" },
    { position: "B1", title: "All Blues", duration: "11:33" },
    { title: "   " },
  ],
};

describe("toReleaseDraftFromSearch", () => {
  it("splits artist and title from a Discogs search hit", () => {
    const draft = toReleaseDraftFromSearch(hit);

    expect(draft).toMatchObject({
      discogsId: 12345,
      format: "vinyl",
      title: "Kind of Blue",
      artist: "Miles Davis",
      year: 1959,
      label: "Columbia",
      barcode: "07464405791",
      coverUrl: "https://img.discogs.com/cover.jpg",
    });
  });

  it("maps cassette and cd, and drops a spacer cover", () => {
    expect(toReleaseDraftFromSearch({ ...hit, format: ["Cassette"] }).format).toBe("cassette");
    expect(toReleaseDraftFromSearch({ ...hit, format: ["CD"] }).format).toBe("cd");
    expect(
      toReleaseDraftFromSearch({
        ...hit,
        cover_image: "https://img.discogs.com/spacer.gif",
        thumb: undefined,
      }).coverUrl,
    ).toBeNull();
  });
});

describe("toReleaseDraft and toReleasePreview", () => {
  it("keeps barcode, genres, and a primary cover", () => {
    const draft = toReleaseDraft(release);

    expect(draft.artist).toBe("Miles Davis");
    expect(draft.title).toBe("Kind of Blue");
    expect(draft.barcode).toBe("07464405791");
    expect(draft.genres).toEqual(["Jazz", "Modal"]);
    expect(draft.coverUrl).toBe("https://img.discogs.com/cover.jpg");
  });

  it("adds country, catalog, and format names to a preview", () => {
    const preview = toReleasePreview(release);

    expect(preview.country).toBe("US");
    expect(preview.catalogNumber).toBe("CL 1355");
    expect(preview.formatNames).toEqual(["Vinyl", "LP"]);
    expect(preview.creditLine).toBe("Produced by Teo Macero");
  });

  it("reads a catalog number from the label when identifiers stay quiet", () => {
    const preview = toReleasePreview({
      ...release,
      identifiers: [{ type: "Barcode", value: "07464405791" }],
      labels: [{ name: "Columbia", catno: " CS 8163 " }],
    });

    expect(preview.catalogNumber).toBe("CS 8163");
  });

  it("prefers the label catalog over a Discogs identifier", () => {
    const preview = toReleasePreview({
      ...release,
      labels: [{ name: "Columbia", catno: "CS 8163" }],
    });

    expect(preview.catalogNumber).toBe("CS 8163");
  });
});

describe("toReleaseDraftFromCollection", () => {
  it("returns null without a usable pressing", () => {
    expect(toReleaseDraftFromCollection({})).toBeNull();
    expect(
      toReleaseDraftFromCollection({
        basic_information: { id: 0, title: "Kind of Blue" },
      }),
    ).toBeNull();
  });

  it("maps a Discogs collection entry", () => {
    const draft = toReleaseDraftFromCollection({
      basic_information: {
        id: 99,
        title: "A Love Supreme",
        artists: [{ name: "John Coltrane" }],
        formats: [{ name: "CD" }],
      },
    });

    expect(draft).toMatchObject({
      discogsId: 99,
      title: "A Love Supreme",
      artist: "John Coltrane",
      format: "cd",
    });
  });
});

describe("toRecordSides", () => {
  it("groups tracks under headings and skips empty titles", () => {
    expect(toRecordSides(release)).toEqual([
      {
        heading: "Side A",
        tracks: [{ position: "A1", title: "So What", duration: "9:22", previewUrl: null }],
      },
      {
        heading: "Side B",
        tracks: [{ position: "B1", title: "All Blues", duration: "11:33", previewUrl: null }],
      },
    ]);
  });
});
