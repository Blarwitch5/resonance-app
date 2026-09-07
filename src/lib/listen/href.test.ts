import { describe, expect, it } from "vitest";

import { listenAddHref, listenDiscogsHref, listenHref, toAbsoluteShareUrl } from "@/lib/listen/href";
import { createShareToken, isShareToken, parseShareTokenParam } from "@/lib/listen/token";

describe("listenHref", () => {
  it("builds an unlisted listen path", () => {
    expect(listenHref("abc_token-1234567890")).toBe("/listen/abc_token-1234567890");
  });
});

describe("listenDiscogsHref", () => {
  it("keeps Discogs releases on Resonance", () => {
    expect(listenDiscogsHref(2313422)).toBe("/listen/d/2313422");
    expect(listenDiscogsHref(0)).toBeNull();
    expect(listenDiscogsHref(-1)).toBeNull();
  });
});

describe("listenAddHref", () => {
  it("sends Discogs pressings to add", () => {
    expect(listenAddHref({ discogsId: 2313422, artist: "Nirvana", title: "In Utero" })).toBe(
      "/explorer/add/2313422",
    );
  });

  it("searches Explorer when the pressing has no Discogs id", () => {
    expect(listenAddHref({ discogsId: null, artist: "Nirvana", title: "In Utero" })).toBe(
      "/explorer?q=Nirvana+In+Utero",
    );
  });
});

describe("toAbsoluteShareUrl", () => {
  it("leaves absolute urls alone", () => {
    expect(toAbsoluteShareUrl("https://myresonance.vercel.app/listen/x", "https://example.com")).toBe(
      "https://myresonance.vercel.app/listen/x",
    );
  });

  it("joins relative listen paths to the origin", () => {
    expect(toAbsoluteShareUrl("/listen/x", "https://myresonance.vercel.app")).toBe(
      "https://myresonance.vercel.app/listen/x",
    );
  });
});

describe("share tokens", () => {
  it("makes opaque tokens", () => {
    const token = createShareToken();
    expect(isShareToken(token)).toBe(true);
    expect(token).not.toMatch(/[/+]/);
  });

  it("rejects short or wild tokens", () => {
    expect(isShareToken("d")).toBe(false);
    expect(isShareToken("../etc")).toBe(false);
    expect(isShareToken("")).toBe(false);
  });

  it("strips share-sheet prose glued onto the token", () => {
    expect(
      parseShareTokenParam("Yf1uk67a0KVhd-vysQGnDA Une étagère sur Resonance by Resonance"),
    ).toBe("Yf1uk67a0KVhd-vysQGnDA");
    expect(
      parseShareTokenParam(
        encodeURIComponent("Yf1uk67a0KVhd-vysQGnDA Une étagère sur Resonance by Resonance"),
      ),
    ).toBe("Yf1uk67a0KVhd-vysQGnDA");
  });
});
