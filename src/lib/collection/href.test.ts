import { describe, expect, it } from "vitest";

import {
  collectionFormatHref,
  collectionFormatNavHref,
  collectionHref,
  formatListenFromLocation,
  journalFromHref,
  journalHref,
  parseWaveFlag,
} from "@/lib/collection/href";

describe("collectionHref", () => {
  it("returns the shelf root with no listen", () => {
    expect(collectionHref()).toBe("/collection");
    expect(collectionHref({ sort: "recent", page: 1 })).toBe("/collection");
  });

  it("serializes the active threads", () => {
    expect(
      collectionHref({
        format: "vinyl",
        query: "Kind of Blue",
        sort: "found",
        keptClose: true,
        artist: "Miles Davis",
        genre: "Jazz",
        label: "Columbia",
        found: "Reckless Records",
        when: 2024,
        arrived: 2025,
        condition: "near_mint",
        decade: 1950,
        year: 1959,
        page: 2,
      }),
    ).toBe(
      "/collection?format=vinyl&q=Kind+of+Blue&sort=found&kept=1&artist=Miles+Davis&genre=Jazz&label=Columbia&found=Reckless+Records&when=2024&arrived=2025&condition=near_mint&year=1959&page=2",
    );
  });

  it("keeps a year and releases the decade beside it", () => {
    expect(collectionHref({ year: 1993, decade: 1990 })).toBe("/collection?year=1993");
    expect(collectionHref({ decade: 1990 })).toBe("/collection?decade=1990");
  });
});

describe("journalHref", () => {
  it("opens the journal, and can carry the arrival wave", () => {
    expect(journalHref("abc")).toBe("/collection/abc");
    expect(journalHref("abc", true)).toBe("/collection/abc?wave=1");
  });
});

describe("journalFromHref", () => {
  it("carries a list listen onto the journal", () => {
    expect(journalFromHref("abc")).toBe("/collection/abc");
    expect(journalFromHref("abc", "/collection?q=Miles")).toBe(
      "/collection/abc?from=%2Fcollection%3Fq%3DMiles",
    );
    expect(journalFromHref("abc", "/explorer?q=Nirvana", true)).toBe(
      "/collection/abc?wave=1&from=%2Fexplorer%3Fq%3DNirvana",
    );
    expect(journalFromHref("abc", "/profile?tab=close")).toBe(
      "/collection/abc?from=%2Fprofile%3Ftab%3Dclose",
    );
  });
});

describe("parseWaveFlag", () => {
  it("is only true for 1", () => {
    expect(parseWaveFlag("1")).toBe(true);
    expect(parseWaveFlag("true")).toBe(false);
    expect(parseWaveFlag(undefined)).toBe(false);
  });
});

describe("formatListenFromLocation", () => {
  it("tints only the shelf list", () => {
    expect(formatListenFromLocation("/collection", "vinyl")).toBe("vinyl");
    expect(formatListenFromLocation("/collection", "cassette")).toBe("cassette");
    expect(formatListenFromLocation("/collection", undefined)).toBeUndefined();
    expect(formatListenFromLocation("/collection/abc", "vinyl")).toBeUndefined();
    expect(formatListenFromLocation("/explorer", "vinyl")).toBeUndefined();
    expect(formatListenFromLocation("/collection", "cassette", ["vinyl", "cd"])).toBeUndefined();
    expect(formatListenFromLocation("/collection", "vinyl", ["vinyl", "cd"])).toBe("vinyl");
  });
});

describe("collectionFormatHref", () => {
  it("changes format without dropping the other threads", () => {
    expect(collectionFormatHref("q=Blue&sort=artist&page=2", "cassette")).toBe(
      "/collection?q=Blue&sort=artist&format=cassette",
    );
    expect(collectionFormatHref("format=vinyl&kept=1", undefined)).toBe("/collection?kept=1");
  });

  it("hears a decade typed as 1990s", () => {
    expect(collectionFormatHref("year=1990s&q=Nirvana", "vinyl")).toBe(
      "/collection?q=Nirvana&format=vinyl&decade=1990",
    );
  });
});

describe("collectionFormatNavHref", () => {
  it("keeps the shelf listen when you are already there", () => {
    expect(collectionFormatNavHref("/collection", "q=Blue&sort=artist", "cassette")).toBe(
      "/collection?q=Blue&sort=artist&format=cassette",
    );
  });

  it("does not carry another room's search onto the shelf", () => {
    expect(collectionFormatNavHref("/explorer", "q=Nirvana&format=vinyl", "cassette")).toBe(
      "/collection?format=cassette",
    );
    expect(collectionFormatNavHref("/collection/abc", "from=%2Fcollection&wave=1")).toBe("/collection");
  });
});

