import { describe, expect, it } from "vitest";

import { collectionHref } from "@/lib/collection/href";
import { isSearchListening, listenFromSearchInput, SHELF_SEARCH_DEBOUNCE_MS } from "@/lib/collection/search";

describe("listenFromSearchInput", () => {
  it("starts the typed listen from the first row", () => {
    expect(
      collectionHref(
        listenFromSearchInput({ format: "vinyl", page: 2, query: "old", sort: "artist" }, "  Kind of Blue  "),
      ),
    ).toBe("/collection?format=vinyl&q=Kind+of+Blue&sort=artist");
  });

  it("clears the typed listen and keeps the other threads", () => {
    expect(collectionHref(listenFromSearchInput({ query: "Blue", keptClose: true }, "   "))).toBe(
      "/collection?kept=1",
    );
  });
});

describe("SHELF_SEARCH_DEBOUNCE_MS", () => {
  it("waits a breath, not a beat", () => {
    expect(SHELF_SEARCH_DEBOUNCE_MS).toBe(300);
  });
});

describe("isSearchListening", () => {
  it("lights as soon as the typed listen leaves the committed one", () => {
    expect(isSearchListening("Blue", "Blue", false)).toBe(false);
    expect(isSearchListening("Blues", "Blue", false)).toBe(true);
    expect(isSearchListening("Blue", "Blue", true)).toBe(true);
  });
});
