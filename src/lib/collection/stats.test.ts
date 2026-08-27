import { describe, expect, it } from "vitest";

import { decadeLabel, decadeStory, summarizeCollection, type CollectionStatItem } from "@/lib/collection/stats";

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

describe("summarizeCollection", () => {
  it("tells an empty shelf", () => {
    const insight = summarizeCollection([]);

    expect(insight.total).toBe(0);
    expect(insight.mostPresentArtist).toBeNull();
    expect(insight.decadeSpan).toBeNull();
    expect(insight.formats).toEqual([]);
  });

  it("counts artists, labels, formats, and decades", () => {
    const insight = summarizeCollection([
      item(),
      item({ artist: "Alice Coltrane", year: 1971, format: "cd", label: "Impulse!", genres: ["Jazz", "Spiritual"] }),
      item({ year: 1969, purchaseLocation: " Reckless Records ", purchaseDate: new Date("2024-03-15T00:00:00.000Z") }),
      item({
        artist: "Alice Coltrane",
        year: 1970,
        format: "cd",
        label: "Impulse!",
        purchaseLocation: "Reckless Records",
        purchaseDate: new Date("2024-08-01T00:00:00.000Z"),
      }),
    ]);

    expect(insight.total).toBe(4);
    expect(insight.artistCount).toBe(2);
    expect(insight.labelCount).toBe(2);
    expect(insight.formats).toEqual([
      { format: "vinyl", count: 2 },
      { format: "cd", count: 2 },
    ]);
    expect(insight.oldestYear).toBe(1959);
    expect(insight.newestYear).toBe(1971);
    expect(insight.decadeSpan).toBe(3);
    expect(insight.mostPresentArtist).toEqual({ name: "Alice Coltrane", count: 2 });
    expect(insight.topPlaces[0]).toEqual({ name: "Reckless Records", count: 2 });
    expect(insight.topWhen[0]).toEqual({ year: 2024, count: 2 });
    expect(insight.topArrived).toEqual([{ year: 2024, count: 4 }]);
    expect(insight.topGenres[0]?.name).toBe("Jazz");
  });
});

describe("decadeLabel and decadeStory", () => {
  it("names a decade", () => {
    expect(decadeLabel(1970)).toBe("1970s");
  });

  it("speaks for one decade or many", () => {
    expect(decadeStory(summarizeCollection([item()]))).toBe("Your collection lives in one decade of sound.");
    expect(
      decadeStory(summarizeCollection([item({ year: 1970 }), item({ year: 1985, artist: "Other" })])),
    ).toBe("Your collection spans 2 decades of sound.");
    expect(decadeStory(summarizeCollection([]))).toBeNull();
  });
});

describe("topArrived", () => {
  it("orders the years they arrived on the shelf", () => {
    const insight = summarizeCollection([
      item({ createdAt: new Date("2025-01-02T00:00:00.000Z") }),
      item({
        artist: "Alice Coltrane",
        createdAt: new Date("2024-06-01T00:00:00.000Z"),
      }),
      item({
        artist: "Pharoah Sanders",
        createdAt: new Date("2025-08-01T00:00:00.000Z"),
      }),
    ]);

    expect(insight.topArrived).toEqual([
      { year: 2024, count: 1 },
      { year: 2025, count: 2 },
    ]);
  });
});
