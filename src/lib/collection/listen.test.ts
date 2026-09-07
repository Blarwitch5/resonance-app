import { describe, expect, it } from "vitest";

import {
  collectionFiltersClearHref,
  collectionListenCount,
  collectionShelfHref,
} from "@/lib/collection/listen";

describe("collectionListenCount", () => {
  it("ignores format, search, facets, and the default sort", () => {
    expect(
      collectionListenCount({
        format: "vinyl",
        query: "Blue",
        sort: "recent",
        page: 2,
        artist: "Miles Davis",
      }),
    ).toBe(0);
  });

  it("counts a non-default sort behind Sort", () => {
    expect(
      collectionListenCount({
        sort: "found",
        keptClose: true,
        artist: "Miles Davis",
      }),
    ).toBe(1);
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

describe("collectionFiltersClearHref", () => {
  it("keeps search, sort, and kept close — drops format and facets", () => {
    expect(
      collectionFiltersClearHref({
        format: "vinyl",
        query: "Blue",
        sort: "artist",
        keptClose: true,
        artist: "Miles Davis",
        year: 1959,
      }),
    ).toBe("/collection?q=Blue&sort=artist&kept=1");
  });
});
