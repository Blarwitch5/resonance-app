import { describe, expect, it } from "vitest";

import {
  collectionWriteSchema,
  parseAddReleaseInput,
  parseCollectionWrite,
} from "@/lib/collection/item-schema";

const validWrite = {
  discogsId: 249504,
  format: "vinyl" as const,
  title: "Kind of Blue",
  artist: "Miles Davis",
  year: 1959,
  label: "Columbia",
  genres: ["Jazz"],
  coverUrl: null,
  coverThumbUrl: null,
  barcode: null,
  catalogNumber: "CL 1355",
  notes: null,
  isFavorite: false,
  isWishlist: false,
};

describe("collectionWriteSchema", () => {
  it("accepts a complete pressing", () => {
    expect(collectionWriteSchema.parse(validWrite).title).toBe("Kind of Blue");
  });

  it("rejects an out-of-range year and a missing format", () => {
    expect(collectionWriteSchema.safeParse({ ...validWrite, year: 99 }).success).toBe(false);
    expect(collectionWriteSchema.safeParse({ ...validWrite, format: "lp" }).success).toBe(false);
  });

  it("rejects a missing sleeve field instead of filling it in", () => {
    const { coverUrl: _cover, ...rest } = validWrite;
    expect(collectionWriteSchema.safeParse(rest).success).toBe(false);
  });
});

describe("parseCollectionWrite", () => {
  it("trims text and turns an impossible year into null before the schema", () => {
    const written = parseCollectionWrite({
      ...validWrite,
      year: 99,
      label: " Columbia ",
      genres: ["Jazz", ""],
      catalogNumber: " CL 1355 ",
      notes: "",
    });

    expect(written).toEqual({
      ...validWrite,
      year: null,
      label: "Columbia",
      genres: ["Jazz"],
      catalogNumber: "CL 1355",
      notes: null,
    });
  });

  it("rejects a non-array genre list", () => {
    expect(parseCollectionWrite({ ...validWrite, genres: "Jazz" })).toBeNull();
  });
});

describe("parseAddReleaseInput", () => {
  it("reads a numeric Discogs id sent as digits", () => {
    expect(
      parseAddReleaseInput({
        discogsId: "249504",
        format: "vinyl",
        kind: "owned",
        notes: "heard tonight",
      }),
    ).toEqual({
      discogsId: 249504,
      format: "vinyl",
      kind: "owned",
      notes: "heard tonight",
    });
  });

  it("rejects an empty kind instead of guessing", () => {
    expect(
      parseAddReleaseInput({
        discogsId: 249504,
        format: "cd",
        kind: "",
      }),
    ).toBeNull();
  });
});
