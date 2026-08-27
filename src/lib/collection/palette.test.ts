import { describe, expect, it } from "vitest";

import { filterPaletteCommands, PALETTE_COMMANDS, PALETTE_GO_HREFS, paletteGoHref, paletteRows } from "@/lib/collection/palette";

describe("filterPaletteCommands", () => {
  it("keeps every quiet path when nothing is typed", () => {
    expect(filterPaletteCommands("", PALETTE_COMMANDS).map((row) => row.id)).toEqual(
      PALETTE_COMMANDS.map((row) => row.id),
    );
  });

  it("hears a keyword inside a path", () => {
    expect(filterPaletteCommands("theme", PALETTE_COMMANDS).map((row) => row.id)).toEqual(["settings"]);
    expect(filterPaletteCommands("password", PALETTE_COMMANDS).map((row) => row.id)).toEqual(["settings"]);
    expect(filterPaletteCommands("favorite", PALETTE_COMMANDS).map((row) => row.id)).toEqual(["close"]);
    expect(filterPaletteCommands("wishlist", PALETTE_COMMANDS).map((row) => row.id)).toEqual(["waiting"]);
    expect(filterPaletteCommands("scan", PALETTE_COMMANDS).map((row) => row.id)).toEqual(["explorer"]);
    expect(filterPaletteCommands("tonight", PALETTE_COMMANDS).map((row) => row.id)).toEqual(["tonight"]);
    expect(filterPaletteCommands("shape", PALETTE_COMMANDS).map((row) => row.id)).toEqual(["listen"]);
  });
});

describe("paletteRows", () => {
  it("starts with the quiet paths", () => {
    expect(paletteRows("").map((row) => row.id)).toEqual([
      "search",
      "listen",
      "collection",
      "tonight",
      "explorer",
      "profile",
      "close",
      "waiting",
      "settings",
      "keys",
    ]);
  });

  it("offers to shape this listen from the palette", () => {
    expect(PALETTE_COMMANDS.find((row) => row.id === "listen")).toMatchObject({
      label: "Shape this listen",
      hint: "l",
      action: "focus-listen",
    });
  });

  it("offers to hear a typed title on the shelf and beyond", () => {
    const rows = paletteRows("  Kind of Blue  ");
    expect(rows[0]).toMatchObject({
      id: "hear-shelf",
      href: "/collection?q=Kind+of+Blue",
    });
    expect(rows[1]).toMatchObject({
      id: "hear-explorer",
      href: "/explorer?q=Kind+of+Blue",
    });
    expect(rows[0]?.label).toContain("Kind of Blue");
  });

  it("still offers matching paths under a typed listen", () => {
    expect(paletteRows("col").map((row) => row.id)).toEqual(["hear-shelf", "hear-explorer", "collection"]);
  });

  it("opens recent pressings from the shelf", () => {
    const rows = paletteRows("", [
      { id: "rec-1", artist: "Miles Davis", title: "Kind of Blue" },
      { id: "rec-2", artist: "Alice Coltrane", title: "Journey in Satchidananda" },
    ]);

    expect(rows[0]).toMatchObject({
      id: "record:rec-1",
      href: "/collection/rec-1",
      label: "Miles Davis — Kind of Blue",
    });
    expect(rows.map((row) => row.id).slice(0, 2)).toEqual(["record:rec-1", "record:rec-2"]);
    expect(rows.map((row) => row.id).slice(2)).toEqual(PALETTE_COMMANDS.map((row) => row.id));
  });

  it("carries the list you jumped from onto a pressing", () => {
    const rows = paletteRows(
      "",
      [{ id: "rec-1", artist: "Miles Davis", title: "Kind of Blue" }],
      [],
      "/explorer?q=Nirvana",
    );

    expect(rows[0]).toMatchObject({
      id: "record:rec-1",
      href: "/collection/rec-1?from=%2Fexplorer%3Fq%3DNirvana",
    });
  });

  it("hears a typed name among recent pressings", () => {
    const rows = paletteRows("alice", [
      { id: "rec-1", artist: "Miles Davis", title: "Kind of Blue" },
      { id: "rec-2", artist: "Alice Coltrane", title: "Journey in Satchidananda" },
    ]);

    expect(rows.map((row) => row.id)).toEqual(["hear-shelf", "hear-explorer", "record:rec-2"]);
  });

  it("stays quiet about a single format", () => {
    expect(paletteRows("", [], ["vinyl"]).map((row) => row.id)).not.toContain("format:vinyl");
  });

  it("offers formats when more than one lives on the shelf", () => {
    expect(paletteRows("", [], ["vinyl", "cassette"]).map((row) => row.id)).toEqual([
      "search",
      "listen",
      "collection",
      "format:vinyl",
      "format:cassette",
      "tonight",
      "explorer",
      "profile",
      "close",
      "waiting",
      "settings",
      "keys",
    ]);
    expect(paletteRows("cassette", [], ["vinyl", "cassette"]).map((row) => row.id)).toEqual([
      "hear-shelf",
      "hear-explorer",
      "format:cassette",
    ]);
    expect(paletteRows("", [], ["vinyl", "cd"]).find((row) => row.id === "format:vinyl")?.hint).toBe("g v");
    expect(paletteRows("", [], ["vinyl", "cd"]).find((row) => row.id === "format:cd")?.hint).toBe("g d");
    expect(paletteRows("", [], ["vinyl", "cassette"]).find((row) => row.id === "format:cassette")?.hint).toBe("g a");
  });
});

describe("PALETTE_GO_HREFS", () => {
  it("keeps the g-chord paths", () => {
    expect(PALETTE_GO_HREFS).toEqual({
      c: "/collection",
      t: "/collection/tonight",
      e: "/explorer",
      p: "/profile",
      k: "/profile?tab=close",
      w: "/profile?tab=waiting",
      s: "/profile?settings=1",
    });
  });
});

describe("paletteGoHref", () => {
  it("opens a quiet path from the g chord", () => {
    expect(paletteGoHref("c")).toBe("/collection");
    expect(paletteGoHref("c", ["vinyl", "cassette"])).toBe("/collection");
    expect(paletteGoHref("k")).toBe("/profile?tab=close");
    expect(paletteGoHref("x")).toBeUndefined();
  });

  it("stays quiet about a single format", () => {
    expect(paletteGoHref("v", ["vinyl"])).toBeUndefined();
    expect(paletteGoHref("a", ["cassette"])).toBeUndefined();
  });

  it("opens a format when more than one lives on the shelf", () => {
    expect(paletteGoHref("v", ["vinyl", "cassette"])).toBe("/collection?format=vinyl");
    expect(paletteGoHref("a", ["vinyl", "cassette"])).toBe("/collection?format=cassette");
    expect(paletteGoHref("d", ["vinyl", "cd"])).toBe("/collection?format=cd");
    expect(paletteGoHref("a", ["vinyl", "cd"])).toBeUndefined();
  });

  it("restores the last listen on g c, g e, and g p", () => {
    const nav = {
      location: { pathname: "/collection/abc", search: "" },
      stored: {
        "/collection": "/collection?artist=Nirvana",
        "/explorer": "/explorer?q=Radiohead",
        "/profile": "/profile?tab=close",
      },
    };

    expect(paletteGoHref("c", [], nav)).toBe("/collection?artist=Nirvana");
    expect(paletteGoHref("e", [], nav)).toBe("/explorer?q=Radiohead");
    expect(paletteGoHref("p", [], nav)).toBe("/profile?tab=close");
    expect(paletteGoHref("k", [], nav)).toBe("/profile?tab=close");
    expect(paletteGoHref("t", [], nav)).toBe("/collection/tonight");
  });

  it("clears collection when g c is already on the list", () => {
    expect(
      paletteGoHref("c", [], {
        location: { pathname: "/collection", search: "artist=Nirvana" },
        stored: { "/collection": "/collection?artist=Nirvana" },
      }),
    ).toBe("/collection");
  });

  it("keeps a format chord on the format, even with a stored listen", () => {
    expect(
      paletteGoHref("v", ["vinyl", "cassette"], {
        location: { pathname: "/explorer", search: "" },
        stored: { "/collection": "/collection?artist=Nirvana" },
      }),
    ).toBe("/collection?format=vinyl");
  });
});

describe("paletteRows listen", () => {
  it("restores Collection, Explorer, and Profile from the last listen", () => {
    const nav = {
      location: { pathname: "/collection/abc", search: "" },
      stored: {
        "/collection": "/collection?artist=Nirvana",
        "/explorer": "/explorer?q=Radiohead",
        "/profile": "/profile?tab=close",
      },
    };
    const rows = paletteRows("", [], [], null, nav);

    expect(rows.find((row) => row.id === "collection")?.href).toBe("/collection?artist=Nirvana");
    expect(rows.find((row) => row.id === "explorer")?.href).toBe("/explorer?q=Radiohead");
    expect(rows.find((row) => row.id === "profile")?.href).toBe("/profile?tab=close");
    expect(rows.find((row) => row.id === "close")?.href).toBe("/profile?tab=close");
  });
});
