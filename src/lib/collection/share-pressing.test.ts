import { describe, expect, it, vi } from "vitest";

import { offerPressingShare, sharePressingPayload, sharePressingVoice } from "@/lib/collection/share-pressing";

describe("sharePressingPayload", () => {
  it("names the pressing that travels", () => {
    expect(sharePressingPayload("https://www.discogs.com/release/2313422", "In Utero", "Nirvana")).toEqual({
      title: "Nirvana — In Utero",
      text: "In Utero by Nirvana",
      url: "https://www.discogs.com/release/2313422",
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

describe("offerPressingShare", () => {
  const payload = {
    href: "https://www.discogs.com/release/2313422",
    title: "In Utero",
    artist: "Nirvana",
  };

  it("lets the room share when a sheet is waiting", async () => {
    const share = vi.fn().mockResolvedValue(undefined);

    await expect(offerPressingShare(payload, { share })).resolves.toBe("shared");
    expect(share).toHaveBeenCalledWith(sharePressingPayload(payload.href, payload.title, payload.artist));
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

  it("fails calmly when the pressing cannot travel", async () => {
    await expect(offerPressingShare(payload, {})).rejects.toThrow("This pressing could not travel just now.");
  });
});
