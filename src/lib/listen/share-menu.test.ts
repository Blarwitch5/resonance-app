import { describe, expect, it } from "vitest";

import { explorerMenuActions, recordMenuActions } from "@/lib/collection/record-menu";

describe("recordMenuActions share", () => {
  it("offers share when a collection item can travel on Resonance", () => {
    const actions = recordMenuActions({
      title: "In Utero",
      isFavorite: false,
      shareItemId: "11111111-1111-1111-1111-111111111111",
    });

    expect(actions.some((action) => action.id === "share")).toBe(true);
  });

  it("offers share for a direct listen href", () => {
    const actions = explorerMenuActions({
      title: "In Utero",
      presence: { status: "absent" },
      shareHref: "/listen/d/2313422",
      addHref: "/explorer/add/2313422",
    });

    expect(actions.some((action) => action.id === "share")).toBe(true);
  });
});
