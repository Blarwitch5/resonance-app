import { describe, expect, it } from "vitest";

import { resetPasswordMailHref } from "@/lib/mail/reset-href";

describe("resetPasswordMailHref", () => {
  it("opens the auth door, not a stray path", () => {
    expect(resetPasswordMailHref("https://resonance.app/", "token-1")).toBe(
      "https://resonance.app/api/auth/reset-password/token-1?callbackURL=%2Freset-password",
    );
  });
});
