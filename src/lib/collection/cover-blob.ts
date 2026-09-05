import "server-only";

import { del, put } from "@vercel/blob";

import {
  COVER_COULD_NOT_KEEP,
  COVER_TOO_LARGE,
  COVER_WRONG_KIND,
  coverBlobPath,
  MAX_COVER_STORED_BYTES,
} from "@/lib/collection/cover";
import { compressCoverStill } from "@/lib/collection/cover-compress";
import { getEnv } from "@/lib/env";
import { ValidationError } from "@/lib/errors";
import { isResonancePortraitBlob } from "@/lib/profile/portrait";
import { parsePortraitUrl } from "@/lib/profile/types";

export async function keepCover(userId: string, bytes: Uint8Array): Promise<string> {
  const pathname = coverBlobPath(userId);

  if (!pathname) {
    throw new ValidationError(COVER_COULD_NOT_KEEP);
  }

  let still: Uint8Array;

  try {
    still = await compressCoverStill(bytes);
  } catch (error) {
    if (error instanceof Error && error.message === COVER_TOO_LARGE) {
      throw new ValidationError(COVER_TOO_LARGE);
    }

    throw new ValidationError(COVER_WRONG_KIND);
  }

  if (still.byteLength > MAX_COVER_STORED_BYTES) {
    throw new ValidationError(COVER_TOO_LARGE);
  }

  const token = getEnv().BLOB_READ_WRITE_TOKEN;

  try {
    const blob = await put(pathname, Buffer.from(still), {
      access: "public",
      addRandomSuffix: true,
      contentType: "image/webp",
      cacheControlMaxAge: 60 * 60 * 24 * 30,
      ...(token ? { token } : {}),
    });
    const url = parsePortraitUrl(blob.url);

    if (!url) {
      throw new ValidationError(COVER_COULD_NOT_KEEP);
    }

    return url;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }

    throw new ValidationError(COVER_COULD_NOT_KEEP);
  }
}

export async function restCover(url: string | null): Promise<void> {
  if (!url || !isResonancePortraitBlob(url)) {
    return;
  }

  const token = getEnv().BLOB_READ_WRITE_TOKEN;

  try {
    await del(url, token ? { token } : undefined);
  } catch {
    return;
  }
}
