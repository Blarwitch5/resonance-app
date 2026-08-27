import { describe, expect, it } from "vitest";

import { isBarcodeQuery, normalizeBarcode } from "@/lib/discogs/barcode";

describe("normalizeBarcode", () => {
  it("keeps digits only", () => {
    expect(normalizeBarcode("0 7464-40579-1")).toBe("07464405791");
    expect(normalizeBarcode("EAN 12-345")).toBe("12345");
  });
});

describe("isBarcodeQuery", () => {
  it("accepts EAN 8 and 12–14 digits", () => {
    expect(isBarcodeQuery("12345678")).toBe(true);
    expect(isBarcodeQuery("123456789012")).toBe(true);
    expect(isBarcodeQuery("12345678901234")).toBe(true);
    expect(isBarcodeQuery("12 345 678")).toBe(true);
  });

  it("rejects titles and the wrong length", () => {
    expect(isBarcodeQuery("Kind of Blue")).toBe(false);
    expect(isBarcodeQuery("1234567")).toBe(false);
    expect(isBarcodeQuery("12345678901")).toBe(false);
    expect(isBarcodeQuery("123456789012345")).toBe(false);
  });
});
