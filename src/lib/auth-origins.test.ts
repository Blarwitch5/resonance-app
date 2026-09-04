import { describe, expect, it } from "vitest";

import {
  CREDENTIAL_ACCOUNT_ISSUER,
  developmentAuthOrigins,
  resolvedAuthUrl,
  uniqueOrigins,
  vercelAuthOrigins,
} from "@/lib/auth-origins";

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

describe("resolvedAuthUrl", () => {
  it("keeps an explicit origin", () => {
    expect(
      resolvedAuthUrl({
        BETTER_AUTH_URL: "https://listen.example",
        VERCEL_URL: "resonance-app.vercel.app",
      }),
    ).toBe("https://listen.example");
  });

  it("hears the Vercel production host when the origin is unset", () => {
    expect(
      resolvedAuthUrl({
        VERCEL_ENV: "production",
        VERCEL_URL: "resonance-app-git-main.vercel.app",
        VERCEL_PROJECT_PRODUCTION_URL: "resonance-app.vercel.app",
      }),
    ).toBe("https://resonance-app.vercel.app");
  });

  it("hears the preview host on a Vercel preview", () => {
    expect(
      resolvedAuthUrl({
        VERCEL_ENV: "preview",
        VERCEL_URL: "resonance-app-git-door.vercel.app",
        VERCEL_PROJECT_PRODUCTION_URL: "resonance-app.vercel.app",
      }),
    ).toBe("https://resonance-app-git-door.vercel.app");
  });
});

describe("vercelAuthOrigins", () => {
  it("trusts production and preview hosts without doubling them", () => {
    expect(
      vercelAuthOrigins({
        VERCEL_URL: "resonance-app.vercel.app",
        VERCEL_PROJECT_PRODUCTION_URL: "resonance-app.vercel.app",
      }),
    ).toEqual(["https://resonance-app.vercel.app"]);
  });
});

describe("uniqueOrigins", () => {
  it("keeps the first voice of each origin", () => {
    expect(uniqueOrigins(["https://a.example", "https://b.example"], ["https://a.example"])).toEqual([
      "https://a.example",
      "https://b.example",
    ]);
  });
});
