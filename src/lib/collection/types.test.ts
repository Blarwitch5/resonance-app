import { describe, expect, it } from "vitest";

import {
  collectionListenFromParams,
  collectionSearchFromListen,
  decadeFromYear,
  foundDateLabel,
  isCanonicalWhenParams,
  parseArtistFilter,
  parseCollectionPage,
  parseCollectionSort,
  parseDecadeFilter,
  parseFoundFilter,
  parseGenreFilter,
  parseKeptClose,
  parseLabelFilter,
  parseMediaCondition,
  parseMediaFormat,
  parseWhenFilter,
  parseWhenThread,
  whenFromDate,
  whenListenFromParams,
} from "@/lib/collection/types";

describe("parseCollectionSort", () => {
  it("keeps artist, year, and found", () => {
    expect(parseCollectionSort("artist")).toBe("artist");
    expect(parseCollectionSort("year")).toBe("year");
    expect(parseCollectionSort("found")).toBe("found");
  });

  it("falls back to recent", () => {
    expect(parseCollectionSort(undefined)).toBe("recent");
    expect(parseCollectionSort("recent")).toBe("recent");
    expect(parseCollectionSort("price")).toBe("recent");
  });
});

describe("parseCollectionPage", () => {
  it("defaults invalid values to 1", () => {
    expect(parseCollectionPage(undefined)).toBe(1);
    expect(parseCollectionPage("0")).toBe(1);
    expect(parseCollectionPage("-2")).toBe(1);
    expect(parseCollectionPage("abc")).toBe(1);
  });

  it("caps at 50", () => {
    expect(parseCollectionPage("12")).toBe(12);
    expect(parseCollectionPage("99")).toBe(50);
  });
});

describe("parseKeptClose", () => {
  it("is only true for 1", () => {
    expect(parseKeptClose("1")).toBe(true);
    expect(parseKeptClose("true")).toBe(false);
    expect(parseKeptClose(undefined)).toBe(false);
  });
});

describe("shelf filters", () => {
  it("trims and rejects empty or oversized values", () => {
    expect(parseArtistFilter("  Miles Davis  ")).toBe("Miles Davis");
    expect(parseArtistFilter("")).toBeUndefined();
    expect(parseArtistFilter("a".repeat(121))).toBeUndefined();
    expect(parseGenreFilter(" Jazz ")).toBe("Jazz");
    expect(parseGenreFilter("g".repeat(81))).toBeUndefined();
    expect(parseLabelFilter(" ECM ")).toBe("ECM");
    expect(parseFoundFilter(" Reckless Records ")).toBe("Reckless Records");
  });
});

describe("parseWhenFilter", () => {
  it("accepts years from 1900 to 2030", () => {
    expect(parseWhenFilter("2024")).toBe(2024);
    expect(parseWhenFilter("1899")).toBeUndefined();
    expect(parseWhenFilter("2031")).toBeUndefined();
    expect(parseWhenFilter("")).toBeUndefined();
    expect(parseWhenFilter("1993")).toBe(1993);
  });
});

describe("parseWhenThread", () => {
  it("hears a year", () => {
    expect(parseWhenThread(" 1993 ")).toEqual({ year: 1993 });
    expect(parseWhenThread("1990")).toEqual({ year: 1990 });
  });

  it("hears a typed decade", () => {
    expect(parseWhenThread("1990s")).toEqual({ decade: 1990 });
    expect(parseWhenThread(" 1970S ")).toEqual({ decade: 1970 });
    expect(parseWhenThread("années 1990")).toEqual({ decade: 1990 });
  });

  it("stays quiet about empty or impossible values", () => {
    expect(parseWhenThread("")).toEqual({});
    expect(parseWhenThread("1993s")).toEqual({});
    expect(parseWhenThread("1800")).toEqual({});
  });
});

describe("whenListenFromParams", () => {
  it("hears a decade typed as 1990s", () => {
    expect(whenListenFromParams("1990s", undefined)).toEqual({ decade: 1990 });
    expect(whenListenFromParams("1993", "1990")).toEqual({ year: 1993 });
    expect(whenListenFromParams(undefined, "1990")).toEqual({ decade: 1990 });
  });
});

describe("isCanonicalWhenParams", () => {
  it("accepts a year or a decade, not a typed 1990s", () => {
    expect(isCanonicalWhenParams("1993", undefined)).toBe(true);
    expect(isCanonicalWhenParams(undefined, "1990")).toBe(true);
    expect(isCanonicalWhenParams("1990s", undefined)).toBe(false);
    expect(isCanonicalWhenParams("1993", "1990")).toBe(false);
  });
});

describe("whenFromDate and foundDateLabel", () => {
  it("reads a calendar date string", () => {
    expect(whenFromDate("2024-03-15")).toBe(2024);
    expect(foundDateLabel("2024-03-15")).toBe("2024-03-15");
  });

  it("rejects missing or malformed values", () => {
    expect(whenFromDate(null)).toBeUndefined();
    expect(foundDateLabel(null)).toBeUndefined();
    expect(foundDateLabel("March 2024")).toBeUndefined();
  });
});

describe("parseDecadeFilter", () => {
  it("only accepts decades from 1900 to 2020", () => {
    expect(parseDecadeFilter("1970")).toBe(1970);
    expect(parseDecadeFilter("1975")).toBeUndefined();
    expect(parseDecadeFilter("1890")).toBeUndefined();
    expect(parseDecadeFilter("2030")).toBeUndefined();
  });
});

describe("decadeFromYear", () => {
  it("maps a year onto its decade", () => {
    expect(decadeFromYear(1977)).toBe(1970);
    expect(decadeFromYear(2024)).toBe(2020);
    expect(decadeFromYear(null)).toBeUndefined();
    expect(decadeFromYear(1888)).toBeUndefined();
  });
});

describe("parseMediaFormat and parseMediaCondition", () => {
  it("accepts known values only", () => {
    expect(parseMediaFormat("vinyl")).toBe("vinyl");
    expect(parseMediaFormat("tape")).toBeUndefined();
    expect(parseMediaCondition("near_mint")).toBe("near_mint");
    expect(parseMediaCondition("NM")).toBeUndefined();
  });
});

describe("collectionListenFromParams", () => {
  it("round-trips a listen through the search shape", () => {
    const listen = collectionListenFromParams(
      collectionSearchFromListen(
        {
          format: "vinyl",
          query: "Blue",
          sort: "found",
          keptClose: true,
          artist: "Miles Davis",
          genre: "Jazz",
          label: "Columbia",
          found: "Reckless",
          condition: "near_mint",
          decade: 1950,
          year: 1959,
          when: 2024,
          arrived: 2025,
        },
        3,
      ),
      ["vinyl", "cassette", "cd"],
    );

    expect(listen.page).toBe(3);
    expect(listen.listen).toMatchObject({
      format: "vinyl",
      query: "Blue",
      sort: "found",
      keptClose: true,
      artist: "Miles Davis",
      genre: "Jazz",
      year: 1959,
    });
  });

  it("drops a format that is not on the shelf", () => {
    const { listen } = collectionListenFromParams({ format: "cd", q: "Blue" }, ["vinyl"]);
    expect(listen.format).toBeUndefined();
    expect(listen.query).toBe("Blue");
  });
});
