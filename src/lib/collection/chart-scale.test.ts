import { describe, expect, it } from "vitest";

import { chartMarks, chartShare } from "@/lib/collection/chart-scale";

describe("chartShare", () => {
  it("returns nothing without a peak", () => {
    expect(chartShare(3, 0)).toBe(0);
    expect(chartShare(0, 10)).toBe(0);
  });

  it("fills the peak and keeps a quiet count visible", () => {
    expect(chartShare(10, 10)).toBe(100);
    expect(chartShare(1, 20)).toBe(8);
    expect(chartShare(1, 20, 4)).toBe(5);
  });
});

describe("chartMarks", () => {
  it("returns nothing without a peak", () => {
    expect(chartMarks(3, 0)).toBe(0);
    expect(chartMarks(0, 10)).toBe(0);
  });

  it("keeps one disc per record until the row would overflow", () => {
    expect(chartMarks(2, 2)).toBe(2);
    expect(chartMarks(1, 2)).toBe(1);
    expect(chartMarks(12, 12)).toBe(12);
    expect(chartMarks(6, 12)).toBe(6);
    expect(chartMarks(20, 20)).toBe(12);
    expect(chartMarks(10, 20)).toBe(6);
    expect(chartMarks(1, 20)).toBe(1);
  });
});
