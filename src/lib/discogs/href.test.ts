import { describe, expect, it } from "vitest";

import {
  discogsReleaseHref,
  discogsYearParam,
  discogsYearRange,
  EXPLORER_SEARCH_DEBOUNCE_MS,
  explorerAddHref,
  explorerBackHref,
  explorerCardHref,
  explorerClearHref,
  explorerListenCount,
  explorerListenFromEcho,
  explorerListenFromShelf,
  explorerQueryFromPressing,
  explorerSearchHref,
  explorerWhenFromParams,
  hasExplorerListen,
  listenFromExplorerSearchInput,
  parseSearchPage,
  resolveExplorerFormat,
  resolveExplorerWhen,
} from "@/lib/discogs/href";

describe("explorerSearchHref", () => {
  it("returns Explorer with query, format, and page", () => {
    expect(explorerSearchHref()).toBe("/explorer");
    expect(explorerSearchHref({ query: "Miles Davis", format: "vinyl" })).toBe(
      "/explorer?q=Miles+Davis&format=vinyl",
    );
    expect(explorerSearchHref({ query: "Kind of Blue", page: 2 })).toBe("/explorer?q=Kind+of+Blue&page=2");
  });

  it("keeps an explicit all-formats listen", () => {
    expect(explorerSearchHref({ query: "Nirvana", format: "all" })).toBe("/explorer?q=Nirvana&format=all");
    expect(explorerSearchHref({ format: "all" })).toBe("/explorer?format=all");
  });

  it("serializes genre, label, and decade", () => {
    expect(
      explorerSearchHref({
        query: "Miles",
        format: "vinyl",
        genre: "Jazz",
        label: "Columbia",
        decade: 1950,
      }),
    ).toBe("/explorer?q=Miles&format=vinyl&genre=Jazz&label=Columbia&decade=1950");
    expect(explorerSearchHref({ year: 1993, format: "vinyl" })).toBe("/explorer?format=vinyl&year=1993");
    expect(explorerSearchHref({ year: 1993, decade: 1990, format: "vinyl" })).toBe(
      "/explorer?format=vinyl&year=1993",
    );
  });
});

describe("listenFromExplorerSearchInput", () => {
  it("starts the typed listen from the first pressings", () => {
    expect(
      explorerSearchHref(
        listenFromExplorerSearchInput(
          { format: "vinyl", page: 2, query: "old", genre: "Rock" },
          "  Kind of Blue  ",
        ),
      ),
    ).toBe("/explorer?q=Kind+of+Blue&format=vinyl&genre=Rock");
  });

  it("clears the typed listen and keeps the other threads", () => {
    expect(
      explorerSearchHref(listenFromExplorerSearchInput({ query: "Blue", format: "vinyl", label: "ECM" }, "   ")),
    ).toBe("/explorer?format=vinyl&label=ECM");
  });
});

describe("EXPLORER_SEARCH_DEBOUNCE_MS", () => {
  it("waits so Discogs can breathe", () => {
    expect(EXPLORER_SEARCH_DEBOUNCE_MS).toBe(800);
  });
});

describe("explorerListenFromShelf", () => {
  it("prefers the typed search", () => {
    expect(explorerListenFromShelf({ query: "  Kind of Blue  ", artist: "Miles Davis", genre: "Jazz" })).toEqual({
      query: "Kind of Blue",
      format: undefined,
    });
  });

  it("keeps artist as a query and genre or decade as threads", () => {
    expect(explorerListenFromShelf({ artist: "Miles Davis", genre: "Jazz", format: "vinyl" })).toEqual({
      query: "Miles Davis",
      format: "vinyl",
      genre: "Jazz",
      label: undefined,
      decade: undefined,
    });
    expect(explorerListenFromShelf({ label: "ECM", decade: 1970 })).toEqual({
      query: undefined,
      format: undefined,
      genre: undefined,
      label: "ECM",
      decade: 1970,
    });
    expect(explorerListenFromShelf({ year: 1993 })).toEqual({
      query: undefined,
      format: undefined,
      genre: undefined,
      label: undefined,
      decade: undefined,
      year: 1993,
    });
    expect(hasExplorerListen(explorerListenFromShelf({ year: 1993 }))).toBe(true);
    expect(hasExplorerListen(explorerListenFromShelf({}))).toBe(false);
  });
});

describe("explorerListenFromEcho", () => {
  it("listens to a genre as a Discogs thread, not a typed title", () => {
    expect(explorerListenFromEcho({ kind: "genre", query: "Jazz", name: "Jazz" }, "vinyl")).toEqual({
      genre: "Jazz",
      format: "vinyl",
    });
    expect(explorerListenFromEcho({ kind: "artist", query: "Miles Davis", name: "Miles Davis" })).toEqual({
      query: "Miles Davis",
      format: undefined,
    });
  });
});

describe("discogsYearRange and discogsYearParam", () => {
  it("opens a decade as a Discogs year range", () => {
    expect(discogsYearRange(1970)).toBe("1970-1979");
  });

  it("prefers an exact year over a decade", () => {
    expect(discogsYearParam({ year: 1993, decade: 1990 })).toBe("1993");
    expect(discogsYearParam({ decade: 1990 })).toBe("1990-1999");
    expect(discogsYearParam({})).toBeUndefined();
  });
});

describe("resolveExplorerWhen", () => {
  it("keeps a year and releases the decade beside it", () => {
    expect(resolveExplorerWhen(1993, 1990)).toEqual({ year: 1993 });
    expect(resolveExplorerWhen(undefined, 1990)).toEqual({ decade: 1990 });
    expect(resolveExplorerWhen(undefined, undefined)).toEqual({});
  });
});

describe("explorerWhenFromParams", () => {
  it("hears a decade typed as 1990s", () => {
    expect(explorerWhenFromParams("1990s", undefined)).toEqual({ decade: 1990 });
    expect(explorerWhenFromParams("1993", "1990")).toEqual({ year: 1993 });
    expect(explorerWhenFromParams(undefined, "1990")).toEqual({ decade: 1990 });
  });
});

describe("explorerQueryFromPressing", () => {
  it("joins artist and title", () => {
    expect(explorerQueryFromPressing("Miles Davis", "Kind of Blue")).toBe("Miles Davis Kind of Blue");
    expect(explorerQueryFromPressing("  ", "Untitled")).toBe("Untitled");
    expect(explorerQueryFromPressing("", "")).toBe("");
  });
});

describe("discogsReleaseHref", () => {
  it("only links a positive integer id", () => {
    expect(discogsReleaseHref(12345)).toBe("https://www.discogs.com/release/12345");
    expect(discogsReleaseHref(0)).toBeNull();
    expect(discogsReleaseHref(-1)).toBeNull();
    expect(discogsReleaseHref(1.5)).toBeNull();
  });
});

describe("explorerAddHref", () => {
  it("opens Confirm for a Discogs release", () => {
    expect(explorerAddHref(2313422)).toBe("/explorer/add/2313422");
    expect(explorerAddHref(0)).toBeNull();
  });

  it("carries the Explorer listen back to Confirm", () => {
    expect(explorerAddHref(2313422, "/explorer?q=Nirvana")).toBe(
      "/explorer/add/2313422?from=%2Fexplorer%3Fq%3DNirvana",
    );
    expect(explorerAddHref(2313422, "https://evil.example/explorer")).toBe("/explorer/add/2313422");
    expect(explorerAddHref(2313422, "/collection?q=Nirvana")).toBe("/explorer/add/2313422");
  });
});

describe("explorerCardHref", () => {
  it("opens Confirm when the pressing is still elsewhere", () => {
    expect(explorerCardHref({ status: "absent" }, 2313422)).toBe("/explorer/add/2313422");
    expect(explorerCardHref({ status: "absent" }, null)).toBeNull();
    expect(explorerCardHref({ status: "absent" }, 2313422, "/explorer?q=Nirvana")).toBe(
      "/explorer/add/2313422?from=%2Fexplorer%3Fq%3DNirvana",
    );
  });

  it("opens the journal when the pressing already lives with you", () => {
    expect(explorerCardHref({ status: "owned", itemId: "rec-1" }, 2313422, "/explorer?q=Nirvana")).toBe(
      "/collection/rec-1?from=%2Fexplorer%3Fq%3DNirvana",
    );
    expect(explorerCardHref({ status: "wishlist", itemId: "rec-2" }, 2313422)).toBe("/collection/rec-2");
  });
});

describe("explorerBackHref", () => {
  it("returns to the Explorer listen that opened Confirm", () => {
    expect(explorerBackHref("/explorer?q=Nirvana")).toBe("/explorer?q=Nirvana");
    expect(explorerBackHref("/explorer")).toBe("/explorer");
    expect(explorerBackHref("https://evil.example")).toBe("/explorer");
    expect(explorerBackHref(undefined)).toBe("/explorer");
  });
});

describe("explorerListenCount", () => {
  it("ignores format, search, and paging", () => {
    expect(
      explorerListenCount({
        query: "Kind of Blue",
        format: "vinyl",
        page: 2,
      }),
    ).toBe(0);
  });

  it("counts the Discogs threads", () => {
    expect(
      explorerListenCount({
        genre: "Jazz",
        label: "Columbia",
        decade: 1950,
        year: 1959,
      }),
    ).toBe(4);
  });
});

describe("resolveExplorerFormat", () => {
  it("listens to the format that leads when none is asked", () => {
    expect(resolveExplorerFormat(undefined, ["vinyl", "cassette", "cd"], "vinyl")).toBe("vinyl");
    expect(resolveExplorerFormat(undefined, ["vinyl", "cd"], "cd")).toBe("cd");
  });

  it("keeps an explicit format, including all", () => {
    expect(resolveExplorerFormat("cassette", ["vinyl", "cassette", "cd"], "vinyl")).toBe("cassette");
    expect(resolveExplorerFormat("all", ["vinyl", "cd"], "vinyl")).toBeUndefined();
  });

  it("falls back when the asked format no longer lives here", () => {
    expect(resolveExplorerFormat("cassette", ["vinyl", "cd"], "cd")).toBe("cd");
    expect(resolveExplorerFormat(undefined, ["cd"], "vinyl")).toBe("cd");
  });
});

describe("explorerClearHref", () => {
  it("keeps the title and format, releases the other threads", () => {
    expect(
      explorerClearHref({
        query: "Miles",
        format: "vinyl",
        genre: "Jazz",
        label: "Columbia",
        decade: 1950,
        year: 1959,
        page: 2,
      }),
    ).toBe("/explorer?q=Miles&format=vinyl");
  });
});

describe("parseSearchPage", () => {
  it("defaults invalid values to 1 and caps at 50", () => {
    expect(parseSearchPage(undefined)).toBe(1);
    expect(parseSearchPage("0")).toBe(1);
    expect(parseSearchPage("abc")).toBe(1);
    expect(parseSearchPage("12")).toBe(12);
    expect(parseSearchPage("99")).toBe(50);
  });
});

