"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { viewModeReturnHref } from "@/components/return-path";
import { feedPageCount, type FeedLoadResult } from "@/lib/collection/feed";
import { countCollectionItems, listCollectionItems, SHELF_PAGE_SIZE } from "@/lib/collection/repository";
import {
  collectionListenFromParams,
  MAX_COLLECTION_PAGE,
  toShelfCard,
  type CollectionSearchParams,
  type ShelfCard,
} from "@/lib/collection/types";
import { ValidationError } from "@/lib/errors";
import { localizedError } from "@/lib/i18n/action-error";
import { t } from "@/lib/i18n/translate";
import { requireSession } from "@/lib/session";
import { getUserSettings, upsertUserSettings } from "@/lib/settings/repository";
import { enabledFormats, parseViewMode } from "@/lib/settings/types";

export async function saveViewModeAction(formData: FormData) {
  const session = await requireSession();
  const current = await getUserSettings(session.user.id);
  const view = parseViewMode(String(formData.get("view") ?? ""));

  if (!view) {
    throw new ValidationError(t(current.locale, "error.layout"));
  }

  await upsertUserSettings(session.user.id, { ...current, viewMode: view });
  revalidatePath("/collection");
  revalidatePath("/explorer");
  revalidatePath("/profile");
  redirect(viewModeReturnHref(String(formData.get("next") ?? "")));
}

export async function loadMoreCollectionAction(
  params: CollectionSearchParams,
): Promise<FeedLoadResult<ShelfCard>> {
  const session = await requireSession();
  const settings = await getUserSettings(session.user.id);
  const { listen, page } = collectionListenFromParams(params, enabledFormats(settings));
  const filters = {
    kind: "owned" as const,
    ...listen,
  };

  try {
    const [items, total] = await Promise.all([
      listCollectionItems(session.user.id, {
        ...filters,
        page,
        pageSize: SHELF_PAGE_SIZE,
      }),
      countCollectionItems(session.user.id, filters),
    ]);

    return {
      items: items.map(toShelfCard),
      pages: feedPageCount(total, SHELF_PAGE_SIZE, MAX_COLLECTION_PAGE),
    };
  } catch (error) {
    return { error: localizedError(settings.locale, error) };
  }
}
