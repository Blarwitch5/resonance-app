import { describe, expect, it } from "vitest";

import {
  initialsFromName,
  isProfileNavActive,
  parseDisplayName,
  parsePortraitUrl,
  parseProfileTab,
  parseSettingsFlag,
  profileEngagement,
  profileFromSearchInput,
  profileHref,
  profileNavHref,
  profileNavHrefForPath,
} from "@/lib/profile/types";

describe("parseProfileTab", () => {
  it("keeps a known tab", () => {
    expect(parseProfileTab("close")).toBe("close");
    expect(parseProfileTab("waiting")).toBe("waiting");
    expect(parseProfileTab("settings")).toBe("resonance");
    expect(parseProfileTab("resonance")).toBe("resonance");
  });

  it("opens kept close when a search is in the air", () => {
    expect(parseProfileTab(undefined)).toBe("resonance");
    expect(parseProfileTab(undefined, true)).toBe("close");
    expect(parseProfileTab("nope", true)).toBe("close");
  });
});

describe("profileHref", () => {
  it("stays on the profile root for resonance", () => {
    expect(profileHref()).toBe("/profile");
    expect(profileHref({ tab: "resonance", favPage: 1 })).toBe("/profile");
  });

  it("keeps the active listen", () => {
    expect(profileHref({ tab: "close", query: "Kind of Blue", favPage: 2 })).toBe(
      "/profile?tab=close&q=Kind+of+Blue&fav=2",
    );
    expect(profileHref({ tab: "waiting", wishPage: 3 })).toBe("/profile?tab=waiting&wish=3");
    expect(profileHref({ tab: "close", query: "Blue", settings: true })).toBe(
      "/profile?tab=close&q=Blue&settings=1",
    );
  });

  it("starts a typed listen on the first page of the open tab", () => {
    expect(profileHref(profileFromSearchInput("waiting", "  Kind of Blue  "))).toBe(
      "/profile?tab=waiting&q=Kind+of+Blue",
    );
    expect(profileHref(profileFromSearchInput("close", "   "))).toBe("/profile?tab=close");
  });
});

describe("profileNavHref", () => {
  it("opens a listen without dragging settings along", () => {
    expect(profileNavHref("resonance")).toBe("/profile");
    expect(profileNavHref("close", { query: "Kind of Blue" })).toBe(
      "/profile?tab=close&q=Kind+of+Blue",
    );
    expect(profileNavHref("waiting", { tab: "close", query: "Blue" })).toBe(
      "/profile?tab=waiting&q=Blue",
    );
  });

  it("opens settings on the listen you already hold", () => {
    expect(profileNavHref("settings")).toBe("/profile?settings=1");
    expect(profileNavHref("settings", { tab: "close", query: "Blue" })).toBe(
      "/profile?tab=close&q=Blue&settings=1",
    );
  });
});

describe("profileNavHrefForPath", () => {
  it("keeps the profile listen on the profile", () => {
    expect(profileNavHrefForPath("close", "/profile", { query: "Blue" })).toBe(
      "/profile?tab=close&q=Blue",
    );
  });

  it("does not carry another room's search onto the profile", () => {
    expect(profileNavHrefForPath("close", "/explorer", { query: "Nirvana" })).toBe("/profile?tab=close");
    expect(profileNavHrefForPath("settings", "/collection", { tab: "waiting", query: "Blue" })).toBe(
      "/profile?settings=1",
    );
  });
});

describe("isProfileNavActive", () => {
  it("lights the open listen, not the others", () => {
    expect(isProfileNavActive("close", { tab: "close", settings: false })).toBe(true);
    expect(isProfileNavActive("resonance", { tab: "close", settings: false })).toBe(false);
    expect(isProfileNavActive("settings", { tab: "close", settings: false })).toBe(false);
  });

  it("gives settings the floor when the panel is open", () => {
    expect(isProfileNavActive("settings", { tab: "close", settings: true })).toBe(true);
    expect(isProfileNavActive("close", { tab: "close", settings: true })).toBe(false);
  });
});

describe("profileEngagement", () => {
  it("stays quiet when nothing is marked or waiting", () => {
    expect(profileEngagement({ keptClose: 0, waiting: 0 })).toEqual([]);
  });

  it("names the records kept close", () => {
    expect(profileEngagement({ keptClose: 1, waiting: 0 })).toEqual([
      {
        id: "close",
        label: "Kept close",
        value: "1 record",
        href: "/profile?tab=close",
        ariaLabel: "Hear the records you keep close",
      },
    ]);
    expect(profileEngagement({ keptClose: 3, waiting: 0 })[0]?.value).toBe("3 records");
  });

  it("names the pressings still waiting", () => {
    expect(profileEngagement({ keptClose: 0, waiting: 1 })).toEqual([
      {
        id: "waiting",
        label: "Waiting",
        value: "1 pressing",
        href: "/profile?tab=waiting",
        ariaLabel: "Hear what is waiting",
      },
    ]);
    expect(profileEngagement({ keptClose: 0, waiting: 2 })[0]?.value).toBe("2 pressings");
  });
});

describe("parseSettingsFlag", () => {
  it("opens from the flag or an old settings tab", () => {
    expect(parseSettingsFlag("1")).toBe(true);
    expect(parseSettingsFlag(undefined, "settings")).toBe(true);
    expect(parseSettingsFlag(undefined, "close")).toBe(false);
    expect(parseSettingsFlag("true")).toBe(false);
  });
});

describe("parseDisplayName", () => {
  it("keeps a trimmed name", () => {
    expect(parseDisplayName("  Miles Davis  ")).toBe("Miles Davis");
    expect(parseDisplayName("Alice")).toBe("Alice");
  });

  it("lets go of an empty or overlong name", () => {
    expect(parseDisplayName(undefined)).toBeUndefined();
    expect(parseDisplayName("")).toBeUndefined();
    expect(parseDisplayName("   ")).toBeUndefined();
    expect(parseDisplayName("a".repeat(81))).toBeUndefined();
    expect(parseDisplayName("a".repeat(80))).toBe("a".repeat(80));
  });
});

describe("initialsFromName", () => {
  it("takes the first and last word", () => {
    expect(initialsFromName("Miles Davis")).toBe("MD");
    expect(initialsFromName("  Jean-Luc  Ponty  ")).toBe("JP");
    expect(initialsFromName("Alice")).toBe("AL");
  });

  it("stays quiet without a name", () => {
    expect(initialsFromName("")).toBe("?");
    expect(initialsFromName("   ")).toBe("?");
  });
});

describe("parsePortraitUrl", () => {
  it("keeps a still from the web", () => {
    expect(parsePortraitUrl("  https://i.discogs.com/face.jpg  ")).toBe("https://i.discogs.com/face.jpg");
  });

  it("clears an empty portrait", () => {
    expect(parsePortraitUrl("")).toBeNull();
    expect(parsePortraitUrl("   ")).toBeNull();
    expect(parsePortraitUrl(undefined)).toBeNull();
  });

  it("refuses anything that is not https", () => {
    expect(parsePortraitUrl("http://example.com/face.jpg")).toBeUndefined();
    expect(parsePortraitUrl("javascript:alert(1)")).toBeUndefined();
    expect(parsePortraitUrl("not-a-url")).toBeUndefined();
  });
});
