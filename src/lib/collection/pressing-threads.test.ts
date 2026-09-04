import { describe, expect, it } from "vitest";

import { pressingFacts, toPressingThreads } from "@/lib/collection/pressing-threads";

const source = {
  format: "vinyl" as const,
  title: "Kind of Blue",
  artist: "Miles Davis",
  year: 1959,
  label: "Columbia",
  genres: ["Jazz", "Modal"],
  barcode: "12345678",
  discogsId: 12345,
  country: "US",
  catalogNumber: "CL 1355",
  formatNames: ["Vinyl", "LP", "Album", "Reissue"],
  creditLine: "Produced by Teo Macero",
  condition: "near_mint" as const,
  purchaseLocation: "Reckless Records",
  purchaseDate: "2024-03-15",
};

describe("toPressingThreads", () => {
  it("opens shelf threads and Discogs from a pressing", () => {
    const threads = toPressingThreads(source);

    expect(threads.formatHref).toBe("/collection?format=vinyl");
    expect(threads.artistHref).toBe("/collection?artist=Miles+Davis");
    expect(threads.yearHref).toBe("/collection?year=1959");
    expect(threads.yearAria).toBe("Hear 1959 on your shelf");
    expect(threads.decade).toEqual({
      label: "1950s",
      href: "/collection?decade=1950",
      ariaLabel: "Hear the 1950s on your shelf",
    });
    expect(threads.labelHref).toBe("/collection?label=Columbia");
    expect(threads.country).toBe("US");
    expect(threads.catalogNumber).toBe("CL 1355");
    expect(threads.formatLine).toBe("Vinyl · LP · Album");
    expect(threads.creditLine).toBe("Produced by Teo Macero");
    expect(threads.genres).toEqual([
      { name: "Jazz", href: "/collection?genre=Jazz" },
      { name: "Modal", href: "/collection?genre=Modal" },
    ]);
    expect(threads.condition?.href).toBe("/collection?condition=near_mint");
    expect(threads.found).toEqual({
      where: "Reckless Records",
      when: "2024-03-15",
      href: "/collection?found=Reckless+Records",
      whenHref: "/collection?when=2024",
    });
    expect(threads.discogs?.href).toBe("https://www.discogs.com/release/12345");
    expect(threads.discogs?.id).toBe(12345);
    expect(threads.elsewhereHref).toBe("/explorer?q=Miles+Davis+Kind+of+Blue&format=vinyl");
  });

  it("stays quiet without optional threads", () => {
    const threads = toPressingThreads({
      format: "cd",
      title: "Untitled",
      artist: "Unknown",
      year: null,
      label: null,
      genres: [],
      barcode: null,
    });

    expect(threads.artistHref).toBe("/collection?artist=Unknown");
    expect(threads.yearHref).toBeNull();
    expect(threads.decade).toBeNull();
    expect(threads.labelHref).toBeNull();
    expect(threads.catalogNumber).toBeNull();
    expect(threads.creditLine).toBeNull();
    expect(threads.condition).toBeNull();
    expect(threads.found).toBeNull();
    expect(threads.discogs).toBeNull();
    expect(threads.elsewhereHref).toBe("/explorer?q=Unknown+Untitled&format=cd");
  });
});

describe("pressingFacts", () => {
  it("lays year, decade, origin, label, and pressing side by side", () => {
    const facts = pressingFacts(toPressingThreads(source));

    expect(facts.map((fact) => fact.key)).toEqual(["year", "decade", "origin", "label", "pressing"]);
    expect(facts[0]?.value).toBe("1959");
    expect(facts[0]?.isMono).toBe(true);
    expect(facts[2]?.value).toBe("US");
    expect(facts[4]?.value).toBe("Vinyl · LP · Album");
  });
});
