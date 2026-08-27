import { ChevronLeft, ChevronRight, Disc3, FaceSlightlySmilingPlus, Heart, MoonStar, ScanSearch, SearchX } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { KeptCloseSlot } from "@/app/collection/[id]/kept-close-form";
import { ReleaseSlot } from "@/app/collection/[id]/release-record-form";
import { CollectionSearch } from "@/app/collection/collection-search";
import { AppShell } from "@/components/layouts/app-shell";
import { AddRecordFab } from "@/components/ui/add-record-fab";
import { ButtonLink } from "@/components/ui/button";
import { CollectionListenSheet } from "@/components/ui/listen-sheet";
import { FacetChips } from "@/components/ui/facet-chips";
import { FormatChips, selectedFormat } from "@/components/ui/format-chips";
import { KeptChip } from "@/components/ui/kept-chip";
import { PageHeader } from "@/components/ui/page-header";
import { RecordMenu } from "@/components/ui/record-menu";
import { RecordRow } from "@/components/ui/record-row";
import { RecordTile } from "@/components/ui/record-tile";
import { SortChips } from "@/components/ui/sort-chips";
import { ViewChips } from "@/components/ui/view-chips";
import { collectionHref, journalFromHref } from "@/lib/collection/href";
import { collectionListenCount, collectionShelfHref } from "@/lib/collection/listen";
import { memoryExcerpt } from "@/lib/collection/memory";
import { recordMenuElsewhereHref } from "@/lib/collection/record-menu";
import { shelfCardThreads } from "@/lib/collection/shelf-threads";
import { countCollectionItems, hasShelfItems, listCollectionItems, SHELF_PAGE_SIZE } from "@/lib/collection/repository";
import { decadeLabel } from "@/lib/collection/stats";
import {
  CONDITION_LABELS,
  foundDateLabel,
  isCanonicalWhenParams,
  MAX_COLLECTION_PAGE,
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
  type CollectionQuery,
  type CollectionSort,
  type MediaCondition,
  type MediaFormat,
} from "@/lib/collection/types";
import { discogsReleaseHref, explorerListenFromShelf, explorerSearchHref, hasExplorerListen } from "@/lib/discogs/href";
import { collectionDocumentTitle } from "@/lib/document-title";
import { requireSession } from "@/lib/session";
import { getUserSettings } from "@/lib/settings/repository";
import { enabledFormats, type ViewMode } from "@/lib/settings/types";

export async function generateMetadata({ searchParams }: CollectionPageProps): Promise<Metadata> {
  const params = await searchParams;
  const pressed = whenListenFromParams(params.year, params.decade);
  return {
    title: collectionDocumentTitle({
      query: params.q,
      keptClose: parseKeptClose(params.kept),
      year: pressed.year,
      artist: parseArtistFilter(params.artist),
      decade: pressed.decade,
      label: parseLabelFilter(params.label),
      found: parseFoundFilter(params.found),
      when: parseWhenFilter(params.when),
      arrived: parseWhenFilter(params.arrived),
      genre: parseGenreFilter(params.genre),
      condition: parseMediaCondition(params.condition),
      format: parseMediaFormat(params.format),
    }),
  };
}

interface CollectionPageProps {
  searchParams: Promise<{
    format?: string;
    q?: string;
    sort?: string;
    page?: string;
    kept?: string;
    artist?: string;
    genre?: string;
    decade?: string;
    label?: string;
    found?: string;
    condition?: string;
    when?: string;
    arrived?: string;
    year?: string;
  }>;
}

export default async function CollectionPage({ searchParams }: CollectionPageProps) {
  const session = await requireSession();
  const [params, settings] = await Promise.all([searchParams, getUserSettings(session.user.id)]);

  if (settings.onboardedAt === null) {
    const hasItems = await hasShelfItems(session.user.id);

    if (!hasItems) {
      redirect("/welcome");
    }
  }

  const enabled = enabledFormats(settings);
  const requestedFormat = selectedFormat(params.format);
  const format = requestedFormat && enabled.includes(requestedFormat) ? requestedFormat : undefined;
  const query = (params.q ?? "").trim();
  const sort = parseCollectionSort(params.sort);
  const page = parseCollectionPage(params.page);
  const keptClose = parseKeptClose(params.kept);
  const artist = parseArtistFilter(params.artist);
  const genre = parseGenreFilter(params.genre);
  const { year, decade } = whenListenFromParams(params.year, params.decade);
  const label = parseLabelFilter(params.label);
  const found = parseFoundFilter(params.found);
  const condition = parseMediaCondition(params.condition);
  const when = parseWhenFilter(params.when);
  const arrived = parseWhenFilter(params.arrived);
  const listen: CollectionQuery = {
    format,
    query: query.length > 0 ? query : undefined,
    sort,
    keptClose,
    artist,
    genre,
    decade,
    label,
    found,
    condition,
    when,
    arrived,
    year,
  };

  if (!isCanonicalWhenParams(params.year, params.decade)) {
    redirect(collectionHref({ ...listen, page }));
  }

  const hasQuery = query.length > 0;
  const hasFacet = Boolean(
    artist ||
      genre ||
      label ||
      found ||
      condition ||
      when !== undefined ||
      arrived !== undefined ||
      decade !== undefined ||
      year !== undefined,
  );
  const filters = {
    kind: "owned" as const,
    ...listen,
  };
  const [items, total] = await Promise.all([
    listCollectionItems(session.user.id, {
      ...filters,
      page,
      pageSize: SHELF_PAGE_SIZE,
    }),
    countCollectionItems(session.user.id, filters),
  ]);
  const pages = Math.max(1, Math.min(MAX_COLLECTION_PAGE, Math.ceil(total / SHELF_PAGE_SIZE)));
  const elsewhereListen = explorerListenFromShelf({ ...listen, format });
  const hasElsewhere = hasExplorerListen(elsewhereListen);
  const elsewhere = explorerSearchHref(elsewhereListen);
  const listenCount = collectionListenCount(listen);
  const shelfHref = listenCount > 0 ? collectionShelfHref(listen) : undefined;

  return (
    <AppShell>
      <PageHeader
        title="Collection"
        description={shelfDescription(listen)}
        action={
          <div className="flex shrink-0 items-center gap-2">
            {total > 0 || hasQuery || hasFacet || keptClose ? (
              <ButtonLink href="/collection/tonight" variant="ghost" aria-label="Hear a record tonight">
                <MoonStar className="size-4 shrink-0" aria-hidden />
                Tonight
              </ButtonLink>
            ) : null}
            <ButtonLink href={elsewhere} className="hidden shrink-0 lg:inline-flex">
              <FaceSlightlySmilingPlus className="size-4 shrink-0" aria-hidden />
              Add
            </ButtonLink>
          </div>
        }
      />

      <div className="flex flex-col gap-4">
        <CollectionSearch listen={listen} query={query} />

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <FormatChips
              active={format}
              enabled={enabled}
              buildHref={(next) => collectionHref({ ...listen, format: next })}
              className="lg:hidden"
            />
            <div className="hidden lg:contents">
              <KeptChip listen={listen} />
              <FacetChips listen={listen} />
            </div>
            <CollectionListenSheet count={listenCount} clearHref={shelfHref}>
              <KeptChip listen={listen} />
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-text">Sort</p>
                <SortChips active={sort} listen={listen} />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-text">Layout</p>
                <ViewChips active={settings.viewMode} listen={listen} page={page} />
              </div>
            </CollectionListenSheet>
          </div>
          <div className="flex flex-wrap gap-2 lg:hidden">
            <FacetChips listen={listen} />
          </div>
          <div
            id="collection-listen"
            className="hidden gap-3 lg:flex lg:flex-wrap lg:items-center lg:justify-between"
          >
            <SortChips active={sort} listen={listen} />
            <ViewChips active={settings.viewMode} listen={listen} page={page} />
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <section className="rounded-rs-lg border border-border bg-surface px-6 py-16 text-center">
          {hasQuery || hasFacet ? (
            <SearchX className="mx-auto size-8 text-text-tertiary" aria-hidden />
          ) : keptClose ? (
            <Heart className="mx-auto size-8 text-text-tertiary" aria-hidden />
          ) : (
            <Disc3 className="mx-auto size-8 text-text-tertiary" aria-hidden />
          )}
          <p className="mt-4 text-lg font-medium text-text">
            {hasQuery || hasFacet
              ? "Nothing on the shelf matched that."
              : page > 1
                ? "Nothing more on this shelf."
                : keptClose
                  ? "Nothing marked yet."
                  : "Your shelf is waiting."}
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-text-secondary">
            {hasElsewhere
              ? "These sounds may still be waiting beyond the shelf."
              : hasFacet
                ? "Release this thread, or keep listening elsewhere."
                : page > 1
                  ? "The earlier records are still on the first rows."
                  : keptClose
                    ? "Keep a record close from the shelf, or from its journal."
                    : "Add this record to your resonance. Start with a vinyl, a cassette, or a CD that still lives in your memory."}
          </p>
          {hasElsewhere ? (
            <div className="mt-6 flex flex-col items-center gap-3">
              <ButtonLink href={elsewhere}>
                <ScanSearch className="size-4 shrink-0" aria-hidden />
                Hear it elsewhere
              </ButtonLink>
              {hasQuery ? (
                <ButtonLink href={collectionHref({ ...listen, query: undefined })} variant="ghost">
                  <SearchX className="size-4 shrink-0" aria-hidden />
                  Clear search
                </ButtonLink>
              ) : (
                <ButtonLink
                  href={collectionHref({ format, sort, keptClose })}
                  variant="ghost"
                >
                  <SearchX className="size-4 shrink-0" aria-hidden />
                  Show the whole shelf
                </ButtonLink>
              )}
            </div>
          ) : hasFacet ? (
            <ButtonLink
              href={collectionHref({ format, sort, keptClose })}
              variant="ghost"
              className="mt-6"
            >
              <SearchX className="size-4 shrink-0" aria-hidden />
              Show the whole shelf
            </ButtonLink>
          ) : page > 1 ? (
            <ButtonLink href={collectionHref({ ...listen })} variant="ghost" className="mt-6">
              <ChevronLeft className="size-4 shrink-0" aria-hidden />
              Back to the first records
            </ButtonLink>
          ) : keptClose ? (
            <ButtonLink href={collectionHref({ format, sort })} variant="ghost" className="mt-6">
              <Heart className="size-4 shrink-0" aria-hidden />
              Show the whole shelf
            </ButtonLink>
          ) : (
            <ButtonLink href="/explorer" className="mt-6">
              <FaceSlightlySmilingPlus className="size-4 shrink-0" aria-hidden />
              Add your first record
            </ButtonLink>
          )}
        </section>
      ) : (
        <>
          <CollectionRecords
            viewMode={settings.viewMode}
            items={items}
            listen={listen}
            sort={sort}
            arrived={arrived}
          />
          <ShelfPager listen={listen} page={page} pages={pages} />
          {hasElsewhere ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6 text-text-secondary">
                Other pressings of this may still be waiting.
              </p>
              <ButtonLink href={elsewhere} variant="ghost" className="self-start">
                <ScanSearch className="size-4 shrink-0" aria-hidden />
                Hear it elsewhere
              </ButtonLink>
            </div>
          ) : null}
        </>
      )}
      <AddRecordFab href={elsewhere} />
    </AppShell>
  );
}

function shelfDescription(listen: CollectionQuery): string {
  const thread: string[] = [];

  if (listen.artist) {
    thread.push(listen.artist);
  }

  if (listen.label) {
    thread.push(listen.label);
  }

  if (listen.found) {
    thread.push(`found in ${listen.found}`);
  }

  if (listen.when !== undefined) {
    thread.push(listen.found ? String(listen.when) : `found in ${listen.when}`);
  }

  if (listen.arrived !== undefined) {
    thread.push(`arrived in ${listen.arrived}`);
  }

  if (listen.condition) {
    thread.push(CONDITION_LABELS[listen.condition].toLowerCase());
  }

  if (listen.genre) {
    thread.push(listen.genre);
  }

  if (listen.decade !== undefined) {
    thread.push(`the ${decadeLabel(listen.decade)}`);
  }

  if (listen.year !== undefined) {
    thread.push(String(listen.year));
  }

  if (thread.length > 0) {
    const line = thread.join(" · ");
    return listen.keptClose ? `Kept close — ${line}.` : `Your shelf — ${line}.`;
  }

  return listen.keptClose ? "The ones you keep closest." : "Your records, kept close.";
}

interface ShelfRecord {
  id: string;
  title: string;
  artist: string;
  year: number | null;
  label: string | null;
  genres: string[];
  barcode: string | null;
  format: MediaFormat;
  coverUrl: string | null;
  notes: string | null;
  isFavorite: boolean;
  discogsId: number | null;
  purchaseDate: Date | null;
  purchaseLocation: string | null;
  condition: MediaCondition | null;
  createdAt: Date;
}

function CollectionRecords({
  viewMode,
  items,
  listen,
  sort,
  arrived,
}: {
  viewMode: ViewMode;
  items: ShelfRecord[];
  listen: CollectionQuery;
  sort: CollectionSort;
  arrived: number | undefined;
}) {
  if (viewMode === "list") {
    return (
      <>
        <ShelfRecordList
          className="flex flex-col gap-2 lg:hidden"
          layout="list"
          items={items}
          listen={listen}
          sort={sort}
          arrived={arrived}
        />
        <ShelfRecordList
          className="hidden grid-cols-4 gap-x-4 gap-y-6 lg:grid"
          layout="grid"
          items={items}
          listen={listen}
          sort={sort}
          arrived={arrived}
        />
      </>
    );
  }

  return (
    <ShelfRecordList
      className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4"
      layout="grid"
      items={items}
      listen={listen}
      sort={sort}
      arrived={arrived}
    />
  );
}

function ShelfRecordList({
  className,
  layout,
  items,
  listen,
  sort,
  arrived,
}: {
  className: string;
  layout: "list" | "grid";
  items: ShelfRecord[];
  listen: CollectionQuery;
  sort: CollectionSort;
  arrived: number | undefined;
}) {
  return (
    <ul className={className}>
      {items.map((item) => {
        const foundOn =
          sort === "found"
            ? foundDateLabel(item.purchaseDate)
            : arrived !== undefined
              ? foundDateLabel(item.createdAt)
              : undefined;
        const from = collectionHref(listen);
        const href = journalFromHref(item.id, from);
        const threads = shelfCardThreads(
          {
            artist: item.artist,
            year: sort === "found" || arrived !== undefined ? null : item.year,
            label: item.label,
            genres: item.genres,
            format: item.format,
            condition: item.condition,
            found: item.purchaseLocation,
            foundWhen: item.purchaseDate,
          },
          listen,
        );

        return (
          <li key={item.id}>
            <RecordMenu
              href={href}
              title={item.title}
              artist={item.artist}
              elsewhereHref={recordMenuElsewhereHref(item.artist, item.title, item.format)}
              shareHref={item.discogsId ? discogsReleaseHref(item.discogsId) : null}
              barcode={item.barcode}
              canKeepClose
              canRelease={true}
              isFavorite={item.isFavorite}
            >
              <ReleaseSlot id={item.id}>
                <KeptCloseSlot id={item.id} isFavorite={item.isFavorite} layout={layout === "list" ? "row" : "cover"}>
                  {layout === "list" ? (
                    <RecordRow
                      href={href}
                      coverUrl={item.coverUrl}
                      title={item.title}
                      artist={item.artist}
                      year={sort === "found" || arrived !== undefined ? null : item.year}
                      foundOn={foundOn}
                      format={item.format}
                      memory={memoryExcerpt(item.notes)}
                      threads={threads}
                    />
                  ) : (
                    <RecordTile
                      href={href}
                      coverUrl={item.coverUrl}
                      title={item.title}
                      artist={item.artist}
                      year={sort === "found" || arrived !== undefined ? (foundOn ?? null) : item.year}
                      format={item.format}
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      threads={threads}
                    />
                  )}
                </KeptCloseSlot>
              </ReleaseSlot>
            </RecordMenu>
          </li>
        );
      })}
    </ul>
  );
}

function ShelfPager({
  listen,
  page,
  pages,
}: {
  listen: CollectionQuery;
  page: number;
  pages: number;
}) {
  if (pages <= 1) {
    return null;
  }

  const hasEarlier = page > 1;
  const hasFurther = page < pages;

  return (
    <nav
      aria-label="More records"
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm leading-6 text-text-secondary">
        {hasFurther ? "There are more records on the shelf." : "You have reached the end of the shelf."}
      </p>
      <div className="flex flex-wrap gap-3">
        {hasEarlier ? (
          <ButtonLink href={collectionHref({ ...listen, page: page - 1 })} variant="ghost">
            <ChevronLeft className="size-4 shrink-0" aria-hidden />
            The ones before
          </ButtonLink>
        ) : null}
        {hasFurther ? (
          <ButtonLink href={collectionHref({ ...listen, page: page + 1 })}>
            Listen further
            <ChevronRight className="size-4 shrink-0" aria-hidden />
          </ButtonLink>
        ) : null}
      </div>
    </nav>
  );
}
