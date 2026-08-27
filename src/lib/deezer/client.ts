import "server-only";

import type { RecordSide } from "@/lib/collection/types";
import {
  attachDeezerPreviews,
  deezerAlbumQuery,
  isDeezerPreviewUrl,
  pickDeezerAlbum,
  type DeezerPreview,
} from "@/lib/deezer/preview";
import type { DeezerAlbum, DeezerErrorBody, DeezerList, DeezerTrack } from "@/lib/deezer/types";
import { DeezerError } from "@/lib/errors";

const DEEZER_API = "https://api.deezer.com";
const USER_AGENT = "Resonance/0.1 +https://github.com/blarwitch5/resonance";

async function deezerFetch(path: string): Promise<Response> {
  const url = new URL(path, DEEZER_API);

  try {
    return await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT,
      },
      next: { revalidate: 60 * 60 },
    });
  } catch (error) {
    throw new DeezerError("Deezer could not be reached.", { cause: error });
  }
}

async function readJson<T>(response: Response): Promise<T> {
  if (response.status === 429) {
    throw new DeezerError("Deezer asked us to slow down. Try again in a moment.");
  }

  if (!response.ok) {
    throw new DeezerError(`Deezer request failed (${response.status}).`);
  }

  try {
    return (await response.json()) as T;
  } catch (error) {
    throw new DeezerError("Deezer returned an unreadable response.", { cause: error });
  }
}

function throwIfDeezerError(body: DeezerErrorBody): void {
  const message = body.error?.message?.trim() ?? "";

  if (message.length === 0) {
    return;
  }

  if (body.error?.code === 4) {
    throw new DeezerError("Deezer asked us to slow down. Try again in a moment.");
  }

  throw new DeezerError("Deezer could not play a sample just now.");
}

export async function searchDeezerAlbumPreviews(artist: string, title: string): Promise<DeezerPreview[]> {
  const query = deezerAlbumQuery(artist, title);

  if (query.length === 0) {
    return [];
  }

  const albums = await readJson<DeezerList<DeezerAlbum>>(
    await deezerFetch(`/search/album?q=${encodeURIComponent(query)}`),
  );
  throwIfDeezerError(albums);

  const album = pickDeezerAlbum(artist, title, albums.data ?? []);

  if (!album?.id || album.id <= 0) {
    return [];
  }

  const tracks = await readJson<DeezerList<DeezerTrack>>(
    await deezerFetch(`/album/${album.id}/tracks?limit=100`),
  );
  throwIfDeezerError(tracks);

  return (tracks.data ?? [])
    .map((track) => ({
      title: track.title?.trim() ?? "",
      previewUrl: track.preview?.trim() ?? "",
    }))
    .filter((track) => track.title.length > 0 && isDeezerPreviewUrl(track.previewUrl));
}

export async function loadDeezerPreviews(artist: string, title: string): Promise<DeezerPreview[]> {
  try {
    return await searchDeezerAlbumPreviews(artist, title);
  } catch (error) {
    if (error instanceof DeezerError) {
      return [];
    }

    throw error;
  }
}

export async function sidesWithDeezerPreviews(input: {
  sides: readonly RecordSide[];
  artist: string;
  title: string;
}): Promise<RecordSide[]> {
  if (input.sides.length === 0) {
    return [...input.sides];
  }

  const previews = await loadDeezerPreviews(input.artist, input.title);
  return attachDeezerPreviews(input.sides, previews);
}
