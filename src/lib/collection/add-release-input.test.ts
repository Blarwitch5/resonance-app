import { describe, expect, it } from "vitest";

import { parseAddReleaseInput } from "@/lib/collection/add-release-input";

describe("parseAddReleaseInput", () => {
  it("reads a Discogs id sent as a string", () => {
    expect(
      parseAddReleaseInput({
        discogsId: "249504",
        format: "vinyl",
        kind: "owned",
        notes: "heard tonight",
      }),
    ).toEqual({
      discogsId: 249504,
      format: "vinyl",
      kind: "owned",
      notes: "heard tonight",
    });
  });

  it("keeps the shelf when kind is omitted", () => {
    expect(
      parseAddReleaseInput({
        discogsId: 249504,
        format: "cd",
        kind: "",
      }),
    ).toEqual({
      discogsId: 249504,
      format: "cd",
      kind: "owned",
      notes: "",
    });
  });

  it("rejects a missing format or id", () => {
    expect(parseAddReleaseInput({ discogsId: "249504", format: null, kind: "owned" })).toBeNull();
    expect(parseAddReleaseInput({ discogsId: "", format: "vinyl", kind: "owned" })).toBeNull();
  });
});
