import "server-only";

import { addCollectionItem } from "@/lib/collection/repository";
import type { CollectionKind, MediaFormat } from "@/lib/collection/types";
import { toReleaseDraft } from "@/lib/discogs/adapter";
import { getDiscogsRelease } from "@/lib/discogs/client";

export async function addDiscogsRelease(input: {
  userId: string;
  discogsId: number;
  format: MediaFormat;
  kind: CollectionKind;
  notes?: string | null;
}) {
  const release = await getDiscogsRelease(input.discogsId);

  return addCollectionItem(
    input.userId,
    {
      ...toReleaseDraft(release),
      format: input.format,
    },
    input.kind,
    input.notes,
  );
}
