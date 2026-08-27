import { ChevronLeft, ChevronRight, Library, Radio, Search, SearchX } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BarcodeScanner } from "@/app/explorer/barcode-scanner";
import { ExplorerReleaseCard } from "@/app/explorer/explorer-release-card";
import { AppShell } from "@/components/layouts/app-shell";
import { Button, ButtonLink } from "@/components/ui/button";
import { ExplorerFacetChips } from "@/components/ui/explorer-facet-chips";
import { ExplorerThreadForm } from "@/components/ui/explorer-thread-form";
import { FormatChips } from "@/components/ui/format-chips";
import { ListenSheet } from "@/components/ui/listen-sheet";
import { Notice } from "@/components/ui/notice";
import { PageHeader, SectionHeading } from "@/components/ui/page-header";
import { SearchField } from "@/components/ui/search-field";
import { echoDiscoveries, echoHeadline, echoSeedFromInsight, type EchoSeed } from "@/lib/collection/echo";
import { collectionHref } from "@/lib/collection/href";
import { listCollectionStatItems, listShelfPresence } from "@/lib/collection/repository";
import { summarizeCollection, type CollectionInsight } from "@/lib/collection/stats";
import {
  MEDIA_FORMATS,
  isCanonicalWhenParams,
  parseGenreFilter,
  parseLabelFilter,
  type MediaFormat,
  type ReleaseDraft,
  type ShelfPresence,
} from "@/lib/collection/types";
import { toReleaseDraftFromSearch } from "@/lib/discogs/adapter";
import { isBarcodeQuery } from "@/lib/discogs/barcode";
import { searchDiscogs } from "@/lib/discogs/client";
import {
  explorerClearHref,
  explorerListenCount,
  explorerListenFromEcho,
  explorerSearchHref,
  explorerWhenFromParams,
  hasExplorerListen,
  resolveExplorerFormat,
  type ExplorerFormatParam,
  type ExplorerQuery,
} from "@/lib/discogs/href";
import { explorerThreadGroups } from "@/lib/discogs/threads";
import { explorerDocumentTitle } from "@/lib/document-title";
import { toErrorMessage } from "@/lib/errors";
import { getSession } from "@/lib/session";
import { getUserSettings } from "@/lib/settings/repository";
import { enabledFormats, preferredFormat } from "@/lib/settings/types";

export async function generateMetadata({ searchParams }: ExplorerPageProps): Promise<Metadata> {
  const { q, decade, year, genre, label } = await searchParams;
  const when = explorerWhenFromParams(year, decade);
  return {
    title: explorerDocumentTitle({
      query: q,
      year: when.year,
      decade: when.decade,
      genre: parseGenreFilter(genre),
      label: parseLabelFilter(label),
    }),
  };
}

const MAX_SEARCH_PAGE = 50;

interface ExplorerPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    format?: string;
    genre?: string;
    label?: string;
    decade?: string;
    year?: string;
  }>;
}

interface SearchOutcome {
  results: ReleaseDraft[];
  error: string | null;
  page: number;
  pages: number;
}

function parseSearchPage(raw: string | undefined): number {
  const parsed = Number.parseInt(raw ?? "1", 10);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }

  return Math.min(parsed, MAX_SEARCH_PAGE);
}

async function searchReleases(listen: ExplorerQuery): Promise<SearchOutcome> {
  if (!hasExplorerListen(listen)) {
    return { results: [], error: null, page: 1, pages: 1 };
  }

  const search = {
    ...listen,
    format: listen.format === "all" ? undefined : listen.format,
  };

  try {
    const outcome = await searchDiscogs(search);
    return {
      results: outcome.hits.map(toReleaseDraftFromSearch),
      error: null,
      page: outcome.page,
      pages: Math.min(outcome.pages, MAX_SEARCH_PAGE),
    };
  } catch (error) {
    return { results: [], error: toErrorMessage(error), page: 1, pages: 1 };
  }
}

export default async function ExplorerPage({ searchParams }: ExplorerPageProps) {
  const {
    q = "",
    page: rawPage,
    format: rawFormat,
    genre: rawGenre,
    label: rawLabel,
    decade: rawDecade,
    year: rawYear,
  } = await searchParams;
  const query = q.trim();
  const requestedPage = parseSearchPage(rawPage);
  const genre = parseGenreFilter(rawGenre);
  const label = parseLabelFilter(rawLabel);
  const { year, decade } = explorerWhenFromParams(rawYear, rawDecade);
  const session = await getSession();
  const settings = session ? await getUserSettings(session.user.id) : null;
  const enabled = settings ? enabledFormats(settings) : MEDIA_FORMATS.slice();
  const preferred = preferredFormat(enabled, settings?.defaultFormat);
  const format = resolveExplorerFormat(rawFormat, enabled, preferred);
  const formatParam: ExplorerFormatParam = rawFormat === "all" ? "all" : (format ?? "all");
  const listen: ExplorerQuery = {
    query: query.length > 0 ? query : undefined,
    page: requestedPage,
    format: formatParam,
    genre,
    label,
    decade,
    year,
  };

  if (!isCanonicalWhenParams(rawYear, rawDecade)) {
    redirect(explorerSearchHref(listen));
  }

  const hasListen = hasExplorerListen(listen);
  const { results, error: searchError, page, pages } = await searchReleases(listen);
  const owned = session ? await listCollectionStatItems(session.user.id) : [];
  const insight = summarizeCollection(owned);
  const echo = !hasListen && session ? await loadEchoRange(session.user.id, insight, format) : null;
  const threadDrafts = results.length > 0 ? results : (echo?.drafts ?? []);

  const listenCount = explorerListenCount(listen);
  const shelfInsight = session ? insight : null;
  const threadGroups = explorerThreadGroups({
    listen,
    insight: shelfInsight,
    drafts: threadDrafts,
  });
  const hasShelfSuggestions = threadGroups.shelf.length > 0;
  const hasResultSuggestions = threadGroups.results.length > 0;
  const clearHref = listenCount > 0 ? explorerClearHref(listen) : undefined;

  const discogsIds = results.flatMap((draft) => (draft.discogsId ? [draft.discogsId] : []));
  const presence =
    session && discogsIds.length > 0
      ? await listShelfPresence(session.user.id, discogsIds)
      : new Map<number, Exclude<ShelfPresence, { status: "absent" }>>();

  return (
    <AppShell>
      <PageHeader
        title="Explorer"
        description="Search Discogs, scan a barcode, then add the pressing to your resonance."
      />

      <form action="/explorer" method="get" className="flex flex-col gap-3 sm:flex-row">
        {formatParam ? <input type="hidden" name="format" value={formatParam} /> : null}
        {genre ? <input type="hidden" name="genre" value={genre} /> : null}
        {label ? <input type="hidden" name="label" value={label} /> : null}
        {decade !== undefined ? <input type="hidden" name="decade" value={String(decade)} /> : null}
        {year !== undefined ? <input type="hidden" name="year" value={String(year)} /> : null}
        <SearchField
          id="explorer-q"
          name="q"
          defaultValue={query}
          placeholder="Artist, album, barcode…"
          label="Search Discogs"
        />
        <div className="flex gap-3">
          <BarcodeScanner />
          <Button type="submit" className="flex-1 sm:flex-none">
            <Search className="size-4 shrink-0" aria-hidden />
            Search
          </Button>
        </div>
      </form>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <FormatChips
            active={format}
            enabled={enabled}
            buildHref={(next) => explorerSearchHref({ ...listen, format: next ?? "all", page: 1 })}
          />
          <div className="hidden lg:contents">
            <ExplorerFacetChips listen={listen} insight={shelfInsight} drafts={threadDrafts} />
          </div>
          <ListenSheet
            count={listenCount}
            title="Shape this listen"
            description="A genre, a label, a year — from your shelf, these pressings, or beyond."
            clearHref={clearHref}
            clearLabel="Listen without these threads"
          >
            {hasShelfSuggestions ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-text">From your shelf</p>
                <div className="flex flex-wrap gap-2">
                  <ExplorerFacetChips
                    listen={listen}
                    insight={shelfInsight}
                    drafts={threadDrafts}
                    show="suggestions"
                    source="shelf"
                  />
                </div>
              </div>
            ) : null}
            {hasResultSuggestions ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-text">From these pressings</p>
                <div className="flex flex-wrap gap-2">
                  <ExplorerFacetChips
                    listen={listen}
                    insight={shelfInsight}
                    drafts={threadDrafts}
                    show="suggestions"
                    source="results"
                  />
                </div>
              </div>
            ) : null}
            <ExplorerThreadForm listen={listen} idPrefix="explorer-sheet" />
          </ListenSheet>
        </div>
        <div className="hidden max-w-3xl lg:block">
          <ExplorerThreadForm listen={listen} idPrefix="explorer-desk" dense />
        </div>
        <div className="flex flex-wrap gap-2 lg:hidden">
          <ExplorerFacetChips listen={listen} insight={shelfInsight} drafts={threadDrafts} show="active" />
        </div>
      </div>

      {searchError ? <Notice tone="error">{searchError}</Notice> : null}

      {!hasListen && echo === null ? (
        <p className="text-sm leading-6 text-text-secondary">
          Start with a title you still hear, or hold a barcode to the light.
        </p>
      ) : null}

      {echo ? (
        <EchoRange
          seed={echo.seed}
          drafts={echo.drafts}
          presence={echo.presence}
          format={formatParam}
          canWishlist={session !== null}
        />
      ) : null}

      {hasListen && !searchError && results.length === 0 ? (
        <div className="flex flex-col gap-4">
          <p className="flex items-center gap-2 text-sm leading-6 text-text-secondary">
            <SearchX className="size-4 shrink-0" aria-hidden />
            {requestedPage > 1
              ? "Nothing more resonated."
              : isBarcodeQuery(query)
                ? "Nothing resonated with that barcode."
                : "Nothing resonated with that search."}
          </p>
          {requestedPage > 1 ? (
            <ButtonLink href={explorerSearchHref({ ...listen, page: 1 })} variant="ghost" className="self-start">
              <ChevronLeft className="size-4 shrink-0" aria-hidden />
              Back to the first pressings
            </ButtonLink>
          ) : null}
        </div>
      ) : null}

      {results.length > 0 ? (
        <>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
            {results.map((draft, index) => (
              <li key={draft.discogsId ?? `${draft.artist}-${draft.title}`}>
                <ExplorerReleaseCard
                  draft={draft}
                  listen={listen}
                  searchQuery={query}
                  from={explorerSearchHref(listen)}
                  priority={index < 4}
                  canWishlist={session !== null}
                  presence={
                    draft.discogsId
                      ? (presence.get(draft.discogsId) ?? { status: "absent" })
                      : { status: "absent" }
                  }
                />
              </li>
            ))}
          </ul>
          <SearchPager listen={{ ...listen, page }} pages={pages} />
        </>
      ) : null}
    </AppShell>
  );
}

async function loadEchoRange(
  userId: string,
  insight: CollectionInsight,
  format: MediaFormat | undefined,
): Promise<{
  seed: EchoSeed;
  drafts: ReleaseDraft[];
  presence: Map<number, Exclude<ShelfPresence, { status: "absent" }>>;
} | null> {
  const seed = echoSeedFromInsight(insight);

  if (!seed) {
    return null;
  }

  const outcome = await searchReleases(explorerListenFromEcho(seed, format));

  if (outcome.error || outcome.results.length === 0) {
    return null;
  }

  const discogsIds = outcome.results.flatMap((draft) => (draft.discogsId ? [draft.discogsId] : []));
  const presence = discogsIds.length > 0 ? await listShelfPresence(userId, discogsIds) : new Map();
  const ownedIds = new Set<number>();

  for (const [id, entry] of presence) {
    if (entry.status === "owned") {
      ownedIds.add(id);
    }
  }

  const drafts = echoDiscoveries(outcome.results, ownedIds);

  if (drafts.length === 0) {
    return null;
  }

  return { seed, drafts, presence };
}

function EchoRange({
  seed,
  drafts,
  presence,
  format,
  canWishlist,
}: {
  seed: EchoSeed;
  drafts: ReleaseDraft[];
  presence: Map<number, Exclude<ShelfPresence, { status: "absent" }>>;
  format?: ExplorerFormatParam;
  canWishlist: boolean;
}) {
  const headingId = "echo-range-heading";
  const shelfHref =
    seed.kind === "artist" ? collectionHref({ artist: seed.name }) : collectionHref({ genre: seed.name });
  const searchFormat = format === "all" ? undefined : format;
  const further = explorerListenFromEcho(seed, searchFormat);

  return (
    <section className="flex flex-col gap-6" aria-labelledby={headingId}>
      <div className="flex flex-col gap-3">
        <SectionHeading icon={Radio} id={headingId}>
          In your echo range
        </SectionHeading>
        <p className="text-sm leading-6 text-text-secondary">{echoHeadline(seed, drafts.length)}</p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={shelfHref} variant="ghost">
            <Library className="size-4 shrink-0" aria-hidden />
            On your shelf
          </ButtonLink>
          <ButtonLink href={explorerSearchHref({ ...further, format })}>
            Listen further
            <ChevronRight className="size-4 shrink-0" aria-hidden />
          </ButtonLink>
        </div>
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
        {drafts.map((draft, index) => (
          <li key={draft.discogsId ?? `${draft.artist}-${draft.title}`}>
            <ExplorerReleaseCard
              draft={draft}
              listen={further}
              searchQuery={seed.query}
              from={explorerSearchHref({ format })}
              priority={index < 4}
              canWishlist={canWishlist}
              presence={
                draft.discogsId
                  ? (presence.get(draft.discogsId) ?? { status: "absent" })
                  : { status: "absent" }
              }
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function SearchPager({ listen, pages }: { listen: ExplorerQuery; pages: number }) {
  const page = listen.page && listen.page > 1 ? listen.page : 1;

  if (pages <= 1) {
    return null;
  }

  const hasEarlier = page > 1;
  const hasFurther = page < pages;

  return (
    <nav
      aria-label="More pressings"
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm leading-6 text-text-secondary">
        {hasFurther ? "There are more pressings of this search." : "You have heard the last of this search."}
      </p>
      <div className="flex flex-wrap gap-3">
        {hasEarlier ? (
          <ButtonLink href={explorerSearchHref({ ...listen, page: page - 1 })} variant="ghost">
            <ChevronLeft className="size-4 shrink-0" aria-hidden />
            The ones before
          </ButtonLink>
        ) : null}
        {hasFurther ? (
          <ButtonLink href={explorerSearchHref({ ...listen, page: page + 1 })}>
            Listen further
            <ChevronRight className="size-4 shrink-0" aria-hidden />
          </ButtonLink>
        ) : null}
      </div>
    </nav>
  );
}
