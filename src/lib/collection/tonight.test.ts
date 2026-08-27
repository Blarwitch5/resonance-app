import { describe, expect, it } from "vitest";

import { tonightFromShelf } from "@/lib/collection/tonight";

const shelf = [
  { id: "open-a", isFavorite: false },
  { id: "close-b", isFavorite: true },
  { id: "close-c", isFavorite: true },
];

describe("tonightFromShelf", () => {
  it("stays quiet on an empty shelf", () => {
    expect(tonightFromShelf([], "2026-08-25")).toBeNull();
  });

  it("hears the only record waiting", () => {
    expect(tonightFromShelf([{ id: "only", isFavorite: false }], "2026-08-25")).toBe("only");
  });

  it("prefers the records kept close", () => {
    const pick = tonightFromShelf(shelf, "2026-08-25");
    expect(pick === "close-b" || pick === "close-c").toBe(true);
  });

  it("picks the same pressing on the same day", () => {
    expect(tonightFromShelf(shelf, "2026-08-25")).toBe(tonightFromShelf(shelf, "2026-08-25"));
  });

  it("does not follow the order the records arrived in", () => {
    const reversed = [...shelf].reverse();
    expect(tonightFromShelf(reversed, "2026-08-25")).toBe(tonightFromShelf(shelf, "2026-08-25"));
  });

  it("hears the whole shelf when nothing is kept close", () => {
    const open = [
      { id: "open-a", isFavorite: false },
      { id: "open-b", isFavorite: false },
    ];
    const pick = tonightFromShelf(open, "2026-08-25");
    expect(pick === "open-a" || pick === "open-b").toBe(true);
  });
});
