import { describe, expect, it } from "vitest";

import { marketplaceVoice, parseMarketplaceStats } from "@/lib/discogs/market";

describe("parseMarketplaceStats", () => {
  it("hears the lowest ask and how many copies wait", () => {
    expect(
      parseMarketplaceStats({
        lowest_price: { value: 12.5, currency: "USD" },
        num_for_sale: 23,
      }),
    ).toEqual({
      lowestPrice: { value: 12.5, currency: "USD" },
      copiesWaiting: 23,
    });
  });

  it("stays without a price when Discogs has none", () => {
    expect(parseMarketplaceStats({ num_for_sale: 0 })).toEqual({
      lowestPrice: null,
      copiesWaiting: 0,
    });
  });

  it("lets go of a payload that does not sound like the market", () => {
    expect(parseMarketplaceStats(null)).toBeNull();
    expect(parseMarketplaceStats("12.50")).toBeNull();
  });
});

describe("marketplaceVoice", () => {
  it("whispers the ask, not a collection total", () => {
    expect(
      marketplaceVoice("en", {
        lowestPrice: { value: 12.5, currency: "USD" },
        copiesWaiting: 23,
      }),
    ).toBe("On Discogs, this pressing still asks $12.50.");
    expect(
      marketplaceVoice("fr", {
        lowestPrice: { value: 12.5, currency: "USD" },
        copiesWaiting: 23,
      }),
    ).toMatch(/Sur Discogs, ce pressage demande encore .+\./);
  });

  it("names copies when the ask is missing", () => {
    expect(marketplaceVoice("en", { lowestPrice: null, copiesWaiting: 1 })).toBe(
      "One copy is still waiting on Discogs.",
    );
    expect(marketplaceVoice("en", { lowestPrice: null, copiesWaiting: 8 })).toBe(
      "8 copies are still waiting on Discogs.",
    );
    expect(marketplaceVoice("en", { lowestPrice: null, copiesWaiting: 0 })).toBe(
      "No copy is waiting on Discogs right now.",
    );
  });
});
