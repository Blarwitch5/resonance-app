import { describe, expect, it } from "vitest";

import { isQuietShelfVisible, offlineFetchPlan } from "@/lib/offline/shelf-cache";

describe("offlineFetchPlan", () => {
  it("keeps the shelf and its journals readable", () => {
    expect(offlineFetchPlan("https://resonance.app/collection").kind).toBe("shelf");
    expect(offlineFetchPlan("https://resonance.app/collection?format=vinyl").kind).toBe("shelf");
    expect(offlineFetchPlan("https://resonance.app/collection/tonight").kind).toBe("shelf");
    expect(
      offlineFetchPlan("https://resonance.app/collection/1ad8dbdd-56f0-4506-90ee-c1839957ef70").kind,
    ).toBe("shelf");
  });

  it("lets hashed assets and Discogs covers wait on the device", () => {
    expect(offlineFetchPlan("https://resonance.app/_next/static/chunks/app.js").kind).toBe("static");
    expect(
      offlineFetchPlan(
        "https://i.discogs.com/pnpn98483QUsab-MZvpa2jOI8W4qtw8BntK-s_BssDw/rs:fit/g:sm/q:90/h:600/w:599/image.jpeg",
      ).kind,
    ).toBe("cover");
  });

  it("leaves Explorer, auth, and APIs on the wire", () => {
    expect(offlineFetchPlan("https://resonance.app/explorer?q=Nirvana").kind).toBe("network");
    expect(offlineFetchPlan("https://resonance.app/api/auth/ok").kind).toBe("bypass");
    expect(offlineFetchPlan("https://resonance.app/sign-in").kind).toBe("network");
    expect(offlineFetchPlan("https://resonance.app/profile").kind).toBe("network");
    expect(offlineFetchPlan("https://resonance.app/collection/not-a-journal").kind).toBe("network");
  });

  it("whispers only when the shelf is already in the hand and the air is quiet", () => {
    expect(isQuietShelfVisible("/collection", false)).toBe(true);
    expect(isQuietShelfVisible("/collection/tonight", false)).toBe(true);
    expect(
      isQuietShelfVisible("/collection/1ad8dbdd-56f0-4506-90ee-c1839957ef70", false),
    ).toBe(true);
    expect(isQuietShelfVisible("/collection", true)).toBe(false);
    expect(isQuietShelfVisible("/explorer", false)).toBe(false);
    expect(isQuietShelfVisible("/profile", false)).toBe(false);
  });
});
