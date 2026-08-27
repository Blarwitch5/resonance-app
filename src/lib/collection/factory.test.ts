import { describe, expect, it } from "vitest";

import { createCollectionItem } from "@/lib/collection/factory";
import type { ReleaseDraft } from "@/lib/collection/types";
import { ValidationError } from "@/lib/errors";

const draft: ReleaseDraft = {
  discogsId: 12345,
  format: "vinyl",
  title: " Kind of Blue ",
  artist: " Miles Davis ",
  year: 1959,
  label: " Columbia ",
  genres: ["Jazz"],
  coverUrl: null,
  barcode: null,
  catalogNumber: null,
};

describe("createCollectionItem", () => {
  it("trims the pressing and keeps it owned", () => {
    const item = createCollectionItem({ draft, kind: "owned" });

    expect(item.title).toBe("Kind of Blue");
    expect(item.artist).toBe("Miles Davis");
    expect(item.label).toBe("Columbia");
    expect(item.isFavorite).toBe(false);
    expect(item.isWishlist).toBe(false);
  });

  it("keeps a catalog number the pressing still carries", () => {
    expect(
      createCollectionItem({ draft: { ...draft, catalogNumber: " GEF 24536 " }, kind: "owned" })
        .catalogNumber,
    ).toBe("GEF 24536");
  });

  it("marks a favorite and a wishlist", () => {
    expect(createCollectionItem({ draft, kind: "favorite" }).isFavorite).toBe(true);
    expect(createCollectionItem({ draft, kind: "wishlist" }).isWishlist).toBe(true);
  });

  it("asks for both an artist and a title", () => {
    expect(() => createCollectionItem({ draft: { ...draft, title: "   " }, kind: "owned" })).toThrow(
      ValidationError,
    );
    expect(() => createCollectionItem({ draft: { ...draft, artist: "" }, kind: "owned" })).toThrow(
      ValidationError,
    );
  });
});
