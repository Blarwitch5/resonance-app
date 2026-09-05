import { describe, expect, it } from "vitest";

import { controlInsetClass } from "@/components/ui/control";

describe("controlInsetClass", () => {
  it("keeps desktop padding beside a leading icon", () => {
    expect(controlInsetClass({ leading: true })).toBe("pl-10 sm:pl-11 pr-3 sm:pr-4");
    expect(controlInsetClass({ leading: "search" })).toBe("pl-11 sm:pl-12 pr-3 sm:pr-4");
  });

  it("keeps desktop padding beside a trailing control", () => {
    expect(controlInsetClass({ trailing: true })).toBe("pl-3 sm:pl-4 pr-12");
    expect(controlInsetClass({ leading: true, trailing: true })).toBe("pl-10 sm:pl-11 pr-12");
  });
});
