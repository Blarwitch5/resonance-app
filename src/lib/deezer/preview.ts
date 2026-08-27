import type { RecordSide } from "@/lib/collection/types";

export interface DeezerPreview {
  title: string;
  previewUrl: string;
}

export function normalizeTrackTitle(value: string): string {
  return value
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/\b(feat\.?|ft\.?|featuring)\b.*$/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function isDeezerPreviewUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".dzcdn.net") && url.pathname.length > 1;
  } catch {
    return false;
  }
}

export function deezerAlbumQuery(artist: string, title: string): string {
  const who = clipQueryPart(artist);
  const album = clipQueryPart(title);

  if (who.length === 0 || album.length === 0) {
    return "";
  }

  return `artist:"${who}" album:"${album}"`;
}

export function matchTrackPreview(title: string, previews: readonly DeezerPreview[]): string | null {
  const needle = normalizeTrackTitle(title);

  if (needle.length === 0) {
    return null;
  }

  const hit = previews.find((preview) => normalizeTrackTitle(preview.title) === needle);
  const url = hit?.previewUrl ?? "";

  return isDeezerPreviewUrl(url) ? url : null;
}

export interface SampleCue {
  key: string;
  title: string;
  url: string;
  position: string;
}

export function sampleCues(sides: readonly RecordSide[]): SampleCue[] {
  return sides.flatMap((side, sideIndex) =>
    side.tracks.flatMap((track, trackIndex) => {
      if (!track.previewUrl || !isDeezerPreviewUrl(track.previewUrl)) {
        return [];
      }

      return [
        {
          key: `${sideIndex}-${trackIndex}`,
          title: track.title,
          url: track.previewUrl,
          position: track.position.trim(),
        },
      ];
    }),
  );
}

export function sampleCueLabel(cue: SampleCue): string {
  const position = cue.position.trim();
  return position.length > 0 ? `${position} · ${cue.title}` : cue.title;
}

export function adjacentSample(cues: readonly SampleCue[], key: string, delta: number): SampleCue | null {
  if (cues.length === 0) {
    return null;
  }

  const index = cues.findIndex((cue) => cue.key === key);

  if (index === -1) {
    return null;
  }

  const next = cues[(index + delta + cues.length) % cues.length];
  return next ?? null;
}

export function hasDeezerPreview(sides: readonly RecordSide[]): boolean {
  return sides.some((side) => side.tracks.some((track) => Boolean(track.previewUrl)));
}

const DISCOGS_ARTWORK_HOSTS = new Set(["i.discogs.com", "st.discogs.com", "img.discogs.com"]);

export function sampleArtworkUrl(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" && DISCOGS_ARTWORK_HOSTS.has(url.hostname) ? url.href : null;
  } catch {
    return null;
  }
}

export interface SampleNowPlaying {
  title: string;
  artist: string;
  album: string;
  artwork: string | null;
}

export function sampleNowPlaying(input: {
  track: string;
  artist?: string;
  album?: string;
  coverUrl?: string | null;
}): SampleNowPlaying {
  const title = input.track.trim();

  return {
    title,
    artist: input.artist?.trim() || "Resonance",
    album: input.album?.trim() || title,
    artwork: sampleArtworkUrl(input.coverUrl),
  };
}

export function sampleSeekRatio(input: { clientX: number; left: number; width: number }): number {
  if (!Number.isFinite(input.width) || input.width <= 0) {
    return 0;
  }

  const ratio = (input.clientX - input.left) / input.width;
  return Math.min(1, Math.max(0, ratio));
}

export function sampleSeekSeconds(input: { ratio: number; duration: number }): number | null {
  if (!Number.isFinite(input.duration) || input.duration <= 0) {
    return null;
  }

  const ratio = Math.min(1, Math.max(0, input.ratio));
  return ratio * input.duration;
}

export function samplePositionState(input: { duration: number; progress: number }): {
  duration: number;
  playbackRate: 1;
  position: number;
} | null {
  if (!Number.isFinite(input.duration) || input.duration <= 0) {
    return null;
  }

  const progress = Number.isFinite(input.progress) ? input.progress : 0;
  const position = Math.min(input.duration, Math.max(0, progress * input.duration));

  return {
    duration: input.duration,
    playbackRate: 1,
    position,
  };
}

export function shouldToggleSampleOnSpace(input: {
  key: string;
  hasQueued: boolean;
  isTyping: boolean;
  hasModal: boolean;
  hasModifier: boolean;
  isOnButton: boolean;
}): boolean {
  if (!input.hasQueued) {
    return false;
  }

  if (input.key !== " " && input.key !== "Space") {
    return false;
  }

  if (input.hasModifier || input.hasModal || input.isTyping || input.isOnButton) {
    return false;
  }

  return true;
}

export function attachDeezerPreviews(
  sides: readonly RecordSide[],
  previews: readonly DeezerPreview[],
): RecordSide[] {
  const remaining = previews.filter((preview) => isDeezerPreviewUrl(preview.previewUrl));

  return sides.map((side) => ({
    ...side,
    tracks: side.tracks.map((track) => {
      const index = remaining.findIndex((preview) => matchTrackPreview(track.title, [preview]));

      if (index === -1) {
        return { ...track, previewUrl: track.previewUrl ?? null };
      }

      const [hit] = remaining.splice(index, 1);
      return { ...track, previewUrl: hit?.previewUrl ?? null };
    }),
  }));
}

export function pickDeezerAlbum<T extends { title?: string; artist?: { name?: string } }>(
  artist: string,
  title: string,
  albums: readonly T[],
): T | undefined {
  const who = normalizeTrackTitle(artist);
  const want = normalizeAlbumTitle(title);

  if (want.length === 0 || albums.length === 0) {
    return undefined;
  }

  const sameArtist = albums.filter((entry) => normalizeTrackTitle(entry.artist?.name ?? "") === who);
  const pool = sameArtist.length > 0 ? sameArtist : albums;
  const exact = pool.find((entry) => normalizeAlbumTitle(entry.title ?? "") === want);

  if (exact) {
    return exact;
  }

  const studio = pool
    .filter((entry) => {
      const have = normalizeAlbumTitle(entry.title ?? "");
      return have.startsWith(`${want} `) && !/\b(live|tribute|instrumental)\b/i.test(entry.title ?? "");
    })
    .sort(
      (left, right) => normalizeAlbumTitle(left.title ?? "").length - normalizeAlbumTitle(right.title ?? "").length,
    );

  return studio[0] ?? pool[0];
}

function normalizeAlbumTitle(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function clipQueryPart(value: string): string {
  return value.replaceAll('"', "").trim().slice(0, 80);
}
