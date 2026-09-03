import { describe, expect, it } from "vitest";

import {
  adjacentSample,
  attachDeezerPreviews,
  deezerAlbumQuery,
  hasDeezerPreview,
  hasQuietSampleTracks,
  isDeezerPreviewUrl,
  matchTrackPreview,
  normalizeTrackTitle,
  pickDeezerAlbum,
  isDeezerPreviewAudioType,
  sampleArtworkUrl,
  sampleListenHref,
  sampleCueLabel,
  sampleCues,
  sampleNowPlaying,
  samplePlaybackFailure,
  sampleSeekRatio,
  sampleSeekSeconds,
  samplePositionState,
  shouldToggleSampleOnSpace,
  trackHasSample,
} from "@/lib/deezer/preview";

const preview = "https://cdns-preview-d.dzcdn.net/stream/c-abc123.mp3";

describe("normalizeTrackTitle", () => {
  it("quiets live takes, feats, and punctuation", () => {
    expect(normalizeTrackTitle("So What (Live)")).toBe("so what");
    expect(normalizeTrackTitle("Heart-Shaped Box")).toBe("heart shaped box");
    expect(normalizeTrackTitle("Dumb [Remastered]")).toBe("dumb");
    expect(normalizeTrackTitle("All Blues feat. Cannonball Adderley")).toBe("all blues");
  });
});

describe("isDeezerPreviewUrl", () => {
  it("keeps Deezer CDN previews only", () => {
    expect(isDeezerPreviewUrl(preview)).toBe(true);
    expect(
      isDeezerPreviewUrl(
        "https://cdnt-preview.dzcdn.net/api/1/1/f/8/c/0/f8c5dc3837912dba37c9a1ab3170cc3f.mp3?hdnea=exp=1",
      ),
    ).toBe(true);
    expect(isDeezerPreviewUrl("https://evil.example/x.mp3")).toBe(false);
    expect(isDeezerPreviewUrl("http://cdns-preview-d.dzcdn.net/stream/c-abc123.mp3")).toBe(false);
    expect(isDeezerPreviewUrl("https://cdns-preview-d.dzcdn.net/cover/c-abc123.jpg")).toBe(false);
    expect(isDeezerPreviewUrl("https://e-cdns-images.dzcdn.net/images/cover/abc.mp3")).toBe(false);
    expect(isDeezerPreviewUrl("not a url")).toBe(false);
  });
});

describe("sampleListenHref", () => {
  it("keeps the sample on Resonance so the browser never reads Deezer", () => {
    expect(sampleListenHref(preview)).toBe(`/api/resonance/sample?src=${encodeURIComponent(preview)}`);
    expect(sampleListenHref("https://evil.example/x.mp3")).toBeNull();
  });
});

describe("isDeezerPreviewAudioType", () => {
  it("lets audio through and refuses an HTML wall", () => {
    expect(isDeezerPreviewAudioType("audio/mpeg")).toBe(true);
    expect(isDeezerPreviewAudioType("application/octet-stream")).toBe(true);
    expect(isDeezerPreviewAudioType("")).toBe(true);
    expect(isDeezerPreviewAudioType("text/html; charset=utf-8")).toBe(false);
    expect(isDeezerPreviewAudioType("application/json")).toBe(false);
  });
});

describe("deezerAlbumQuery", () => {
  it("names the pressing for Deezer", () => {
    expect(deezerAlbumQuery("Nirvana", "In Utero")).toBe('artist:"Nirvana" album:"In Utero"');
    expect(deezerAlbumQuery('Ni"rvana', "In Utero")).toBe('artist:"Nirvana" album:"In Utero"');
  });
});

describe("matchTrackPreview", () => {
  it("hears the same title on Deezer", () => {
    expect(
      matchTrackPreview("So What", [{ title: "So What", previewUrl: preview }]),
    ).toBe(preview);
  });

  it("stays quiet without a usable preview", () => {
    expect(matchTrackPreview("So What", [{ title: "So What", previewUrl: "" }])).toBeNull();
    expect(matchTrackPreview("Flamenco Sketches", [{ title: "So What", previewUrl: preview }])).toBeNull();
    expect(matchTrackPreview("So What", [{ title: "So What", previewUrl: "https://evil.example/x.mp3" }])).toBeNull();
  });
});

describe("hasDeezerPreview", () => {
  it("knows when a face already carries a sample", () => {
    expect(
      hasDeezerPreview([
        {
          heading: "Side A",
          tracks: [{ position: "A1", title: "So What", duration: "9:22", previewUrl: preview }],
        },
      ]),
    ).toBe(true);
    expect(
      hasDeezerPreview([
        {
          heading: "Side A",
          tracks: [{ position: "A1", title: "So What", duration: "9:22", previewUrl: null }],
        },
      ]),
    ).toBe(false);
  });
});

describe("trackHasSample", () => {
  it("hears only a real Deezer preview", () => {
    expect(trackHasSample({ previewUrl: preview })).toBe(true);
    expect(trackHasSample({ previewUrl: null })).toBe(false);
    expect(trackHasSample({ previewUrl: "https://evil.example/x.mp3" })).toBe(false);
  });
});

describe("hasQuietSampleTracks", () => {
  it("notices a face without a sample beside ones that sing", () => {
    expect(
      hasQuietSampleTracks([
        {
          heading: "Side A",
          tracks: [
            { position: "A1", title: "So What", duration: "9:22", previewUrl: preview },
            { position: "A2", title: "Freddie Freeloader", duration: "9:46", previewUrl: null },
          ],
        },
      ]),
    ).toBe(true);
    expect(
      hasQuietSampleTracks([
        {
          heading: "Side A",
          tracks: [{ position: "A1", title: "So What", duration: "9:22", previewUrl: preview }],
        },
      ]),
    ).toBe(false);
  });
});

describe("attachDeezerPreviews", () => {
  it("lays a sample on matching faces, once", () => {
    const sides = attachDeezerPreviews(
      [
        {
          heading: "Side A",
          tracks: [
            { position: "A1", title: "So What", duration: "9:22", previewUrl: null },
            { position: "A2", title: "Freddie Freeloader", duration: "9:46", previewUrl: null },
          ],
        },
      ],
      [
        { title: "So What", previewUrl: preview },
        { title: "So What", previewUrl: "https://cdns-preview-d.dzcdn.net/stream/c-other.mp3" },
      ],
    );

    expect(sides[0]?.tracks[0]?.previewUrl).toBe(preview);
    expect(sides[0]?.tracks[1]?.previewUrl).toBeNull();
  });
});

describe("pickDeezerAlbum", () => {
  it("prefers the studio album over deluxe and live editions", () => {
    const albums = [
      { title: "In Utero 30th Live", artist: { name: "Nirvana" } },
      { title: "In Utero (30th Anniversary Super Deluxe)", artist: { name: "Nirvana" } },
      { title: "In Utero (Deluxe Edition)", artist: { name: "Nirvana" } },
      { title: "In Utero", artist: { name: "Nirvana" } },
    ];

    expect(pickDeezerAlbum("Nirvana", "In Utero", albums)?.title).toBe("In Utero");
  });

  it("skips live takes when the original is missing", () => {
    const albums = [
      { title: "In Utero 30th Live", artist: { name: "Nirvana" } },
      { title: "In Utero (Deluxe Edition)", artist: { name: "Nirvana" } },
      { title: "In Utero (Super Deluxe Edition)", artist: { name: "Nirvana" } },
    ];

    expect(pickDeezerAlbum("Nirvana", "In Utero", albums)?.title).toBe("In Utero (Deluxe Edition)");
  });
});

describe("sampleCues", () => {
  it("keeps only hearable tracks, in pressing order", () => {
    const cues = sampleCues([
      {
        heading: "Side A",
        tracks: [
          { position: "A1", title: "So What", duration: "9:22", previewUrl: preview },
          { position: "A2", title: "Freddie Freeloader", duration: "9:46", previewUrl: null },
        ],
      },
      {
        heading: "Side B",
        tracks: [{ position: "B1", title: "All Blues", duration: "11:33", previewUrl: preview }],
      },
    ]);

    expect(cues).toEqual([
      { key: "0-0", title: "So What", url: preview, position: "A1" },
      { key: "1-0", title: "All Blues", url: preview, position: "B1" },
    ]);
  });
});

describe("sampleCueLabel", () => {
  it("leads with the face position", () => {
    expect(sampleCueLabel({ key: "0-0", title: "So What", url: preview, position: "A1" })).toBe(
      "A1 · So What",
    );
    expect(sampleCueLabel({ key: "0-0", title: "Untitled", url: preview, position: "" })).toBe("Untitled");
  });
});

describe("adjacentSample", () => {
  const cues = [
    { key: "0-0", title: "So What", url: preview, position: "A1" },
    { key: "0-1", title: "Freddie Freeloader", url: "https://cdns-preview-d.dzcdn.net/stream/c-other.mp3", position: "A2" },
  ];

  it("steps to the next and previous cue", () => {
    expect(adjacentSample(cues, "0-0", 1)?.title).toBe("Freddie Freeloader");
    expect(adjacentSample(cues, "0-1", -1)?.title).toBe("So What");
  });

  it("wraps around the pressing", () => {
    expect(adjacentSample(cues, "0-1", 1)?.title).toBe("So What");
    expect(adjacentSample(cues, "0-0", -1)?.title).toBe("Freddie Freeloader");
  });

  it("stays quiet without a current cue", () => {
    expect(adjacentSample(cues, "missing", 1)).toBeNull();
    expect(adjacentSample([], "0-0", 1)).toBeNull();
  });
});

describe("sampleArtworkUrl", () => {
  it("keeps Discogs covers only", () => {
    expect(sampleArtworkUrl("https://i.discogs.com/abc.jpeg")).toBe("https://i.discogs.com/abc.jpeg");
    expect(sampleArtworkUrl("https://evil.example/cover.jpg")).toBeNull();
    expect(sampleArtworkUrl("http://i.discogs.com/abc.jpeg")).toBeNull();
    expect(sampleArtworkUrl(null)).toBeNull();
  });
});

describe("sampleNowPlaying", () => {
  it("names the track for the lock screen", () => {
    expect(
      sampleNowPlaying({
        track: "Heart-Shaped Box",
        artist: "Nirvana",
        album: "In Utero",
        coverUrl: "https://i.discogs.com/abc.jpeg",
      }),
    ).toEqual({
      title: "Heart-Shaped Box",
      artist: "Nirvana",
      album: "In Utero",
      artwork: "https://i.discogs.com/abc.jpeg",
    });
  });

  it("falls back without a cover or artist", () => {
    expect(sampleNowPlaying({ track: "Dumb" })).toEqual({
      title: "Dumb",
      artist: "Resonance",
      album: "Dumb",
      artwork: null,
    });
  });
});

describe("sampleSeekRatio", () => {
  it("reads how far along the bar you pressed", () => {
    expect(sampleSeekRatio({ clientX: 50, left: 0, width: 100 })).toBe(0.5);
    expect(sampleSeekRatio({ clientX: -10, left: 0, width: 100 })).toBe(0);
    expect(sampleSeekRatio({ clientX: 200, left: 0, width: 100 })).toBe(1);
    expect(sampleSeekRatio({ clientX: 50, left: 0, width: 0 })).toBe(0);
  });
});

describe("sampleSeekSeconds", () => {
  it("lands inside the sample", () => {
    expect(sampleSeekSeconds({ ratio: 0.5, duration: 30 })).toBe(15);
    expect(sampleSeekSeconds({ ratio: -1, duration: 30 })).toBe(0);
    expect(sampleSeekSeconds({ ratio: 2, duration: 30 })).toBe(30);
    expect(sampleSeekSeconds({ ratio: 0.5, duration: 0 })).toBeNull();
  });
});

describe("samplePositionState", () => {
  it("names how far the sample has traveled", () => {
    expect(samplePositionState({ duration: 30, progress: 0.5 })).toEqual({
      duration: 30,
      playbackRate: 1,
      position: 15,
    });
  });

  it("stays quiet until the sample has a length", () => {
    expect(samplePositionState({ duration: 0, progress: 0.5 })).toBeNull();
  });

  it("keeps the playhead inside the sample", () => {
    expect(samplePositionState({ duration: 30, progress: -1 })?.position).toBe(0);
    expect(samplePositionState({ duration: 30, progress: 2 })?.position).toBe(30);
  });
});

describe("samplePlaybackFailure", () => {
  it("stays quiet when a sample is interrupted", () => {
    expect(samplePlaybackFailure(new DOMException("The play() request was interrupted.", "AbortError"))).toBe(
      "abort",
    );
  });

  it("asks to try again when the room blocked autoplay", () => {
    expect(samplePlaybackFailure(new DOMException("play() failed because the user didn't interact", "NotAllowedError"))).toBe(
      "blocked",
    );
  });

  it("names a sample that could not be heard", () => {
    expect(samplePlaybackFailure(new Error("network"))).toBe("hear");
    expect(samplePlaybackFailure("no")).toBe("hear");
  });
});

describe("shouldToggleSampleOnSpace", () => {
  const ready = {
    key: " ",
    hasQueued: true,
    isTyping: false,
    hasModal: false,
    hasModifier: false,
    isOnButton: false,
  };

  it("hears Space when a sample is already queued", () => {
    expect(shouldToggleSampleOnSpace(ready)).toBe(true);
  });

  it("leaves Space alone in a field, a modal, or on a button", () => {
    expect(shouldToggleSampleOnSpace({ ...ready, isTyping: true })).toBe(false);
    expect(shouldToggleSampleOnSpace({ ...ready, hasModal: true })).toBe(false);
    expect(shouldToggleSampleOnSpace({ ...ready, isOnButton: true })).toBe(false);
    expect(shouldToggleSampleOnSpace({ ...ready, hasModifier: true })).toBe(false);
  });

  it("stays quiet without a queued sample", () => {
    expect(shouldToggleSampleOnSpace({ ...ready, hasQueued: false })).toBe(false);
    expect(shouldToggleSampleOnSpace({ ...ready, key: "Enter" })).toBe(false);
  });
});
