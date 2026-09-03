import { describe, expect, it } from "vitest";

import { shelfCardDetails, shelfCardThreads } from "@/lib/collection/shelf-threads";

describe("shelfCardThreads", () => {
  it("follows the artist and year on the shelf", () => {
    expect(shelfCardThreads({ artist: "Nirvana", year: 1993, label: "Geffen Records" }, { format: "vinyl" })).toEqual({
      artist: {
        label: "Nirvana",
        href: "/collection?format=vinyl&artist=Nirvana",
        ariaLabel: "Hear Nirvana on your shelf",
      },
      year: {
        label: "1993",
        href: "/collection?format=vinyl&year=1993",
        ariaLabel: "Hear 1993 on your shelf",
      },
      label: {
        label: "Geffen Records",
        href: "/collection?format=vinyl&label=Geffen+Records",
        ariaLabel: "Hear Geffen Records on your shelf",
      },
      genre: null,
      format: null,
      decade: {
        label: "1990s",
        href: "/collection?format=vinyl&decade=1990",
        ariaLabel: "Hear the 1990s on your shelf",
      },
      condition: null,
      found: null,
      foundWhen: null,
    });
  });

  it("keeps the current listen beside a new thread", () => {
    expect(
      shelfCardThreads({ artist: "Nirvana", year: 1993 }, { query: "Utero", format: "vinyl" }).year?.href,
    ).toBe("/collection?format=vinyl&q=Utero&year=1993");
  });

  it("shows the artist without opening it twice", () => {
    expect(shelfCardThreads({ artist: "Nirvana", year: 1993 }, { artist: "Nirvana" }).artist).toEqual({
      label: "Nirvana",
      href: null,
      ariaLabel: null,
    });
  });

  it("shows the year without opening it twice", () => {
    expect(shelfCardThreads({ artist: "Nirvana", year: 1993 }, { year: 1993 }).year).toEqual({
      label: "1993",
      href: null,
      ariaLabel: null,
    });
  });

  it("shows the label without opening it twice", () => {
    expect(
      shelfCardThreads({ artist: "Nirvana", year: 1993, label: "Geffen Records" }, { label: "Geffen Records" }).label,
    ).toEqual({
      label: "Geffen Records",
      href: null,
      ariaLabel: null,
    });
  });

  it("stays quiet without an artist, a year, or a label to follow", () => {
    expect(shelfCardThreads({ artist: "  ", year: null, label: "  " }, {})).toEqual({
      artist: null,
      year: null,
      label: null,
      genre: null,
      format: null,
      decade: null,
      condition: null,
      found: null,
      foundWhen: null,
    });
  });

  it("follows the first unheard genre on the shelf", () => {
    expect(
      shelfCardThreads(
        { artist: "Nirvana", year: 1993, genres: ["Rock", "Grunge"] },
        { format: "vinyl" },
      ).genre,
    ).toEqual({
      label: "Rock",
      href: "/collection?format=vinyl&genre=Rock",
      ariaLabel: "Hear Rock on your shelf",
    });
  });

  it("offers the next genre when the first is already the listen", () => {
    expect(
      shelfCardThreads(
        { artist: "Nirvana", year: 1993, genres: ["Rock", "Grunge"] },
        { genre: "Rock" },
      ).genre,
    ).toEqual({
      label: "Grunge",
      href: "/collection?genre=Grunge",
      ariaLabel: "Hear Grunge on your shelf",
    });
  });

  it("stays quiet when every genre is already the listen", () => {
    expect(
      shelfCardThreads({ artist: "Nirvana", year: 1993, genres: ["Rock"] }, { genre: "Rock" }).genre,
    ).toBeNull();
  });

  it("follows the format on the shelf", () => {
    expect(shelfCardThreads({ artist: "Nirvana", year: 1993, format: "vinyl" }, { genre: "Rock" }).format).toEqual({
      label: "Vinyl",
      href: "/collection?format=vinyl&genre=Rock",
      ariaLabel: "Hear Vinyl on your shelf",
    });
  });

  it("shows the format without opening it twice", () => {
    expect(
      shelfCardThreads({ artist: "Nirvana", year: 1993, format: "vinyl" }, { format: "vinyl" }).format,
    ).toEqual({
      label: "Vinyl",
      href: null,
      ariaLabel: null,
    });
  });

  it("follows the decade beside the year", () => {
    expect(shelfCardThreads({ artist: "Nirvana", year: 1993 }, { format: "vinyl" }).decade).toEqual({
      label: "1990s",
      href: "/collection?format=vinyl&decade=1990",
      ariaLabel: "Hear the 1990s on your shelf",
    });
  });

  it("shows the decade without opening it twice", () => {
    expect(shelfCardThreads({ artist: "Nirvana", year: 1993 }, { decade: 1990 }).decade).toEqual({
      label: "1990s",
      href: null,
      ariaLabel: null,
    });
  });

  it("releases the decade when following a year", () => {
    expect(shelfCardThreads({ artist: "Nirvana", year: 1993 }, { decade: 1990 }).year?.href).toBe(
      "/collection?year=1993",
    );
  });

  it("releases the year when following a decade", () => {
    expect(shelfCardThreads({ artist: "Nirvana", year: 1993 }, { year: 1993 }).decade?.href).toBe(
      "/collection?decade=1990",
    );
  });

  it("follows a condition on the shelf", () => {
    expect(
      shelfCardThreads({ artist: "Nirvana", year: 1993, condition: "near_mint" }, { format: "vinyl" }).condition,
    ).toEqual({
      label: "Near mint",
      href: "/collection?format=vinyl&condition=near_mint",
      ariaLabel: "Hear near mint pressings on your shelf",
    });
  });

  it("stays quiet when the condition is already the listen", () => {
    expect(
      shelfCardThreads(
        { artist: "Nirvana", year: 1993, condition: "near_mint" },
        { condition: "near_mint" },
      ).condition,
    ).toBeNull();
  });

  it("follows where it found you", () => {
    expect(
      shelfCardThreads({ artist: "Nirvana", year: 1993, found: "Reckless Records" }, { format: "vinyl" }).found,
    ).toEqual({
      label: "Reckless Records",
      href: "/collection?format=vinyl&found=Reckless+Records",
      ariaLabel: "Hear the records that found you in Reckless Records",
    });
  });

  it("shows the found place without opening it twice", () => {
    expect(
      shelfCardThreads(
        { artist: "Nirvana", year: 1993, found: "Reckless Records" },
        { found: "Reckless Records" },
      ).found,
    ).toEqual({
      label: "Reckless Records",
      href: null,
      ariaLabel: null,
    });
  });

  it("follows the year it found you", () => {
    expect(
      shelfCardThreads(
        { artist: "Nirvana", year: 1993, foundWhen: "2024-03-15" },
        { format: "vinyl" },
      ).foundWhen,
    ).toEqual({
      label: "2024",
      href: "/collection?format=vinyl&when=2024",
      ariaLabel: "Hear the records that found you in 2024",
    });
  });

  it("shows the found year without opening it twice", () => {
    expect(
      shelfCardThreads(
        { artist: "Nirvana", year: 1993, foundWhen: new Date("2024-03-15T00:00:00.000Z") },
        { when: 2024 },
      ).foundWhen,
    ).toEqual({
      label: "2024",
      href: null,
      ariaLabel: null,
    });
  });
});

describe("shelfCardDetails", () => {
  it("names the pressing without repeating the decade", () => {
    const threads = shelfCardThreads(
      { artist: "Nirvana", year: 1993, label: "Geffen Records" },
      { format: "vinyl" },
    );

    expect(shelfCardDetails(threads).map((thread) => thread?.label)).toEqual(["1993", "Geffen Records"]);
    expect(shelfCardDetails(threads).some((thread) => thread?.label === "1990s")).toBe(false);
  });

  it("keeps a fallback year when the thread is quiet", () => {
    expect(
      shelfCardDetails(null, { label: "12 Mar 2024", href: null, ariaLabel: null }).map((thread) => thread?.label),
    ).toEqual(["12 Mar 2024"]);
  });
});
