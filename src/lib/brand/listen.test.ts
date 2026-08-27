import { describe, expect, it } from "vitest";

import {
  LISTENING_TRAIL,
  LISTENING_TRAIL_LEFT,
  LISTENING_TRAIL_TOP,
  listeningTrailDelayMs,
} from "@/lib/brand/listen";

describe("listening trail", () => {
  it("starts on the mark's last point, then two more beats to the right", () => {
    expect(LISTENING_TRAIL).toEqual([0, 1, 2]);
    expect(LISTENING_TRAIL_LEFT).toEqual(["88.62%", "100.42%", "112.22%"]);
    expect(LISTENING_TRAIL_TOP).toBe("48.09%");
  });

  it("staggers the beats so the sound travels outward", () => {
    expect(LISTENING_TRAIL.map(listeningTrailDelayMs)).toEqual([0, 220, 440]);
  });
});
