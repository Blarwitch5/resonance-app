import { describe, expect, it } from "vitest";

import { collectionListenCount, collectionShelfHref } from "@/lib/collection/listen";

describe("collectionListenCount", () => {
  it("ignores format, search, and the default sort", () => {
    expect(
      collectionListenCount({
        format: "vinyl",
        query: "Blue",
        sort: "recent",
        page: 2,
      }),
    ).toBe(0);
  });

  it("counts the threads hidden behind Listen", () => {
    expect(
      collectionListenCount({
        sort: "found",
        keptClose: true,
        artist: "Miles Davis",
        genre: "Jazz",
        label: "Columbia",
        found: "Reckless",
        when: 2024,
        arrived: 2025,
        condition: "near_mint",
        decade: 1950,
        year: 1959,
      }),
    ).toBe(11);
  });
});

describe("collectionShelfHref", () => {
  it("keeps format and search, releases the other threads", () => {
    expect(
      collectionShelfHref({
        format: "vinyl",
        query: "Blue",
        sort: "artist",
        keptClose: true,
        artist: "Miles Davis",
        page: 3,
      }),
    ).toBe("/collection?format=vinyl&q=Blue");
  });
});
