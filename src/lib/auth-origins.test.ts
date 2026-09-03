import { describe, expect, it } from "vitest";

import { CREDENTIAL_ACCOUNT_ISSUER, developmentAuthOrigins } from "@/lib/auth-origins";

describe("developmentAuthOrigins", () => {
  it("names the local credential issuer Better Auth expects", () => {
    expect(CREDENTIAL_ACCOUNT_ISSUER).toBe("local:credential");
  });

  it("trusts both 3000 and 3001 on localhost and the loopback", () => {
    expect(developmentAuthOrigins()).toEqual([
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3001",
    ]);
  });
});
