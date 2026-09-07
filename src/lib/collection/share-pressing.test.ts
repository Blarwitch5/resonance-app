import { describe, expect, it, vi } from "vitest";

import {
  offerLinkShare,
  offerPressingShare,
  shareLinkPayload,
  sharePressingPayload,
  sharePressingShowsQuietControl,
  sharePressingVoice,
} from "@/lib/collection/share-pressing";

describe("sharePressingPayload", () => {
  it("names the pressing that travels without stuffing prose into the url", () => {
    expect(sharePressingPayload("https://myresonance.vercel.app/listen/abc", "In Utero", "Nirvana")).toEqual({
      title: "Nirvana — In Utero",
      url: "https://myresonance.vercel.app/listen/abc",
    });
  });
});

describe("shareLinkPayload", () => {
  it("shares only a title and url", () => {
    expect(shareLinkPayload("https://myresonance.vercel.app/listen/shelf/abc", "A shelf on Resonance")).toEqual({
      title: "A shelf on Resonance",
      url: "https://myresonance.vercel.app/listen/shelf/abc",
    });
  });
});

describe("sharePressingVoice", () => {
  it("invites a share", () => {
    expect(sharePressingVoice("In Utero", false)).toEqual({
      ariaLabel: "Share In Utero",
      label: "Share this pressing",
      error: "This pressing could not travel just now.",
    });
  });

  it("quiets after a copy", () => {
    expect(sharePressingVoice("In Utero", true)).toEqual({
      ariaLabel: "Share In Utero",
      label: "Link copied",
      error: "This pressing could not travel just now.",
    });
  });
});

describe("sharePressingShowsQuietControl", () => {
  it("hides quiet on the icon share control", () => {
    expect(sharePressingShowsQuietControl("button", true)).toBe(false);
    expect(sharePressingShowsQuietControl("button", false)).toBe(false);
  });

  it("offers quiet only on the link appearance once shared", () => {
    expect(sharePressingShowsQuietControl("link", true)).toBe(true);
    expect(sharePressingShowsQuietControl("link", false)).toBe(false);
  });
});

describe("offerPressingShare", () => {
  const payload = {
    href: "https://myresonance.vercel.app/listen/abc",
    title: "In Utero",
    artist: "Nirvana",
  };

  it("lets the room share when a sheet is waiting", async () => {
    const share = vi.fn().mockResolvedValue(undefined);

    await expect(offerPressingShare(payload, { share })).resolves.toBe("shared");
    expect(share).toHaveBeenCalledWith({
      title: "Nirvana — In Utero",
      url: payload.href,
    });
  });

  it("copies the link when no share sheet lives here", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    await expect(offerPressingShare(payload, { writeText })).resolves.toBe("copied");
    expect(writeText).toHaveBeenCalledWith(payload.href);
  });

  it("stays quiet when the share is cancelled", async () => {
    const abort = Object.assign(new Error("cancelled"), { name: "AbortError" });
    const share = vi.fn().mockRejectedValue(abort);
    const writeText = vi.fn();

    await expect(offerPressingShare(payload, { share, writeText })).resolves.toBe("aborted");
    expect(writeText).not.toHaveBeenCalled();
  });

  it("copies the link when the sheet cannot open", async () => {
    const share = vi.fn().mockRejectedValue(new Error("unavailable"));
    const writeText = vi.fn().mockResolvedValue(undefined);

    await expect(offerPressingShare(payload, { share, writeText })).resolves.toBe("copied");
    expect(writeText).toHaveBeenCalledWith(payload.href);
  });

  it("absolutizes relative Resonance listen links", async () => {
    const share = vi.fn().mockResolvedValue(undefined);

    await expect(
      offerPressingShare(
        { href: "/listen/abc", title: "In Utero", artist: "Nirvana" },
        { share },
        "https://myresonance.vercel.app",
      ),
    ).resolves.toBe("shared");
    expect(share).toHaveBeenCalledWith({
      title: "Nirvana — In Utero",
      url: "https://myresonance.vercel.app/listen/abc",
    });
  });

  it("fails calmly when the pressing cannot travel", async () => {
    await expect(offerPressingShare(payload, {})).rejects.toThrow("This pressing could not travel just now.");
  });
});

describe("offerLinkShare", () => {
  it("shares a shelf without a prose text field", async () => {
    const share = vi.fn().mockResolvedValue(undefined);

    await expect(
      offerLinkShare(
        { href: "/listen/shelf/abc", title: "A shelf on Resonance" },
        { share },
        "https://myresonance.vercel.app",
      ),
    ).resolves.toBe("shared");
    expect(share).toHaveBeenCalledWith({
      title: "A shelf on Resonance",
      url: "https://myresonance.vercel.app/listen/shelf/abc",
    });
  });
});
