import { describe, expect, it } from "vitest";

import {
  LISTENING_SIDES,
  LISTENING_TRAIL_TOP,
  listeningTrailDelayMs,
  listeningTrailFill,
  listeningTrailIndexes,
  listeningTrailLeft,
} from "@/lib/brand/listen";

describe("listening trail", () => {
  it("keeps the mark's right point, and only the outer beats on the left", () => {
    expect(LISTENING_SIDES).toEqual(["left", "right"]);
    expect(listeningTrailIndexes("right")).toEqual([0, 1, 2]);
    expect(listeningTrailIndexes("right").map((index) => listeningTrailLeft("right", index))).toEqual([
      "88.62%",
      "100.42%",
      "112.22%",
    ]);
    expect(listeningTrailIndexes("left")).toEqual([1, 2]);
    expect(listeningTrailIndexes("left").map((index) => listeningTrailLeft("left", index))).toEqual([
      "-0.42%",
      "-12.22%",
    ]);
    expect(LISTENING_TRAIL_TOP).toBe("48.09%");
  });

  it("lets the left beats take the violet of that side", () => {
    expect(listeningTrailFill("left")).toBe("bg-primary");
    expect(listeningTrailFill("right")).toBe("bg-primary");
  });

  it("staggers the beats so the sound travels outward", () => {
    expect([0, 1, 2].map(listeningTrailDelayMs)).toEqual([0, 220, 440]);
  });
});
