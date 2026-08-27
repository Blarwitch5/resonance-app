import { Bookmark, BookOpen, Library } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { AddReleaseForm } from "@/app/explorer/add/[discogsId]/add-release-form";
import { moveWishlistToShelfAction } from "@/app/explorer/actions";
import { AppShell } from "@/components/layouts/app-shell";
import { BackLink } from "@/components/ui/back-link";
import { Button, ButtonLink } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { CoverArt } from "@/components/ui/cover-art";
import { Notice } from "@/components/ui/notice";
import { PressingArtist, PressingThreads } from "@/components/ui/pressing-threads";
import { RecordSides } from "@/components/ui/record-sides";
import { ShelfKin } from "@/components/ui/shelf-kin";
import {
  confirmFormats,
  confirmInitialFormat,
  confirmOwnedCopy,
  confirmWaitingCopy,
  type ShelfCopy,
} from "@/lib/collection/confirm";
import { collectionHref, journalFromHref } from "@/lib/collection/href";
import { pickShelfKin, SHELF_KIN_LIMIT } from "@/lib/collection/kin";
import { toPressingThreads } from "@/lib/collection/pressing-threads";
import { listCollectionItems, listShelfCopies } from "@/lib/collection/repository";
import { decadeLabel } from "@/lib/collection/stats";
import { decadeFromYear } from "@/lib/collection/types";
import { loadDeezerPreviews } from "@/lib/deezer/client";
import { attachDeezerPreviews } from "@/lib/deezer/preview";
import { toRecordSides, toReleasePreview } from "@/lib/discogs/adapter";
import { getDiscogsRelease } from "@/lib/discogs/client";
import { explorerBackHref } from "@/lib/discogs/href";
import { journalDocumentTitle } from "@/lib/document-title";
import { toErrorMessage } from "@/lib/errors";
import { requireSession } from "@/lib/session";
import { getUserSettings } from "@/lib/settings/repository";
import { enabledFormats, preferredFormat } from "@/lib/settings/types";

interface AddReleasePageProps {
  params: Promise<{ discogsId: string }>;
  searchParams: Promise<{ from?: string }>;
}

const loadConfirmRelease = cache(async (discogsId: number, userId: string) => {
  try {
    const releasePromise = getDiscogsRelease(discogsId);
    const settingsPromise = getUserSettings(userId);
    const copiesPromise = listShelfCopies(userId, discogsId);
    const release = await releasePromise;
    const preview = toReleasePreview(release);
    const decade = decadeFromYear(preview.year);
    const [settings, copies, previews, artistRecords, decadeRecords] = await Promise.all([
      settingsPromise,
      copiesPromise,
      loadDeezerPreviews(preview.artist, preview.title),
      listCollectionItems(userId, {
        kind: "owned",
        artist: preview.artist,
        pageSize: SHELF_KIN_LIMIT + 1,
      }),
      decade !== undefined
        ? listCollectionItems(userId, {
            kind: "owned",
            decade,
            pageSize: SHELF_KIN_LIMIT + 1,
          })
        : Promise.resolve([]),
    ]);

    return {
      ok: true as const,
      release,
      settings,
      copies,
      artistRecords,
      decadeRecords,
      sides: attachDeezerPreviews(toRecordSides(release), previews),
    };
  } catch (error) {
    return { ok: false as const, message: toErrorMessage(error) };
  }
});

export async function generateMetadata({ params }: AddReleasePageProps): Promise<Metadata> {
  const session = await requireSession();
  const { discogsId: rawId } = await params;
  const discogsId = Number.parseInt(rawId, 10);

  if (!Number.isInteger(discogsId) || discogsId <= 0) {
    return { title: "Confirm" };
  }

  const loaded = await loadConfirmRelease(discogsId, session.user.id);

  if (!loaded.ok) {
    return { title: "Confirm" };
  }

  const preview = toReleasePreview(loaded.release);
  return { title: journalDocumentTitle(preview.title, preview.artist) };
}

export default async function AddReleasePage({ params, searchParams }: AddReleasePageProps) {
  const session = await requireSession();

  const [{ discogsId: rawId }, query] = await Promise.all([params, searchParams]);
  const discogsId = Number.parseInt(rawId, 10);

  if (!Number.isInteger(discogsId) || discogsId <= 0) {
    notFound();
  }

  const loaded = await loadConfirmRelease(discogsId, session.user.id);

  if (!loaded.ok) {
    return (
      <AppShell>
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold text-text">This release could not be opened.</h1>
          <Notice tone="error">{loaded.message}</Notice>
        </div>
      </AppShell>
    );
  }

  const preview = toReleasePreview(loaded.release);
  const sides = loaded.sides;
  const threads = toPressingThreads({
    format: preview.format,
    title: preview.title,
    artist: preview.artist,
    year: preview.year,
    label: preview.label,
    genres: preview.genres,
    barcode: preview.barcode,
    discogsId: preview.discogsId,
    country: preview.country,
    catalogNumber: preview.catalogNumber,
    formatNames: preview.formatNames,
    creditLine: preview.creditLine,
  });
  const formats = enabledFormats(loaded.settings);
  const remaining = confirmFormats(formats, loaded.copies);
  const owned = confirmOwnedCopy(loaded.copies);
  const waiting = confirmWaitingCopy(loaded.copies);
  const defaultFormat = confirmInitialFormat(
    remaining,
    preview.format,
    preferredFormat(formats, loaded.settings.defaultFormat),
  );
  const decade = decadeFromYear(preview.year);
  const kin = pickShelfKin({
    currentId: owned?.id ?? "",
    artist: preview.artist,
    artistHref: collectionHref({ artist: preview.artist }),
    artistRecords: loaded.artistRecords,
    decadeLabel: decade !== undefined ? decadeLabel(decade) : null,
    decadeHref: decade !== undefined ? collectionHref({ decade }) : null,
    decadeRecords: loaded.decadeRecords,
    isOnShelf: Boolean(owned),
  });

  return (
    <AppShell>
      <BackLink href={explorerBackHref(query.from)}>Back to Explorer</BackLink>
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium tracking-[0.2em] text-primary uppercase">Confirm</p>
        <h1 className="text-2xl font-semibold tracking-tight text-text">{preview.title}</h1>
        <PressingArtist name={threads.artist} href={threads.artistHref} />
      </header>

      <div className="grid items-start gap-8 sm:grid-cols-[minmax(0,16rem)_1fr]">
        <CoverArt
          url={preview.coverUrl}
          alt={`Cover of ${preview.title} by ${preview.artist}`}
          sizes="(max-width: 640px) 80vw, 256px"
          priority
        />
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <PressingThreads threads={threads} showLinks />
          </div>
          <RecordSides
            sides={sides}
            artist={preview.artist}
            title={preview.title}
            coverUrl={preview.coverUrl}
          />
          <ConfirmShelf copies={{ owned, waiting }} title={preview.title} from={query.from} />
          {kin ? (
            <ShelfKin headline={kin.headline} href={kin.href} records={kin.records} from={query.from} />
          ) : null}
          {preview.discogsId && remaining.length > 0 && defaultFormat ? (
            <AddReleaseForm
              discogsId={preview.discogsId}
              defaultFormat={defaultFormat}
              formats={remaining}
            />
          ) : loaded.copies.length > 0 && remaining.length === 0 ? (
            <p className="text-sm leading-6 text-text-secondary">This pressing already lives with you.</p>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}

function ConfirmShelf({
  copies,
  title,
  from,
}: {
  copies: { owned: ShelfCopy | undefined; waiting: ShelfCopy | undefined };
  title: string;
  from?: string;
}) {
  const { owned, waiting } = copies;

  if (!owned && !waiting) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      {owned ? (
        <div className="flex flex-col gap-3">
          <StatusPill tone="primary" icon={Library}>
            On your shelf
          </StatusPill>
          <ButtonLink
            href={journalFromHref(owned.id, from)}
            variant="ghost"
            className="self-start"
            aria-label={`Open ${title} in your journal`}
            isRecordLink
          >
            <BookOpen className="size-4 shrink-0" aria-hidden />
            Open journal
          </ButtonLink>
        </div>
      ) : null}
      {waiting ? (
        <div className="flex flex-col gap-3">
          <StatusPill tone="secondary" icon={Bookmark}>
            Wishlisted
          </StatusPill>
          <form action={moveWishlistToShelfAction}>
            <input type="hidden" name="itemId" value={waiting.id} />
            <Button type="submit">
              <Library className="size-4 shrink-0" aria-hidden />
              Move to shelf
            </Button>
          </form>
          <ButtonLink
            href={journalFromHref(waiting.id, from)}
            variant="ghost"
            className="self-start"
            aria-label={`Open waiting ${title} in your journal`}
            isRecordLink
          >
            <BookOpen className="size-4 shrink-0" aria-hidden />
            Open journal
          </ButtonLink>
        </div>
      ) : null}
    </div>
  );
}
