import { describe, expect, it } from "vitest";

import {
  LISTEN_CONTROL_IDS,
  LISTEN_FIELD_IDS,
  pickListenControlId,
  pickListenFieldId,
  pickListenTarget,
} from "@/components/ui/focus-listen";

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

describe("pickListenTarget", () => {
  it("prefers a genre field over the collection row", () => {
    expect(
      pickListenTarget({
        fields: [{ id: "explorer-desk-genre", isVisible: true }],
        controls: [{ id: "collection-listen", isVisible: true }],
      }),
    ).toEqual({ kind: "field", id: "explorer-desk-genre" });
  });

  it("falls to the collection listen row when Explorer is quiet", () => {
    expect(LISTEN_CONTROL_IDS).toEqual(["collection-listen"]);
    expect(pickListenControlId([{ id: "collection-listen", isVisible: true }])).toBe("collection-listen");
    expect(
      pickListenTarget({
        fields: [{ id: "explorer-desk-genre", isVisible: false }],
        controls: [{ id: "collection-listen", isVisible: true }],
      }),
    ).toEqual({ kind: "control", id: "collection-listen" });
  });

  it("stays quiet without a listen to shape", () => {
    expect(
      pickListenTarget({
        fields: [{ id: "explorer-desk-genre", isVisible: false }],
        controls: [{ id: "collection-listen", isVisible: false }],
      }),
    ).toBeUndefined();
  });
});
