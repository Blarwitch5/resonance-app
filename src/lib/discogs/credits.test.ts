import { describe, expect, it } from "vitest";

import { pressingCreditLine, toPressingCredits } from "@/lib/discogs/credits";

describe("toPressingCredits", () => {
  it("hears who produced, recorded, mixed, and mastered — not artwork", () => {
    expect(
      toPressingCredits([
        { name: "Steve Albini", role: "Producer, Recorded By" },
        { name: "Scott Litt", role: "Mixed By" },
        { name: "Bob Ludwig", role: "Mastered By" },
        { name: "Robert Fisher", role: "Artwork, Design" },
      ]),
    ).toEqual([
      { name: "Steve Albini", verbs: ["Produced", "Recorded"] },
      { name: "Scott Litt", verbs: ["Mixed"] },
      { name: "Bob Ludwig", verbs: ["Mastered"] },
    ]);
  });

  it("keeps three names at most, and drops empty ones", () => {
    expect(
      toPressingCredits([
        { name: "  ", role: "Producer" },
        { name: "A", role: "Producer" },
        { name: "B (2)", role: "Mixed By" },
        { name: "C", role: "Mastered By" },
        { name: "D", role: "Recorded By" },
      ]),
    ).toEqual([
      { name: "A", verbs: ["Produced"] },
      { name: "B", verbs: ["Mixed"] },
      { name: "C", verbs: ["Mastered"] },
    ]);
  });
});

describe("pressingCreditLine", () => {
  it("speaks in one quiet sentence", () => {
    expect(
      pressingCreditLine([
        { name: "Steve Albini", role: "Producer, Recorded By" },
        { name: "Scott Litt", role: "Mixed By" },
      ]),
    ).toBe("Produced and recorded by Steve Albini · Mixed by Scott Litt");
  });

  it("stays quiet without a listen", () => {
    expect(pressingCreditLine([])).toBeNull();
    expect(pressingCreditLine([{ name: "Someone", role: "Artwork" }])).toBeNull();
  });
});
