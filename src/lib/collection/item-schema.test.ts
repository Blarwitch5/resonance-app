import { describe, expect, it } from "vitest";

import { parseAddReleaseInput, parseCollectionWrite } from "@/lib/collection/item-schema";

describe("parseCollectionWrite", () => {
  it("keeps a clean pressing and drops an impossible year", () => {
    const written = parseCollectionWrite({
      discogsId: 249504,
      format: "vinyl",
      title: "Kind of Blue",
      artist: "Miles Davis",
      year: 99,
      label: " Columbia ",
      genres: ["Jazz", ""],
      coverUrl: null,
      coverThumbUrl: null,
      barcode: null,
      catalogNumber: " CL 1355 ",
      notes: "",
      isFavorite: false,
      isWishlist: false,
    });

    expect(written?.year).toBeNull();
    expect(written?.label).toBe("Columbia");
    expect(written?.catalogNumber).toBe("CL 1355");
    expect(written?.notes).toBeNull();
  });

  it("still writes when optional sleeve fields are missing", () => {
    expect(
      parseCollectionWrite({
        discogsId: 249504,
        format: "vinyl",
        title: "Kind of Blue",
        artist: "Miles Davis",
        year: 1959,
        genres: ["Jazz"],
        isFavorite: false,
        isWishlist: false,
      })?.title,
    ).toBe("Kind of Blue");
  });
});

describe("parseAddReleaseInput", () => {
  it("coerces the Discogs id and the shelf", () => {
    expect(
      parseAddReleaseInput({
        discogsId: "249504",
        format: "vinyl",
        kind: "",
        notes: "heard tonight",
      }),
    ).toEqual({
      discogsId: 249504,
      format: "vinyl",
      kind: "owned",
      notes: "heard tonight",
    });
  });
});
