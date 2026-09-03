import { describe, expect, it } from "vitest";

import {
  bodyClass,
  displayTitleClass,
  eyebrowClass,
  hintClass,
  kickerClass,
  metaClass,
  pageTitleClass,
  recordTitleClass,
  sectionTitleClass,
} from "@/components/ui/type";

describe("type rhythm", () => {
  it("keeps titles, body, and meta on one scale", () => {
    expect(eyebrowClass).toContain("tracking-[0.28em]");
    expect(displayTitleClass).toContain("text-3xl");
    expect(pageTitleClass).toContain("text-2xl");
    expect(pageTitleClass).toContain("standalone:text-xl");
    expect(sectionTitleClass).toContain("text-lg");
    expect(recordTitleClass).toContain("text-sm");
    expect(bodyClass).toContain("leading-6");
    expect(metaClass).toContain("text-xs");
    expect(hintClass).toContain("text-tertiary");
    expect(kickerClass).toContain("uppercase");
  });
});
