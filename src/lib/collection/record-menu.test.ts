import { describe, expect, it } from "vitest";

import {
  clampMenuPosition,
  explorerMenuActions,
  recordMenuActions,
  recordMenuElsewhereHref,
  recordMenuReleaseConfirm,
  recordMenuReleasePrompt,
} from "@/lib/collection/record-menu";

describe("recordMenuActions", () => {
  it("opens the journal and lets a record stay close", () => {
    expect(
      recordMenuActions({
        title: "In Utero",
        isFavorite: false,
        canKeepClose: true,
      }),
    ).toEqual([
      { id: "open", label: "Open In Utero in your journal" },
      { id: "keep", label: "Keep this close" },
    ]);
  });

  it("lets go of a record already kept close", () => {
    expect(
      recordMenuActions({
        title: "OK Computer",
        isFavorite: true,
        canKeepClose: true,
      }).find((action) => action.id === "keep")?.label,
    ).toBe("Stop keeping this close");
  });

  it("skips keep-close when the record is only waiting", () => {
    expect(
      recordMenuActions({
        title: "In Utero",
        isFavorite: false,
        canKeepClose: false,
        elsewhereHref: "/explorer?q=Nirvana+In+Utero",
      }).map((action) => action.id),
    ).toEqual(["open", "elsewhere"]);
  });

  it("hears other pressings when a thread is waiting", () => {
    expect(
      recordMenuActions({
        title: "In Utero",
        isFavorite: false,
        canKeepClose: true,
        elsewhereHref: "/explorer?q=Nirvana+In+Utero",
      }).at(-1),
    ).toEqual({
      id: "elsewhere",
      label: "Hear other pressings of In Utero",
    });
  });

  it("shares a pressing that can travel", () => {
    expect(
      recordMenuActions({
        title: "In Utero",
        isFavorite: false,
        canKeepClose: true,
        shareHref: "https://www.discogs.com/release/2313422",
        elsewhereHref: "/explorer?q=Nirvana+In+Utero",
      }).map((action) => action.id),
    ).toEqual(["open", "keep", "share", "elsewhere"]);
    expect(
      recordMenuActions({
        title: "In Utero",
        isFavorite: false,
        shareHref: "https://www.discogs.com/release/2313422",
      }).find((action) => action.id === "share")?.label,
    ).toBe("Share In Utero");
  });

  it("stays quiet about a pressing without a Discogs thread", () => {
    expect(
      recordMenuActions({
        title: "Home tape",
        isFavorite: false,
        canKeepClose: true,
      }).map((action) => action.id),
    ).toEqual(["open", "keep"]);
  });

  it("threads a pressing into Explorer", () => {
    expect(recordMenuElsewhereHref("Nirvana", "In Utero", "vinyl")).toBe(
      "/explorer?q=Nirvana+In+Utero&format=vinyl",
    );
    expect(recordMenuElsewhereHref("  ", "  ")).toBeNull();
  });

  it("stays quiet when Explorer is already on that pressing", () => {
    expect(recordMenuElsewhereHref("Nirvana", "In Utero", "vinyl", "Nirvana In Utero")).toBeNull();
    expect(recordMenuElsewhereHref("Nirvana", "In Utero", "vinyl", "kind of blue")).toBe(
      "/explorer?q=Nirvana+In+Utero&format=vinyl",
    );
  });

  it("copies a barcode or catalog the pressing still carries", () => {
    expect(
      recordMenuActions({
        title: "In Utero",
        isFavorite: false,
        canKeepClose: true,
        barcode: "07464405791",
        catalogNumber: "GEF 24536",
      }).map((action) => action.id),
    ).toEqual(["open", "keep", "copy-catalog", "copy-barcode"]);
    expect(
      recordMenuActions({
        title: "In Utero",
        isFavorite: false,
        canKeepClose: true,
        barcode: "07464405791",
      }).find((action) => action.id === "copy-barcode"),
    ).toEqual({
      id: "copy-barcode",
      label: "Copy barcode",
      value: "07464405791",
    });
  });

  it("stays quiet about a blank barcode or catalog", () => {
    expect(
      recordMenuActions({
        title: "In Utero",
        isFavorite: false,
        canKeepClose: true,
        barcode: "  ",
        catalogNumber: "",
      }).map((action) => action.id),
    ).toEqual(["open", "keep"]);
  });

  it("lets a record leave the shelf last", () => {
    expect(
      recordMenuActions({
        title: "In Utero",
        isFavorite: true,
        canKeepClose: true,
        shareHref: "https://www.discogs.com/release/2313422",
        canRelease: true,
      }).map((action) => action.id),
    ).toEqual(["open", "keep", "share", "release"]);
    expect(
      recordMenuActions({
        title: "In Utero",
        isFavorite: false,
        canRelease: true,
      }).find((action) => action.id === "release"),
    ).toEqual({
      id: "release",
      label: "Let this one go",
    });
  });
});

describe("recordMenuReleaseConfirm", () => {
  it("asks to keep the pressing before it leaves", () => {
    expect(recordMenuReleasePrompt("In Utero")).toBe(
      "In Utero will leave your shelf. The memory goes with it.",
    );
    expect(recordMenuReleaseConfirm()).toEqual([
      { id: "keep-shelf", label: "Keep it" },
      { id: "confirm-release", label: "Release" },
    ]);
  });
});

describe("explorerMenuActions", () => {
  it("adds a pressing that has not found the shelf", () => {
    expect(
      explorerMenuActions({
        title: "In Utero",
        presence: { status: "absent" },
        addHref: "/explorer/add/2313422",
        canHold: true,
        elsewhereHref: "/explorer?q=Nirvana+In+Utero",
      }).map((action) => action.id),
    ).toEqual(["add", "hold", "elsewhere"]);
  });

  it("skips holding when the room is unsigned", () => {
    expect(
      explorerMenuActions({
        title: "In Utero",
        presence: { status: "absent" },
        addHref: "/explorer/add/2313422",
        canHold: false,
      }).map((action) => action.id),
    ).toEqual(["add"]);
  });

  it("opens a pressing already on the shelf", () => {
    expect(
      explorerMenuActions({
        title: "In Utero",
        presence: { status: "owned", itemId: "rec-1" },
        elsewhereHref: "/explorer?q=Nirvana+In+Utero",
      }),
    ).toEqual([
      { id: "open", label: "Open In Utero in your journal" },
      { id: "elsewhere", label: "Hear other pressings of In Utero" },
    ]);
  });

  it("shares a pressing still beyond the shelf", () => {
    expect(
      explorerMenuActions({
        title: "In Utero",
        presence: { status: "absent" },
        addHref: "/explorer/add/2313422",
        shareHref: "https://www.discogs.com/release/2313422",
      }).map((action) => action.id),
    ).toEqual(["add", "share"]);
  });

  it("moves a waiting pressing onto the shelf", () => {
    expect(
      explorerMenuActions({
        title: "OK Computer",
        presence: { status: "wishlist", itemId: "rec-2" },
        elsewhereHref: "/explorer?q=Radiohead+OK+Computer",
      }).map((action) => action.id),
    ).toEqual(["open", "shelf", "elsewhere"]);
  });

  it("copies a barcode still beyond the shelf", () => {
    expect(
      explorerMenuActions({
        title: "In Utero",
        presence: { status: "absent" },
        addHref: "/explorer/add/2313422",
        barcode: "7 20642 46071 9",
      }).map((action) => action.id),
    ).toEqual(["add", "copy-barcode"]);
  });

  it("stays quiet when nothing can be done", () => {
    expect(
      explorerMenuActions({
        title: "Untitled",
        presence: { status: "absent" },
      }),
    ).toEqual([]);
  });
});

describe("clampMenuPosition", () => {
  it("keeps the menu inside the desk", () => {
    expect(
      clampMenuPosition(1200, 700, { width: 240, height: 160 }, { width: 1280, height: 800 }),
    ).toEqual({ left: 1032, top: 632 });
  });

  it("stays where the click landed when there is room", () => {
    expect(
      clampMenuPosition(80, 90, { width: 240, height: 160 }, { width: 1280, height: 800 }),
    ).toEqual({ left: 80, top: 90 });
  });
});
