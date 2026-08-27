import { describe, expect, it } from "vitest";

import {
  collectionDocumentTitle,
  explorerDocumentTitle,
  journalDocumentTitle,
  profileDocumentTitle,
} from "@/lib/document-title";

describe("journalDocumentTitle", () => {
  it("names the pressing, then the artist", () => {
    expect(journalDocumentTitle("Kind of Blue", "Miles Davis")).toBe("Kind of Blue — Miles Davis");
  });

  it("keeps a lone title or artist", () => {
    expect(journalDocumentTitle("Untitled", "  ")).toBe("Untitled");
    expect(journalDocumentTitle("   ", "Alice Coltrane")).toBe("Alice Coltrane");
    expect(journalDocumentTitle("  ", "  ")).toBe("Journal");
  });
});

describe("collectionDocumentTitle", () => {
  it("stays on Collection when the shelf is quiet", () => {
    expect(collectionDocumentTitle({})).toBe("Collection");
    expect(collectionDocumentTitle({ query: "   " })).toBe("Collection");
  });

  it("names the listen on the shelf", () => {
    expect(collectionDocumentTitle({ query: "  Kind of Blue  " })).toBe("Kind of Blue · Collection");
    expect(collectionDocumentTitle({ keptClose: true })).toBe("Kept close");
    expect(collectionDocumentTitle({ query: "Miles", keptClose: true })).toBe("Miles · Collection");
  });

  it("names the year, artist, and other threads", () => {
    expect(collectionDocumentTitle({ year: 1993 })).toBe("1993 · Collection");
    expect(collectionDocumentTitle({ artist: "  Nirvana  " })).toBe("Nirvana · Collection");
    expect(collectionDocumentTitle({ decade: 1990 })).toBe("1990s · Collection");
    expect(collectionDocumentTitle({ label: "Geffen Records" })).toBe("Geffen Records · Collection");
    expect(collectionDocumentTitle({ genre: "Grunge" })).toBe("Grunge · Collection");
    expect(collectionDocumentTitle({ format: "vinyl" })).toBe("Vinyl · Collection");
    expect(collectionDocumentTitle({ year: 1993, keptClose: true })).toBe("1993 · Collection");
    expect(collectionDocumentTitle({ query: "Miles", year: 1993 })).toBe("Miles · Collection");
  });

  it("names the journal threads", () => {
    expect(collectionDocumentTitle({ condition: "near_mint" })).toBe("Near mint · Collection");
    expect(collectionDocumentTitle({ found: "  Reckless Records  " })).toBe("Reckless Records · Collection");
    expect(collectionDocumentTitle({ when: 2024 })).toBe("Found in 2024 · Collection");
    expect(collectionDocumentTitle({ arrived: 2025 })).toBe("Arrived 2025 · Collection");
    expect(collectionDocumentTitle({ found: "Reckless Records", condition: "near_mint" })).toBe(
      "Reckless Records · Collection",
    );
  });
});

describe("explorerDocumentTitle", () => {
  it("names the listen beyond the shelf", () => {
    expect(explorerDocumentTitle({})).toBe("Explorer");
    expect(explorerDocumentTitle({ query: "  Miles  " })).toBe("Miles · Explorer");
    expect(explorerDocumentTitle({ query: "a".repeat(60) })).toBe(`${"a".repeat(48)}… · Explorer`);
  });

  it("names a Discogs thread", () => {
    expect(explorerDocumentTitle({ decade: 1990 })).toBe("1990s · Explorer");
    expect(explorerDocumentTitle({ year: 1993 })).toBe("1993 · Explorer");
    expect(explorerDocumentTitle({ genre: " Jazz " })).toBe("Jazz · Explorer");
    expect(explorerDocumentTitle({ label: "ECM" })).toBe("ECM · Explorer");
    expect(explorerDocumentTitle({ query: "Miles", year: 1993 })).toBe("Miles · Explorer");
  });
});

describe("profileDocumentTitle", () => {
  it("names the room you are in", () => {
    expect(profileDocumentTitle({ tab: "resonance" })).toBe("Profile");
    expect(profileDocumentTitle({ tab: "close" })).toBe("Kept close");
    expect(profileDocumentTitle({ tab: "waiting" })).toBe("Waiting");
    expect(profileDocumentTitle({ tab: "close", settings: true })).toBe("Settings");
  });

  it("keeps a typed listen on the open tab", () => {
    expect(profileDocumentTitle({ tab: "waiting", query: " Radiohead " })).toBe("Radiohead · Waiting");
  });
});
