import { describe, expect, it } from "vitest";

import { keptCloseCoverRevealClass } from "@/components/ui/kept-close";

describe("keptCloseCoverRevealClass", () => {
  it("keeps a close heart in sight", () => {
    expect(keptCloseCoverRevealClass(true)).not.toContain("lg:opacity-0");
  });

  it("lets the desk reveal a quiet heart", () => {
    const className = keptCloseCoverRevealClass(false);
    expect(className).toContain("lg:opacity-0");
    expect(className).toContain("lg:pointer-events-none");
    expect(className).toContain("lg:group-hover:opacity-100");
    expect(className).toContain("lg:group-hover:pointer-events-auto");
    expect(className).toContain("lg:group-focus-within:opacity-100");
    expect(className).toContain("lg:group-focus-within:pointer-events-auto");
  });
});
