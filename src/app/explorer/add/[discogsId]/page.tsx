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
import { PressingText } from "@/components/ui/pressing-text";
import { PressingArtist, PressingThreads } from "@/components/ui/pressing-threads";
import { RecordSides } from "@/components/ui/record-sides";
import { ShelfKin } from "@/components/ui/shelf-kin";
import { eyebrowClass, pageTitleClass } from "@/components/ui/type";
import {
  confirmFormats,
  confirmInitialFormat,
  confirmOwnedCopy,
  confirmWaitingCopy,
  type ShelfCopy,
} from "@/lib/collection/confirm";
import { collectionHref, journalFromHref } from "@/lib/collection/href";
import { pickShelfKin, SHELF_KIN_LIMIT } from "@/lib/collection/kin";
import { confirmCoverStickyClass } from "@/lib/collection/layout";
import { toPressingThreads } from "@/lib/collection/pressing-threads";
import { listCollectionItems, listShelfCopies } from "@/lib/collection/repository";
import { decadeFromYear } from "@/lib/collection/types";
import { loadDeezerPreviews } from "@/lib/deezer/client";
import { attachDeezerPreviews } from "@/lib/deezer/preview";
import { toRecordSides, toReleasePreview } from "@/lib/discogs/adapter";
import { getDiscogsRelease } from "@/lib/discogs/client";
import { explorerBackHref } from "@/lib/discogs/href";
import { journalDocumentTitle } from "@/lib/document-title";
import { toErrorMessage } from "@/lib/errors";
import { coverAlt, decadeName } from "@/lib/i18n/labels";
import { getLocale } from "@/lib/i18n/locale";
import { t } from "@/lib/i18n/translate";
import { requireSession } from "@/lib/session";
import { getUserSettings } from "@/lib/settings/repository";
import { enabledFormats, preferredFormat, type Locale } from "@/lib/settings/types";

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
    return { title: t(await getLocale(), "document.confirm") };
  }

  const loaded = await loadConfirmRelease(discogsId, session.user.id);

  if (!loaded.ok) {
    return { title: t(await getLocale(), "document.confirm") };
  }

  const preview = toReleasePreview(loaded.release);
  return { title: journalDocumentTitle(preview.title, preview.artist, loaded.settings.locale) };
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
    const locale = await getLocale();
    return (
      <AppShell>
        <div className="flex flex-col gap-3">
          <h1 className={pageTitleClass}>{t(locale, "explorer.couldNotOpen")}</h1>
          <Notice tone="error">{loaded.message}</Notice>
        </div>
      </AppShell>
    );
  }

  const locale = loaded.settings.locale;
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
  }, locale);
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
    decadeLabel: decade !== undefined ? decadeName(locale, decade) : null,
    decadeHref: decade !== undefined ? collectionHref({ decade }) : null,
    decadeRecords: loaded.decadeRecords,
    isOnShelf: Boolean(owned),
    locale,
  });

  return (
    <AppShell>
      <BackLink href={explorerBackHref(query.from)}>{t(locale, "back.explorer")}</BackLink>
      <header className="flex flex-col gap-2">
        <p className={eyebrowClass}>{t(locale, "common.confirm")}</p>
        <h1 className={pageTitleClass}>
          <PressingText>{preview.title}</PressingText>
        </h1>
        <PressingArtist name={threads.artist} href={threads.artistHref} />
      </header>

      <div className="grid items-start gap-8 sm:grid-cols-[minmax(0,16rem)_1fr]">
        <div className={confirmCoverStickyClass}>
          <CoverArt
            url={preview.coverUrl}
            compactUrl={preview.coverThumbUrl}
            alt={coverAlt(locale, preview.title, preview.artist)}
            sizes="(max-width: 640px) 80vw, 256px"
            priority
          />
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <PressingThreads threads={threads} showLinks locale={locale} />
          </div>
          <RecordSides
            sides={sides}
            artist={preview.artist}
            title={preview.title}
            coverUrl={preview.coverUrl}
            compactUrl={preview.coverThumbUrl}
            locale={locale}
          />
          <ConfirmShelf copies={{ owned, waiting }} title={preview.title} from={query.from} locale={locale} />
          {kin ? (
            <ShelfKin headline={kin.headline} href={kin.href} records={kin.records} from={query.from} locale={locale} />
          ) : null}
          {preview.discogsId && remaining.length > 0 && defaultFormat ? (
            <AddReleaseForm
              discogsId={preview.discogsId}
              defaultFormat={defaultFormat}
              formats={remaining}
            />
          ) : loaded.copies.length > 0 && remaining.length === 0 ? (
            <p className="text-sm leading-6 text-text-secondary">{t(locale, "explorer.alreadyLives")}</p>
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
  locale,
}: {
  copies: { owned: ShelfCopy | undefined; waiting: ShelfCopy | undefined };
  title: string;
  from?: string;
  locale: Locale;
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
            {t(locale, "explorer.onYourShelf")}
          </StatusPill>
          <ButtonLink
            href={journalFromHref(owned.id, from)}
            variant="ghost"
            className="self-start"
            aria-label={t(locale, "explorer.openJournalAria", { title })}
            isRecordLink
          >
            <BookOpen className="size-4 shrink-0" aria-hidden />
            {t(locale, "explorer.openJournal")}
          </ButtonLink>
        </div>
      ) : null}
      {waiting ? (
        <div className="flex flex-col gap-3">
          <StatusPill tone="secondary" icon={Bookmark}>
            {t(locale, "explorer.wishlisted")}
          </StatusPill>
          <form action={moveWishlistToShelfAction}>
            <input type="hidden" name="itemId" value={waiting.id} />
            <Button type="submit">
              <Library className="size-4 shrink-0" aria-hidden />
              {t(locale, "explorer.moveToShelf")}
            </Button>
          </form>
          <ButtonLink
            href={journalFromHref(waiting.id, from)}
            variant="ghost"
            className="self-start"
            aria-label={t(locale, "explorer.openWaitingAria", { title })}
            isRecordLink
          >
            <BookOpen className="size-4 shrink-0" aria-hidden />
            {t(locale, "explorer.openJournal")}
          </ButtonLink>
        </div>
      ) : null}
    </div>
  );
}
