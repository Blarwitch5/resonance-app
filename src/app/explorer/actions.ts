"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { addDiscogsRelease } from "@/lib/collection/add-release";
import { readCoverUpload } from "@/lib/collection/cover";
import { keepCover, restCover } from "@/lib/collection/cover-blob";
import type { FeedLoadResult } from "@/lib/collection/feed";
import { journalHref } from "@/lib/collection/href";
import { toManualReleaseDraft } from "@/lib/collection/manual";
import { addCollectionItem, listShelfPresence, updateCollectionItem } from "@/lib/collection/repository";
import {
  MEDIA_FORMATS,
  parseGenreFilter,
  parseLabelFilter,
  parseMediaFormat,
  type CollectionKind,
  type ExplorerFeedHit,
  type MediaFormat,
  type ShelfPresence,
} from "@/lib/collection/types";
import { toReleaseDraft, toReleaseDraftFromSearch } from "@/lib/discogs/adapter";
import { getDiscogsRelease, searchDiscogs } from "@/lib/discogs/client";
import {
  explorerWhenFromParams,
  hasExplorerListen,
  MAX_SEARCH_PAGE,
  parseSearchPage,
  resolveExplorerFormat,
  type ExplorerFormatParam,
  type ExplorerQuery,
} from "@/lib/discogs/href";
import { AppError, DatabaseError, ValidationError } from "@/lib/errors";
import { localizedError } from "@/lib/i18n/action-error";
import { getLocale } from "@/lib/i18n/locale";
import { getSession, requireSession } from "@/lib/session";
import { getUserSettings, loadUserSettings } from "@/lib/settings/repository";
import { enabledFormats, preferredFormat } from "@/lib/settings/types";

export interface AddReleaseState {
  error: string | null;
  href: string | null;
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
    const created = await addDiscogsRelease({
      userId: session.user.id,
      discogsId,
      format: parseFormatOrThrow(formData.get("format")),
      kind,
      notes: String(formData.get("notes") ?? ""),
    });

    createdId = created.id;
    isOwned = kind === "owned";
  } catch (error) {
    return { error: localizedError((await loadUserSettings(session.user.id)).locale, error), href: null };
  }

  revalidatePath("/collection");
  revalidatePath("/explorer");
  revalidatePath("/profile");
  return { error: null, href: journalHref(createdId, isOwned) };
}

export async function addManualReleaseAction(
  _previous: AddReleaseState,
  formData: FormData,
): Promise<AddReleaseState> {
  const session = await requireSession();
  let createdId: string;
  let isOwned = false;
  let coverUrl: string | null = null;

  try {
    const kind = parseKind(formData.get("kind"));
    const draft = toManualReleaseDraft({
      artist: String(formData.get("artist") ?? ""),
      title: String(formData.get("title") ?? ""),
      format: parseFormatOrThrow(formData.get("format")),
      year: String(formData.get("year") ?? ""),
      label: String(formData.get("label") ?? ""),
      barcode: String(formData.get("barcode") ?? ""),
    });
    const coverFile = formData.get("cover");
    const coverRead = await readCoverUpload(coverFile instanceof File ? coverFile : null);

    if (coverRead.status === "invalid") {
      throw new ValidationError(coverRead.message);
    }

    if (coverRead.status === "ready") {
      coverUrl = await keepCover(session.user.id, coverRead.bytes);
    }

    const created = await addCollectionItem(
      session.user.id,
      { ...draft, coverUrl },
      kind,
      String(formData.get("notes") ?? ""),
    );

    createdId = created.id;
    isOwned = kind === "owned";
  } catch (error) {
    await restCover(coverUrl);
    return { error: localizedError((await loadUserSettings(session.user.id)).locale, error), href: null };
  }

  revalidatePath("/collection");
  revalidatePath("/explorer");
  revalidatePath("/profile");
  return { error: null, href: journalHref(createdId, isOwned) };
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
    return { error: localizedError((await loadUserSettings(session.user.id)).locale, new ValidationError("This pressing could not be kept waiting.")) };
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
    return { error: localizedError((await loadUserSettings(session.user.id)).locale, error) };
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

export async function loadMoreExplorerAction(params: {
  q?: string;
  page?: string;
  format?: string;
  genre?: string;
  label?: string;
  decade?: string;
  year?: string;
}): Promise<FeedLoadResult<ExplorerFeedHit>> {
  const session = await getSession();
  const settings = session ? await getUserSettings(session.user.id) : null;
  const locale = settings?.locale ?? (await getLocale());
  const query = (params.q ?? "").trim();
  const genre = parseGenreFilter(params.genre);
  const label = parseLabelFilter(params.label);
  const { year, decade } = explorerWhenFromParams(params.year, params.decade);
  const enabled = settings ? enabledFormats(settings) : MEDIA_FORMATS.slice();
  const preferred = preferredFormat(enabled, settings?.defaultFormat);
  const format = resolveExplorerFormat(params.format, enabled, preferred);
  const formatParam: ExplorerFormatParam = params.format === "all" ? "all" : (format ?? "all");
  const listen: ExplorerQuery = {
    query: query.length > 0 ? query : undefined,
    page: parseSearchPage(params.page),
    format: formatParam,
    genre,
    label,
    decade,
    year,
  };

  if (!hasExplorerListen(listen)) {
    return { items: [], pages: 1 };
  }

  try {
    const outcome = await searchDiscogs({
      ...listen,
      format: listen.format === "all" ? undefined : listen.format,
    });
    const drafts = outcome.hits.map(toReleaseDraftFromSearch);
    const discogsIds = drafts.flatMap((draft) => (draft.discogsId ? [draft.discogsId] : []));
    const presence =
      session && discogsIds.length > 0
        ? await listShelfPresence(session.user.id, discogsIds)
        : new Map<number, Exclude<ShelfPresence, { status: "absent" }>>();

    return {
      items: drafts.map((draft) => ({
        draft,
        presence: draft.discogsId ? (presence.get(draft.discogsId) ?? { status: "absent" }) : { status: "absent" },
      })),
      pages: Math.min(outcome.pages, MAX_SEARCH_PAGE),
    };
  } catch (error) {
    return { error: localizedError(locale, error) };
  }
}
