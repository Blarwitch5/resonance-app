"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { journalHref } from "@/lib/collection/href";
import { addCollectionItem, updateCollectionItem } from "@/lib/collection/repository";
import { MEDIA_FORMATS, parseMediaFormat, type CollectionKind, type MediaFormat } from "@/lib/collection/types";
import { toReleaseDraft } from "@/lib/discogs/adapter";
import { getDiscogsRelease } from "@/lib/discogs/client";
import { AppError, DatabaseError, toErrorMessage, ValidationError } from "@/lib/errors";
import { requireSession } from "@/lib/session";

export interface AddReleaseState {
  error: string | null;
}

function parseKind(value: FormDataEntryValue | null): CollectionKind {
  return value === "wishlist" ? "wishlist" : "owned";
}

function parseFormatOrThrow(value: FormDataEntryValue | null): MediaFormat {
  const format = parseMediaFormat(typeof value === "string" ? value : undefined);

  if (!format) {
    throw new ValidationError("Choose vinyl, cassette, or CD.");
  }

  return format;
}

export async function addReleaseAction(
  _previous: AddReleaseState,
  formData: FormData,
): Promise<AddReleaseState> {
  const session = await requireSession();
  let createdId: string;
  let isOwned = false;

  try {
    const discogsId = Number.parseInt(String(formData.get("discogsId") ?? ""), 10);

    if (!Number.isInteger(discogsId) || discogsId <= 0) {
      throw new ValidationError("This release could not be added.");
    }

    const kind = parseKind(formData.get("kind"));
    const release = await getDiscogsRelease(discogsId);
    const created = await addCollectionItem(
      session.user.id,
      {
        ...toReleaseDraft(release),
        format: parseFormatOrThrow(formData.get("format")),
      },
      kind,
      String(formData.get("notes") ?? ""),
    );

    createdId = created.id;
    isOwned = kind === "owned";
  } catch (error) {
    return { error: toErrorMessage(error) };
  }

  redirect(journalHref(createdId, isOwned));
}

export interface AddWishlistState {
  error: string | null;
}

const wishlistSchema = z.object({
  discogsId: z.coerce.number().int().positive(),
  format: z.enum(MEDIA_FORMATS),
});

export async function addWishlistAction(
  _previous: AddWishlistState,
  formData: FormData,
): Promise<AddWishlistState> {
  const session = await requireSession();
  const parsed = wishlistSchema.safeParse({
    discogsId: formData.get("discogsId"),
    format: formData.get("format"),
  });

  if (!parsed.success) {
    return { error: "This pressing could not be kept waiting." };
  }

  try {
    const release = await getDiscogsRelease(parsed.data.discogsId);
    await addCollectionItem(
      session.user.id,
      {
        ...toReleaseDraft(release),
        format: parsed.data.format,
      },
      "wishlist",
    );
  } catch (error) {
    return { error: toErrorMessage(error) };
  }

  revalidatePath("/explorer");
  revalidatePath("/profile");
  return { error: null };
}

export async function moveWishlistToShelfAction(formData: FormData) {
  const session = await requireSession();
  const itemId = String(formData.get("itemId") ?? "").trim();

  if (itemId.length === 0) {
    throw new ValidationError("This record could not be moved to your shelf.");
  }

  let movedId: string;

  try {
    const moved = await updateCollectionItem(session.user.id, itemId, { isWishlist: false });
    movedId = moved.id;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new DatabaseError("This record could not be moved to your shelf.", { cause: error });
  }

  redirect(journalHref(movedId, true));
}
