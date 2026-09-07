import { describe, expect, it } from "vitest";

import {
  collectionFilterCount,
  emptyCollectionFacets,
  ensureNamedFacet,
  ensureYearFacet,
  hasCollectionFacets,
} from "@/lib/collection/facets";
import { sharedShelfHeadline } from "@/lib/listen/shelf-title";

describe("hasCollectionFacets", () => {
  it("is false when every list is empty", () => {
    expect(hasCollectionFacets(emptyCollectionFacets())).toBe(false);
  });

  it("is true when any list has an entry", () => {
    expect(hasCollectionFacets({ ...emptyCollectionFacets(), years: [{ year: 1993, count: 2 }] })).toBe(
      true,
    );
  });
});

describe("collectionFilterCount", () => {
  it("counts shelf facet threads including format", () => {
    expect(
      collectionFilterCount({
        format: "vinyl",
        artist: "Miles Davis",
        genre: "Jazz",
        label: "Columbia",
        year: 1959,
        decade: 1950,
      }),
    ).toBe(6);
  });
});

describe("ensureNamedFacet", () => {
  it("keeps an active value that is not in the top list", () => {
    expect(ensureNamedFacet([{ name: "Nirvana", count: 3 }], "Miles Davis")).toEqual([
      { name: "Miles Davis", count: 0 },
      { name: "Nirvana", count: 3 },
    ]);
  });
});

describe("ensureYearFacet", () => {
  it("keeps an active year that is not in the top list", () => {
    expect(ensureYearFacet([{ year: 1993, count: 2 }], 1959)).toEqual([
      { year: 1959, count: 0 },
      { year: 1993, count: 2 },
    ]);
  });
});

describe("sharedShelfHeadline", () => {
  it("includes format in the filtered shelf line", () => {
    expect(sharedShelfHeadline({ format: "vinyl", artist: "Nirvana", year: 1993 }, "en")).toBe(
      "Your shelf — Vinyl · Nirvana · 1993.",
    );
  });

  it("keeps the whole-shelf voice when nothing is filtered", () => {
    expect(sharedShelfHeadline({}, "en")).toBe("Records kept close");
  });
});
