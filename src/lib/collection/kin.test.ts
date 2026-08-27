import { describe, expect, it } from "vitest";

import { pickShelfKin, SHELF_KIN_LIMIT, shelfKinHeadline } from "@/lib/collection/kin";

const inUtero = { id: "in-utero" };
const bleach = { id: "bleach" };
const nevermind = { id: "nevermind" };
const okComputer = { id: "ok-computer" };
const kidA = { id: "kid-a" };
const kindOfBlue = { id: "kind-of-blue" };

describe("shelfKinHeadline", () => {
  it("names how many more live nearby", () => {
    expect(shelfKinHeadline("artist", "Nirvana", 1)).toBe("1 more from Nirvana on your shelf.");
    expect(shelfKinHeadline("artist", "Nirvana", 2)).toBe("2 more from Nirvana on your shelf.");
    expect(shelfKinHeadline("decade", "1990s", 1)).toBe("1 more from the 1990s on your shelf.");
  });

  it("stays quiet without a neighbor", () => {
    expect(shelfKinHeadline("artist", "Nirvana", 0)).toBeNull();
    expect(shelfKinHeadline("artist", "  ", 2)).toBeNull();
  });

  it("names the artist already on the shelf when this pressing is still elsewhere", () => {
    expect(shelfKinHeadline("artist", "Nirvana", 1, false)).toBe("Nirvana already lives on your shelf.");
    expect(shelfKinHeadline("artist", "Nirvana", 2, false)).toBe(
      "2 from Nirvana already live on your shelf.",
    );
    expect(shelfKinHeadline("decade", "1990s", 1, false)).toBe("The 1990s already live on your shelf.");
    expect(shelfKinHeadline("decade", "1990s", 2, false)).toBe(
      "2 from the 1990s already live on your shelf.",
    );
  });
});

describe("pickShelfKin", () => {
  it("prefers other pressings by the same artist", () => {
    expect(
      pickShelfKin({
        currentId: inUtero.id,
        artist: "Nirvana",
        artistHref: "/collection?artist=Nirvana",
        artistRecords: [inUtero, bleach, nevermind],
        decadeLabel: "1990s",
        decadeHref: "/collection?decade=1990",
        decadeRecords: [inUtero, okComputer],
      }),
    ).toEqual({
      headline: "2 more from Nirvana on your shelf.",
      href: "/collection?artist=Nirvana",
      records: [bleach, nevermind],
    });
  });

  it("falls to the decade when the artist stands alone", () => {
    expect(
      pickShelfKin({
        currentId: inUtero.id,
        artist: "Nirvana",
        artistHref: "/collection?artist=Nirvana",
        artistRecords: [inUtero],
        decadeLabel: "1990s",
        decadeHref: "/collection?decade=1990",
        decadeRecords: [inUtero, okComputer],
      }),
    ).toEqual({
      headline: "1 more from the 1990s on your shelf.",
      href: "/collection?decade=1990",
      records: [okComputer],
    });
  });

  it("stays quiet when nothing else shares the thread", () => {
    expect(
      pickShelfKin({
        currentId: kindOfBlue.id,
        artist: "Miles Davis",
        artistHref: "/collection?artist=Miles+Davis",
        artistRecords: [kindOfBlue],
        decadeLabel: "1950s",
        decadeHref: "/collection?decade=1950",
        decadeRecords: [kindOfBlue],
      }),
    ).toBeNull();
  });

  it("keeps only a handful of neighbors", () => {
    const extras = [bleach, nevermind, kidA, okComputer, kindOfBlue];
    const picked = pickShelfKin({
      currentId: inUtero.id,
      artist: "Nirvana",
      artistHref: "/collection?artist=Nirvana",
      artistRecords: [inUtero, ...extras],
      decadeLabel: null,
      decadeHref: null,
      decadeRecords: [],
    });

    expect(picked?.records).toEqual(extras.slice(0, SHELF_KIN_LIMIT));
    expect(picked?.records).toHaveLength(4);
  });

  it("hears the artist already waiting when this pressing is still elsewhere", () => {
    expect(
      pickShelfKin({
        currentId: "new-nirvana",
        artist: "Nirvana",
        artistHref: "/collection?artist=Nirvana",
        artistRecords: [inUtero],
        decadeLabel: "1990s",
        decadeHref: "/collection?decade=1990",
        decadeRecords: [inUtero, okComputer],
        isOnShelf: false,
      }),
    ).toEqual({
      headline: "Nirvana already lives on your shelf.",
      href: "/collection?artist=Nirvana",
      records: [inUtero],
    });
  });
});
