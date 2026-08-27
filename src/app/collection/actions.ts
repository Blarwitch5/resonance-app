"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { collectionHref } from "@/lib/collection/href";
import {
  parseArtistFilter,
  parseCollectionPage,
  parseCollectionSort,
  parseFoundFilter,
  parseGenreFilter,
  parseKeptClose,
  parseLabelFilter,
  parseMediaCondition,
  parseMediaFormat,
  parseWhenFilter,
  whenListenFromParams,
} from "@/lib/collection/types";
import { ValidationError } from "@/lib/errors";
import { requireSession } from "@/lib/session";
import { getUserSettings, upsertUserSettings } from "@/lib/settings/repository";
import { parseViewMode } from "@/lib/settings/types";

export async function saveViewModeAction(formData: FormData) {
  const session = await requireSession();
  const view = parseViewMode(String(formData.get("view") ?? ""));

  if (!view) {
    throw new ValidationError("Choose a shelf layout.");
  }

  const current = await getUserSettings(session.user.id);
  await upsertUserSettings(session.user.id, { ...current, viewMode: view });
  revalidatePath("/collection");
  revalidatePath("/profile");
  redirect(
    collectionHref({
      format: parseMediaFormat(String(formData.get("format") ?? "") || undefined),
      query: String(formData.get("q") ?? "").trim() || undefined,
      sort: parseCollectionSort(String(formData.get("sort") ?? "") || undefined),
      keptClose: parseKeptClose(String(formData.get("kept") ?? "")),
      artist: parseArtistFilter(String(formData.get("artist") ?? "") || undefined),
      genre: parseGenreFilter(String(formData.get("genre") ?? "") || undefined),
      label: parseLabelFilter(String(formData.get("label") ?? "") || undefined),
      found: parseFoundFilter(String(formData.get("found") ?? "") || undefined),
      condition: parseMediaCondition(String(formData.get("condition") ?? "") || undefined),
      when: parseWhenFilter(String(formData.get("when") ?? "") || undefined),
      arrived: parseWhenFilter(String(formData.get("arrived") ?? "") || undefined),
      ...whenListenFromParams(
        String(formData.get("year") ?? "") || undefined,
        String(formData.get("decade") ?? "") || undefined,
      ),
      page: parseCollectionPage(String(formData.get("page") ?? "")),
    }),
  );
}
