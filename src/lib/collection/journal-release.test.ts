import { describe, expect, it } from "vitest";

import { journalReleaseTriggerClass } from "@/lib/collection/journal-release";

describe("journalReleaseTriggerClass", () => {
  it("keeps a compact error control beside Save", () => {
    const className = journalReleaseTriggerClass();
    expect(className).toContain("size-11");
    expect(className).toContain("text-error");
    expect(className).toContain("hover:text-error");
    expect(className).toContain("hover:bg-error-soft");
    expect(className).toContain("cursor-pointer");
  });
});
