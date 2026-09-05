import { Bookmark, Library } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { cache } from "react";

import { ItemMemoryForm } from "@/app/collection/[id]/item-memory-form";
import { KeptCloseForm } from "@/app/collection/[id]/kept-close-form";
import { ReleaseRecordForm } from "@/app/collection/[id]/release-record-form";
import { moveWishlistToShelfAction } from "@/app/explorer/actions";
import { ArrivalWave } from "@/components/arrival-wave";
import { AppShell } from "@/components/layouts/app-shell";
import { listBackHref, listBackLabel } from "@/components/return-path";
import { BackLink } from "@/components/ui/back-link";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { CoverArt } from "@/components/ui/cover-art";
import { PressingLinks } from "@/components/ui/pressing-links";
import { PressingThreads } from "@/components/ui/pressing-threads";
import { RecordSides } from "@/components/ui/record-sides";
import { ShelfKin } from "@/components/ui/shelf-kin";
import { ShelfNeighbors } from "@/components/ui/shelf-neighbors";
import { catalogToRemember } from "@/lib/collection/factory";
import { collectionHref, parseWaveFlag } from "@/lib/collection/href";
import { pickShelfKin, SHELF_KIN_LIMIT } from "@/lib/collection/kin";
import { journalCoverStickyClass } from "@/lib/collection/layout";
import { toPressingThreads } from "@/lib/collection/pressing-threads";
import { getCollectionItem, listCollectionItems, listShelfNeighbors, updateCollectionItem } from "@/lib/collection/repository";
import { decadeFromYear } from "@/lib/collection/types";
import { loadDeezerPreviews } from "@/lib/deezer/client";
import { attachDeezerPreviews } from "@/lib/deezer/preview";
import { getMarketplaceAsk, getReleaseListen } from "@/lib/discogs/client";
import { marketplaceVoice } from "@/lib/discogs/market";
import { journalDocumentTitle } from "@/lib/document-title";
import { DiscogsError, NotFoundError } from "@/lib/errors";
import { coverAlt, decadeName } from "@/lib/i18n/labels";
import { getLocale } from "@/lib/i18n/locale";
import { t } from "@/lib/i18n/translate";
import { requireSession } from "@/lib/session";
import { getUserSettings } from "@/lib/settings/repository";

interface CollectionItemPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ wave?: string; from?: string }>;
}

const readJournalItem = cache(async (id: string) => {
  const session = await requireSession();

  try {
    return await getCollectionItem(session.user.id, id);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return null;
    }

    throw error;
  }
});

export async function generateMetadata({ params }: CollectionItemPageProps): Promise<Metadata> {
  const { id } = await params;
  const item = await readJournalItem(id);

  if (!item) {
    return { title: t(await getLocale(), "notFound.document") };
  }

  const locale = await getLocale();
  return { title: journalDocumentTitle(item.title, item.artist, locale) };
}

export default async function CollectionItemPage({ params, searchParams }: CollectionItemPageProps) {
  const session = await requireSession();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const item = await readJournalItem(id);

  if (!item) {
    notFound();
  }
  const isArrivalWave = parseWaveFlag(query.wave) && !item.isWishlist;
  const decade = decadeFromYear(item.year);
  const kinPageSize = SHELF_KIN_LIMIT + (item.isWishlist ? 0 : 1);
  const settings = await getUserSettings(session.user.id);
  const [pressing, neighbors, previews, artistRecords, decadeRecords, marketAsk] = await Promise.all([
    loadPressingListen(item.discogsId),
    listShelfNeighbors(session.user.id, item.id, item.isWishlist, item.createdAt),
    loadDeezerPreviews(item.artist, item.title),
    listCollectionItems(session.user.id, {
      kind: "owned",
      artist: item.artist,
      pageSize: kinPageSize,
    }),
    decade !== undefined
      ? listCollectionItems(session.user.id, {
          kind: "owned",
          decade,
          pageSize: kinPageSize,
        })
      : Promise.resolve([]),
    settings.marketValueEnabled && item.discogsId !== null
      ? getMarketplaceAsk(item.discogsId)
      : Promise.resolve(null),
  ]);
  const marketLine = marketAsk ? marketplaceVoice(settings.locale, marketAsk) : null;
  const kin = pickShelfKin({
    currentId: item.id,
    artist: item.artist,
    artistHref: collectionHref({ artist: item.artist }),
    artistRecords,
    decadeLabel: decade !== undefined ? decadeName(settings.locale, decade) : null,
    decadeHref: decade !== undefined ? collectionHref({ decade }) : null,
    decadeRecords,
    isOnShelf: !item.isWishlist,
    locale: settings.locale,
  });
  const threads = toPressingThreads({
    format: item.format,
    title: item.title,
    artist: item.artist,
    year: item.year,
    label: item.label,
    genres: item.genres,
    barcode: item.barcode,
    discogsId: item.discogsId,
    condition: item.condition,
    purchaseLocation: item.purchaseLocation,
    purchaseDate: item.purchaseDate,
    country: pressing.country,
    catalogNumber: item.catalogNumber ?? pressing.catalogNumber,
    formatNames: pressing.formatNames,
    creditLine: pressing.creditLine,
  }, settings.locale);
  const remembered = catalogToRemember(item.catalogNumber, pressing.catalogNumber);

  const coverThumbUrl = !item.coverThumbUrl ? pressing.coverThumbUrl : null;

  if (remembered || coverThumbUrl) {
    after(() => {
      void rememberJournalStill(session.user.id, item.id, {
        catalogNumber: remembered,
        coverThumbUrl,
      });
    });
  }
  const sides = attachDeezerPreviews(pressing.sides, previews);
  const backHref = listBackHref(query.from, "/collection");

  return (
    <AppShell>
      {isArrivalWave ? <ArrivalWave format={item.format} title={item.title} /> : null}
      <BackLink href={backHref}>{listBackLabel(backHref, settings.locale)}</BackLink>
      <ShelfNeighbors before={neighbors.before} after={neighbors.after} from={query.from} />
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,20rem)_1fr]">
        <div className={journalCoverStickyClass}>
          <CoverArt
            url={item.coverUrl}
            compactUrl={item.coverThumbUrl}
            alt={coverAlt(settings.locale, item.title, item.artist)}
            sizes="(max-width: 1024px) 80vw, 320px"
            className={isArrivalWave ? "motion-safe:ripple-in" : undefined}
            priority
          />
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <PressingThreads threads={threads} title={item.title} showArtist />
            {marketLine ? (
              <p className="text-sm leading-6 text-text-secondary">{marketLine}</p>
            ) : null}
            {item.isWishlist ? (
              <div className="flex flex-wrap gap-2">
                <StatusPill tone="secondary" icon={Bookmark}>
                  {t(settings.locale, "journal.wishlisted")}
                </StatusPill>
              </div>
            ) : null}
            <KeptCloseForm id={item.id} isFavorite={item.isFavorite} />
            <PressingLinks
              href={threads.discogs?.href}
              releaseId={threads.discogs?.id}
              title={threads.title}
              artist={threads.artist}
              elsewhereHref={threads.elsewhereHref}
              locale={settings.locale}
            />
          </div>
          {item.isWishlist ? (
            <form action={moveWishlistToShelfAction}>
              <input type="hidden" name="itemId" value={item.id} />
              <Button type="submit">
                <Library className="size-4 shrink-0" aria-hidden />
                {t(settings.locale, "journal.moveToShelf")}
              </Button>
            </form>
          ) : null}
          <RecordSides
            sides={sides}
            artist={item.artist}
            title={item.title}
            coverUrl={item.coverUrl}
            compactUrl={item.coverThumbUrl}
            locale={settings.locale}
            keepClose={
              <KeptCloseForm id={item.id} isFavorite={item.isFavorite} variant="icon" />
            }
          />
          {kin ? (
            <ShelfKin
              headline={kin.headline}
              href={kin.href}
              records={kin.records}
              from={query.from}
              locale={settings.locale}
            />
          ) : null}
          <ItemMemoryForm
            id={item.id}
            notes={item.notes}
            condition={item.condition}
            purchaseLocation={item.purchaseLocation}
            purchaseDate={item.purchaseDate ? item.purchaseDate.toISOString().slice(0, 10) : null}
          />
          <ReleaseRecordForm id={item.id} title={item.title} />
        </div>
      </div>
    </AppShell>
  );
}

async function rememberJournalStill(
  userId: string,
  id: string,
  patch: { catalogNumber: string | null; coverThumbUrl: string | null },
): Promise<void> {
  try {
    await updateCollectionItem(userId, id, {
      ...(patch.catalogNumber ? { catalogNumber: patch.catalogNumber } : {}),
      ...(patch.coverThumbUrl ? { coverThumbUrl: patch.coverThumbUrl } : {}),
    });
  } catch {
    return;
  }
}

async function loadPressingListen(discogsId: number | null) {
  if (discogsId === null) {
    return {
      sides: [],
      country: null,
      catalogNumber: null,
      formatNames: [],
      creditLine: null,
      coverThumbUrl: null,
    };
  }

  try {
    return await getReleaseListen(discogsId);
  } catch (error) {
    if (error instanceof DiscogsError) {
      return {
        sides: [],
        country: null,
        catalogNumber: null,
        formatNames: [],
        creditLine: null,
        coverThumbUrl: null,
      };
    }

    throw error;
  }
}
