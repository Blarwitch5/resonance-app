import { describe, expect, it } from "vitest";

import { shelfListHitClass, shelfResultsClass } from "@/lib/collection/layout";
import {
  DEFAULT_USER_SETTINGS,
  enabledFormats,
  parseLocale,
  parseThemePreference,
  parseViewMode,
  preferredFormat,
} from "@/lib/settings/types";

describe("enabledFormats", () => {
  it("lists the formats that stay on", () => {
    expect(
      enabledFormats({
        ...DEFAULT_USER_SETTINGS,
        cassetteEnabled: false,
      }),
    ).toEqual(["vinyl", "cd"]);
  });

  it("falls back to vinyl when every format is off", () => {
    expect(
      enabledFormats({
        ...DEFAULT_USER_SETTINGS,
        vinylEnabled: false,
        cassetteEnabled: false,
        cdEnabled: false,
      }),
    ).toEqual(["vinyl"]);
  });
});

describe("preferredFormat", () => {
  it("keeps the stored format when it still lives on the shelf", () => {
    expect(preferredFormat(["vinyl", "cassette"], "cassette")).toBe("cassette");
    expect(preferredFormat(["vinyl", "cd"], "vinyl")).toBe("vinyl");
  });

  it("falls back when the stored format has been released", () => {
    expect(preferredFormat(["vinyl", "cd"], "cassette")).toBe("vinyl");
    expect(preferredFormat(["cd"], null)).toBe("cd");
    expect(preferredFormat(["cassette", "cd"], undefined)).toBe("cassette");
  });
});

describe("parseThemePreference and parseViewMode", () => {
  it("accepts known values only", () => {
    expect(parseThemePreference("dark")).toBe("dark");
    expect(parseThemePreference("system")).toBeUndefined();
    expect(parseViewMode("grid")).toBe("grid");
    expect(parseViewMode("masonry")).toBeUndefined();
  });
});

describe("parseLocale", () => {
  it("keeps English and French, and lets the rest go", () => {
    expect(parseLocale("en")).toBe("en");
    expect(parseLocale("fr")).toBe("fr");
    expect(parseLocale("de")).toBeUndefined();
    expect(parseLocale("EN")).toBeUndefined();
    expect(parseLocale(undefined)).toBeUndefined();
  });
});

describe("DEFAULT_USER_SETTINGS", () => {
  it("speaks English and stays quiet about the market", () => {
    expect(DEFAULT_USER_SETTINGS.locale).toBe("en");
    expect(DEFAULT_USER_SETTINGS.marketValueEnabled).toBe(false);
  });
});

describe("shelfResultsClass", () => {
  it("keeps a list a list, even on a wide desk", () => {
    expect(shelfResultsClass("list")).toContain("flex-col");
    expect(shelfResultsClass("list")).toContain("-mx-4");
    expect(shelfResultsClass("list")).not.toContain("divide-y");
    expect(shelfResultsClass("list")).not.toContain("grid-cols");
  });

  it("opens covers in a grid when invited", () => {
    expect(shelfResultsClass("grid")).toContain("grid");
    expect(shelfResultsClass("grid")).toContain("grid-cols-2");
  });
});

describe("shelfListHitClass", () => {
  it("keeps list hover inset from the fill, aligned with the page", () => {
    expect(shelfListHitClass).toContain("px-4");
    expect(shelfListHitClass).toContain("hover:bg-surface-pressed");
  });
});
