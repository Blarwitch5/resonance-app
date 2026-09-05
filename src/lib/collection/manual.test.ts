import { describe, expect, it } from "vitest";

import { toManualReleaseDraft } from "@/lib/collection/manual";
import { ValidationError } from "@/lib/errors";

describe("toManualReleaseDraft", () => {
  it("keeps the names you still hear", () => {
    expect(
      toManualReleaseDraft({
        artist: " Miles Davis ",
        title: " Kind of Blue ",
        format: "vinyl",
        year: "1959",
        label: " Columbia ",
        barcode: "7 20642 46071 9",
      }),
    ).toEqual({
      discogsId: null,
      format: "vinyl",
      title: "Kind of Blue",
      artist: "Miles Davis",
      year: 1959,
      label: "Columbia",
      genres: [],
      coverUrl: null,
      barcode: "720642460719",
      catalogNumber: null,
    });
  });

  it("stays quiet without a year, a label, or a barcode", () => {
    expect(
      toManualReleaseDraft({
        artist: "Unknown",
        title: "Untitled",
        format: "cassette",
        year: "  ",
        label: "",
        barcode: "n/a",
      }),
    ).toMatchObject({
      year: null,
      label: null,
      barcode: null,
    });
  });

  it("asks for an artist and a title that still fit", () => {
    expect(() => toManualReleaseDraft({ artist: "  ", title: "Blue", format: "vinyl" })).toThrow(ValidationError);
    expect(() => toManualReleaseDraft({ artist: "Miles", title: "", format: "vinyl" })).toThrow(ValidationError);
    expect(() =>
      toManualReleaseDraft({ artist: "M".repeat(201), title: "Blue", format: "vinyl" }),
    ).toThrow(ValidationError);
  });

  it("keeps a year that a pressing could have", () => {
    expect(() => toManualReleaseDraft({ artist: "Miles", title: "Blue", format: "vinyl", year: "1879" })).toThrow(
      ValidationError,
    );
    expect(() => toManualReleaseDraft({ artist: "Miles", title: "Blue", format: "vinyl", year: "soon" })).toThrow(
      ValidationError,
    );
  });

  it("refuses a label that cannot sit on the sleeve", () => {
    expect(() =>
      toManualReleaseDraft({
        artist: "Miles",
        title: "Blue",
        format: "vinyl",
        label: "L".repeat(121),
      }),
    ).toThrow(ValidationError);
  });

  it("refuses a barcode that cannot sit on the sleeve", () => {
    expect(() =>
      toManualReleaseDraft({
        artist: "Miles",
        title: "Blue",
        format: "vinyl",
        barcode: "1".repeat(65),
      }),
    ).toThrow(ValidationError);
  });
});
