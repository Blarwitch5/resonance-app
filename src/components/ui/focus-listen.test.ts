import { describe, expect, it } from "vitest";

import { LISTEN_FIELD_IDS, pickListenFieldId } from "@/components/ui/focus-listen";

describe("pickListenFieldId", () => {
  it("hears the desktop genre field when it is on the shelf", () => {
    expect(
      pickListenFieldId([
        { id: "explorer-sheet-genre", isVisible: true },
        { id: "explorer-desk-genre", isVisible: true },
      ]),
    ).toBe("explorer-desk-genre");
  });

  it("falls to the sheet field when the desk is quiet", () => {
    expect(
      pickListenFieldId([
        { id: "explorer-desk-genre", isVisible: false },
        { id: "explorer-sheet-genre", isVisible: true },
      ]),
    ).toBe("explorer-sheet-genre");
  });

  it("stays quiet without a listen field to hear", () => {
    expect(pickListenFieldId([{ id: "explorer-desk-genre", isVisible: false }])).toBeUndefined();
    expect(LISTEN_FIELD_IDS).toEqual(["explorer-desk-genre", "explorer-sheet-genre"]);
  });
});
