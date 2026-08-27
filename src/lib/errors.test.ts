import { describe, expect, it } from "vitest";

import { DiscogsError, toErrorMessage, ValidationError } from "@/lib/errors";

describe("toErrorMessage", () => {
  it("keeps a human AppError message", () => {
    expect(toErrorMessage(new ValidationError("Choose list or grid."))).toBe("Choose list or grid.");
    expect(toErrorMessage(new DiscogsError("Discogs asked us to wait."))).toBe("Discogs asked us to wait.");
  });

  it("does not leak an unknown failure as a stack", () => {
    expect(toErrorMessage("nope")).toBe("Something went wrong. Please try again.");
    expect(toErrorMessage(new Error("ECONNRESET"))).toBe("ECONNRESET");
  });
});
