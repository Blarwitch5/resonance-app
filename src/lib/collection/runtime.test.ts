import { describe, expect, it } from "vitest";

import { pressingListen, pressingRuntime, sideRuntime } from "@/lib/collection/runtime";
import type { RecordSide } from "@/lib/collection/types";

function sides(tracks: Array<{ duration: string | null }>): RecordSide[] {
  return [
    {
      heading: "Side A",
      tracks: tracks.map((track, index) => ({
        position: `A${index + 1}`,
        title: `Track ${index + 1}`,
        duration: track.duration,
        previewUrl: null,
      })),
    },
  ];
}

describe("pressingRuntime", () => {
  it("names how long the pressing runs", () => {
    expect(pressingRuntime(sides([{ duration: "9:22" }, { duration: "9:46" }]))).toBe(
      "This pressing runs 19 minutes.",
    );
  });

  it("keeps seconds when the side is short", () => {
    expect(pressingRuntime(sides([{ duration: "0:45" }]))).toBe("This pressing runs 45 seconds.");
  });

  it("speaks hours on a long listen", () => {
    expect(pressingRuntime(sides([{ duration: "1:02:03" }]))).toBe("This pressing runs 1 hour 2 minutes.");
  });

  it("stays quiet without a complete runtime", () => {
    expect(pressingRuntime([])).toBeNull();
    expect(pressingRuntime(sides([{ duration: "9:22" }, { duration: null }]))).toBeNull();
    expect(pressingRuntime(sides([{ duration: "forever" }]))).toBeNull();
  });
});

describe("sideRuntime", () => {
  it("names how long one face runs", () => {
    expect(sideRuntime(sides([{ duration: "9:22" }, { duration: "9:46" }])[0])).toBe("19 minutes");
  });

  it("stays quiet without a complete face", () => {
    expect(sideRuntime(sides([{ duration: "9:22" }, { duration: null }])[0])).toBeNull();
  });
});

describe("pressingListen", () => {
  it("holds the tracks and the time in one breath", () => {
    expect(pressingListen(sides([{ duration: "9:22" }, { duration: "9:46" }]))).toBe(
      "This pressing holds 2 tracks and runs 19 minutes.",
    );
    expect(pressingListen(sides([{ duration: "0:45" }]))).toBe(
      "This pressing holds 1 track and runs 45 seconds.",
    );
  });

  it("still names the tracks when time is missing", () => {
    expect(pressingListen(sides([{ duration: "9:22" }, { duration: null }]))).toBe(
      "This pressing holds 2 tracks.",
    );
  });

  it("stays quiet without faces", () => {
    expect(pressingListen([])).toBeNull();
  });
});
