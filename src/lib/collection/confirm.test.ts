import { describe, expect, it } from "vitest";

import {
  confirmFormats,
  confirmInitialFormat,
  confirmOwnedCopy,
  confirmWaitingCopy,
  type ShelfCopy,
} from "@/lib/collection/confirm";

const ownedVinyl: ShelfCopy = { id: "own-1", format: "vinyl", isWishlist: false };
const waitingCassette: ShelfCopy = { id: "wait-1", format: "cassette", isWishlist: true };

describe("confirmFormats", () => {
  it("keeps every enabled format when the pressing is absent", () => {
    expect(confirmFormats(["vinyl", "cd"], [])).toEqual(["vinyl", "cd"]);
  });

  it("releases formats already on the shelf or waiting", () => {
    expect(confirmFormats(["vinyl", "cassette", "cd"], [ownedVinyl, waitingCassette])).toEqual(["cd"]);
  });
});

describe("confirmOwnedCopy", () => {
  it("opens the copy that already lives on the shelf", () => {
    expect(confirmOwnedCopy([waitingCassette, ownedVinyl])).toEqual(ownedVinyl);
    expect(confirmOwnedCopy([waitingCassette])).toBeUndefined();
  });
});

describe("confirmWaitingCopy", () => {
  it("hears the copy still waiting", () => {
    expect(confirmWaitingCopy([ownedVinyl, waitingCassette])).toEqual(waitingCassette);
    expect(confirmWaitingCopy([ownedVinyl])).toBeUndefined();
  });
});

describe("confirmInitialFormat", () => {
  it("keeps the pressing format when it still has a place", () => {
    expect(confirmInitialFormat(["vinyl", "cd"], "cd", "vinyl")).toBe("cd");
  });

  it("follows the format that leads when the sleeve is already home", () => {
    expect(confirmInitialFormat(["vinyl", "cassette"], "cd", "cassette")).toBe("cassette");
  });

  it("falls to the first remaining format when the lead is gone too", () => {
    expect(confirmInitialFormat(["cd"], "vinyl", "cassette")).toBe("cd");
    expect(confirmInitialFormat([], "vinyl", "vinyl")).toBeUndefined();
  });
});
