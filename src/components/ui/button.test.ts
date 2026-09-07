import { describe, expect, it } from "vitest";

import { buttonVariantClass } from "@/components/ui/button";

describe("buttonVariantClass", () => {
  it("keeps a destructive confirm in error paint", () => {
    expect(buttonVariantClass("danger")).toContain("bg-error");
    expect(buttonVariantClass("danger")).toContain("text-on-error");
  });

  it("keeps primary and ghost distinct", () => {
    expect(buttonVariantClass("primary")).toContain("bg-primary");
    expect(buttonVariantClass("ghost")).toContain("bg-transparent");
    expect(buttonVariantClass("ghost")).not.toContain("bg-error");
  });
});
