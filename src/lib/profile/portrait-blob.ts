import "server-only";

import { del, put } from "@vercel/blob";

import { getEnv } from "@/lib/env";
import { ValidationError } from "@/lib/errors";
import {
  isResonancePortraitBlob,
  MAX_PORTRAIT_STORED_BYTES,
  PORTRAIT_COULD_NOT_KEEP,
  PORTRAIT_CONTENT_TYPE,
  PORTRAIT_TOO_LARGE,
  PORTRAIT_WRONG_KIND,
  portraitBlobPath,
} from "@/lib/profile/portrait";
import { compressPortraitStill } from "@/lib/profile/portrait-compress";
import { parsePortraitUrl } from "@/lib/profile/types";

export async function keepPortrait(userId: string, bytes: Uint8Array): Promise<string> {
  const pathname = portraitBlobPath(userId);

  if (!pathname) {
    throw new ValidationError(PORTRAIT_COULD_NOT_KEEP);
  }

  let still: Uint8Array;

  try {
    still = await compressPortraitStill(bytes);
  } catch (error) {
    if (error instanceof Error && error.message === PORTRAIT_TOO_LARGE) {
      throw new ValidationError(PORTRAIT_TOO_LARGE);
    }

    throw new ValidationError(PORTRAIT_WRONG_KIND);
  }

  if (still.byteLength > MAX_PORTRAIT_STORED_BYTES) {
    throw new ValidationError(PORTRAIT_TOO_LARGE);
  }

  const token = getEnv().BLOB_READ_WRITE_TOKEN;

  try {
    const blob = await put(pathname, Buffer.from(still), {
      access: "public",
      addRandomSuffix: true,
      contentType: PORTRAIT_CONTENT_TYPE.webp,
      cacheControlMaxAge: 60 * 60 * 24 * 30,
      ...(token ? { token } : {}),
    });
    const url = parsePortraitUrl(blob.url);

    if (!url) {
      throw new ValidationError(PORTRAIT_COULD_NOT_KEEP);
    }

    return url;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }

    throw new ValidationError(PORTRAIT_COULD_NOT_KEEP);
  }
}

export async function restPortrait(url: string | null): Promise<void> {
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
