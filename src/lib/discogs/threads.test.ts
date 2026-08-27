import { describe, expect, it } from "vitest";

import { summarizeCollection, type CollectionStatItem } from "@/lib/collection/stats";
import type { ReleaseDraft } from "@/lib/collection/types";
import {
  explorerCardThreads,
  explorerThreadFromFields,
  explorerThreadGroups,
  explorerThreadSuggestions,
} from "@/lib/discogs/threads";

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

function draft(partial: Partial<ReleaseDraft> = {}): ReleaseDraft {
  return {
    discogsId: 1,
    format: "vinyl",
    title: "In Utero",
    artist: "Nirvana",
    year: 1993,
    label: "DGC",
    genres: ["Rock", "Grunge"],
    coverUrl: null,
    barcode: null,
    catalogNumber: null,
    ...partial,
  };
}

describe("explorerThreadFromFields", () => {
  it("hears a typed genre, label, and year", () => {
    expect(explorerThreadFromFields({ genre: "  Jazz  ", label: " ECM ", year: "1993" })).toEqual({
      genre: "Jazz",
      label: "ECM",
      year: 1993,
    });
  });

  it("stays quiet about empty or impossible threads", () => {
    expect(explorerThreadFromFields({ genre: "  ", label: "", year: "1800" })).toEqual({});
    expect(explorerThreadFromFields({})).toEqual({});
    expect(explorerThreadFromFields({ year: "1993s" })).toEqual({});
  });

  it("hears a typed decade", () => {
    expect(explorerThreadFromFields({ year: " 1990s " })).toEqual({ decade: 1990 });
  });

  it("hears 1990 as a year, not a decade", () => {
    expect(explorerThreadFromFields({ year: "1990" })).toEqual({ year: 1990 });
  });
});

describe("explorerThreadSuggestions", () => {
  it("stays quiet without a shelf or pressings", () => {
    expect(explorerThreadSuggestions({ listen: {} })).toEqual([]);
    expect(explorerThreadSuggestions({ listen: {}, insight: summarizeCollection([]), drafts: [] })).toEqual([]);
  });

  it("follows threads from the shelf first", () => {
    const insight = summarizeCollection([
      item(),
      item({ artist: "Alice Coltrane", year: 1971, label: "Impulse!", genres: ["Jazz", "Spiritual"] }),
      item({ year: 1969 }),
      item({ artist: "Alice Coltrane", year: 1970, label: "Impulse!", genres: ["Jazz"] }),
    ]);

    expect(explorerThreadSuggestions({ listen: {}, insight }).map((chip) => chip.key)).toEqual([
      "genre:Jazz",
      "genre:Spiritual",
      "label:Columbia",
      "label:Impulse!",
      "decade:1950",
      "decade:1960",
      "decade:1970",
    ]);
  });

  it("hears threads in the pressings on the table", () => {
    expect(
      explorerThreadSuggestions({
        listen: { query: "Nirvana" },
        drafts: [
          draft(),
          draft({
            discogsId: 2,
            title: "Nevermind",
            year: 1991,
            label: "DGC",
            genres: ["Rock"],
          }),
          draft({
            discogsId: 3,
            title: "Bleach",
            year: 1989,
            label: "Sub Pop",
            genres: ["Grunge"],
          }),
        ],
      }).map((chip) => chip.key),
    ).toEqual(["genre:Rock", "genre:Grunge", "label:DGC", "label:Sub Pop", "year:1993", "year:1991", "year:1989"]);
  });

  it("skips a thread already in the listen", () => {
    expect(
      explorerThreadSuggestions({
        listen: { genre: "Rock", year: 1993 },
        drafts: [draft(), draft({ discogsId: 2, year: 1991, genres: ["Rock"], label: "Sub Pop" })],
      }).map((chip) => chip.key),
    ).toEqual(["label:DGC", "label:Sub Pop"]);
  });

  it("does not repeat a shelf thread among the pressings", () => {
    const insight = summarizeCollection([item(), item()]);

    expect(
      explorerThreadSuggestions({
        listen: {},
        insight,
        drafts: [
          draft({ year: 1959, label: "Columbia", genres: ["Jazz"] }),
          draft({ discogsId: 2, year: 1993, label: "DGC", genres: ["Rock"] }),
        ],
      }).map((chip) => chip.key),
    ).toEqual(["genre:Jazz", "label:Columbia", "decade:1950", "genre:Rock", "label:DGC", "year:1993", "year:1959"]);
  });

  it("keeps a shared thread on the shelf, not among the pressings", () => {
    const insight = summarizeCollection([item(), item()]);
    const groups = explorerThreadGroups({
      listen: {},
      insight,
      drafts: [
        draft({ year: 1959, label: "Columbia", genres: ["Jazz"] }),
        draft({ discogsId: 2, year: 1993, label: "DGC", genres: ["Rock"] }),
      ],
    });

    expect(groups.shelf.map((chip) => chip.key)).toEqual(["genre:Jazz", "label:Columbia", "decade:1950"]);
    expect(groups.results.map((chip) => chip.key)).toEqual(["genre:Rock", "label:DGC", "year:1993", "year:1959"]);
  });
});

describe("explorerCardThreads", () => {
  it("follows the artist, the year, the label, and the first unheard genre", () => {
    expect(explorerCardThreads(draft(), { format: "vinyl" })).toEqual({
      artist: {
        label: "Nirvana",
        href: "/explorer?q=Nirvana&format=vinyl",
        ariaLabel: "Hear Nirvana",
      },
      year: {
        label: "1993",
        href: "/explorer?format=vinyl&year=1993",
        ariaLabel: "Hear 1993",
      },
      label: {
        label: "DGC",
        href: "/explorer?format=vinyl&label=DGC",
        ariaLabel: "Hear DGC",
      },
      genre: {
        label: "Rock",
        href: "/explorer?format=vinyl&genre=Rock",
        ariaLabel: "Hear Rock",
      },
      format: {
        label: "Vinyl",
        href: null,
        ariaLabel: null,
      },
      decade: {
        label: "1990s",
        href: "/explorer?format=vinyl&decade=1990",
        ariaLabel: "Hear the 1990s",
      },
    });
  });

  it("keeps the current listen beside a new thread", () => {
    expect(explorerCardThreads(draft(), { query: "Nirvana", format: "vinyl" }).year?.href).toBe(
      "/explorer?q=Nirvana&format=vinyl&year=1993",
    );
  });

  it("shows the artist without opening it twice", () => {
    expect(explorerCardThreads(draft(), { query: "Nirvana", format: "vinyl" }).artist).toEqual({
      label: "Nirvana",
      href: null,
      ariaLabel: null,
    });
  });

  it("shows the year without opening it twice", () => {
    expect(explorerCardThreads(draft(), { year: 1993, format: "vinyl" })).toEqual({
      artist: {
        label: "Nirvana",
        href: "/explorer?q=Nirvana&format=vinyl&year=1993",
        ariaLabel: "Hear Nirvana",
      },
      year: { label: "1993", href: null, ariaLabel: null },
      label: {
        label: "DGC",
        href: "/explorer?format=vinyl&label=DGC&year=1993",
        ariaLabel: "Hear DGC",
      },
      genre: {
        label: "Rock",
        href: "/explorer?format=vinyl&genre=Rock&year=1993",
        ariaLabel: "Hear Rock",
      },
      format: {
        label: "Vinyl",
        href: null,
        ariaLabel: null,
      },
      decade: {
        label: "1990s",
        href: "/explorer?format=vinyl&decade=1990",
        ariaLabel: "Hear the 1990s",
      },
    });
  });

  it("offers the next genre when the first is already the listen", () => {
    expect(explorerCardThreads(draft(), { genre: "Rock", format: "vinyl" }).genre).toEqual({
      label: "Grunge",
      href: "/explorer?format=vinyl&genre=Grunge",
      ariaLabel: "Hear Grunge",
    });
  });

  it("shows the label without opening it twice", () => {
    expect(explorerCardThreads(draft(), { label: "DGC", format: "vinyl" }).label).toEqual({
      label: "DGC",
      href: null,
      ariaLabel: null,
    });
  });

  it("stays quiet without an artist, a year, a label, or a genre to follow", () => {
    expect(explorerCardThreads(draft({ artist: "  ", year: null, label: null, genres: [] }), {})).toEqual({
      artist: null,
      year: null,
      label: null,
      genre: null,
      format: {
        label: "Vinyl",
        href: "/explorer?format=vinyl",
        ariaLabel: "Hear Vinyl",
      },
      decade: null,
    });
  });

  it("follows a format that is not already the listen", () => {
    expect(explorerCardThreads(draft({ format: "cd" }), { query: "Nirvana", format: "vinyl" }).format).toEqual({
      label: "CD",
      href: "/explorer?q=Nirvana&format=cd",
      ariaLabel: "Hear CD",
    });
  });

  it("follows the format when the listen is all formats", () => {
    expect(explorerCardThreads(draft(), { format: "all" }).format).toEqual({
      label: "Vinyl",
      href: "/explorer?format=vinyl",
      ariaLabel: "Hear Vinyl",
    });
  });

  it("follows the decade beside the year", () => {
    expect(explorerCardThreads(draft(), { format: "vinyl" }).decade).toEqual({
      label: "1990s",
      href: "/explorer?format=vinyl&decade=1990",
      ariaLabel: "Hear the 1990s",
    });
  });

  it("shows the decade without opening it twice", () => {
    expect(explorerCardThreads(draft(), { decade: 1990, format: "vinyl" }).decade).toEqual({
      label: "1990s",
      href: null,
      ariaLabel: null,
    });
  });

  it("releases the year when following a decade", () => {
    expect(explorerCardThreads(draft(), { year: 1993, format: "vinyl" }).decade?.href).toBe(
      "/explorer?format=vinyl&decade=1990",
    );
  });
});
