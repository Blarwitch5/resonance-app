import { describe, expect, it } from "vitest";

import { localeFromCookie } from "@/lib/i18n/cookie";

describe("localeFromCookie", () => {
  it("hears French from the resonance cookie and stays English otherwise", () => {
    expect(localeFromCookie("resonance-locale=fr")).toBe("fr");
    expect(localeFromCookie("theme=dark; resonance-locale=fr")).toBe("fr");
    expect(localeFromCookie("resonance-locale=en")).toBe("en");
    expect(localeFromCookie(undefined)).toBe("en");
    expect(localeFromCookie("resonance-locale=de")).toBe("en");
    expect(localeFromCookie("other=fr")).toBe("en");
  });
});
