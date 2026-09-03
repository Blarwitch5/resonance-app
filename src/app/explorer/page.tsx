import { ChevronLeft, ChevronRight, Library, Radio, SearchX } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ExplorerFeed } from "@/app/explorer/explorer-feed";
import { ExplorerReleaseCard } from "@/app/explorer/explorer-release-card";
import { ExplorerSearch } from "@/app/explorer/explorer-search";
import { AppShell } from "@/components/layouts/app-shell";
import { ButtonLink } from "@/components/ui/button";
import { ExplorerFacetChips } from "@/components/ui/explorer-facet-chips";
import { ExplorerThreadForm } from "@/components/ui/explorer-thread-form";
import { FormatChips } from "@/components/ui/format-chips";
import { ListenSheet } from "@/components/ui/listen-sheet";
import { Notice } from "@/components/ui/notice";
import { PageHeader, SectionHeading } from "@/components/ui/page-header";
import { bodyClass } from "@/components/ui/type";
import { ViewChips } from "@/components/ui/view-chips";
import { echoDiscoveries, echoHeadline, echoSeedFromInsight, type EchoSeed } from "@/lib/collection/echo";
import { shelfResultsClass } from "@/lib/collection/layout";
import { getLocale } from "@/lib/i18n/locale";
import { t } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/settings/types";
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
  MAX_SEARCH_PAGE,
  parseSearchPage,
  resolveExplorerFormat,
  type ExplorerFormatParam,
  type ExplorerQuery,
} from "@/lib/discogs/href";
import { explorerThreadGroups } from "@/lib/discogs/threads";
import { explorerDocumentTitle } from "@/lib/document-title";
import { toErrorMessage } from "@/lib/errors";
import { getSession } from "@/lib/session";
import { getUserSettings } from "@/lib/settings/repository";
import { enabledFormats, preferredFormat, type ViewMode } from "@/lib/settings/types";

export async function generateMetadata({ searchParams }: ExplorerPageProps): Promise<Metadata> {
  const { q, decade, year, genre, label } = await searchParams;
  const when = explorerWhenFromParams(year, decade);
  const locale = await getLocale();
  return {
    title: explorerDocumentTitle({
      query: q,
      year: when.year,
      decade: when.decade,
      genre: parseGenreFilter(genre),
      label: parseLabelFilter(label),
      locale,
    }),
  };
}

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
  const locale = await getLocale();
  const settings = session ? await getUserSettings(session.user.id) : null;
  const viewMode: ViewMode = settings?.viewMode ?? "list";
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
    locale,
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
        title={t(locale, "explorer.title")}
        description={t(locale, "explorer.description")}
      />

      <div className="flex flex-col gap-3">
        <ExplorerSearch listen={listen} query={query} />

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
          <FormatChips
            active={format}
            enabled={enabled}
            buildHref={(next) => explorerSearchHref({ ...listen, format: next ?? "all", page: 1 })}
            locale={locale}
          />
          <div className="hidden lg:contents">
            <ExplorerFacetChips listen={listen} insight={shelfInsight} drafts={threadDrafts} />
          </div>
          <ListenSheet
            count={listenCount}
            title={t(locale, "explorer.listenTitle")}
            description={t(locale, "explorer.listenDescription")}
            clearHref={clearHref}
            clearLabel={t(locale, "explorer.listenClear")}
          >
            {hasShelfSuggestions ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-text">{t(locale, "thread.fromShelf")}</p>
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
                <p className="text-sm font-medium text-text">{t(locale, "thread.fromPressings")}</p>
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
          {session ? (
            <div className="ms-auto">
              <ViewChips active={viewMode} next={explorerSearchHref(listen)} />
            </div>
          ) : null}
        </div>
        <div className="hidden max-w-3xl lg:block">
          <ExplorerThreadForm listen={listen} idPrefix="explorer-desk" dense />
        </div>
        <div className="flex flex-wrap gap-2 lg:hidden">
          <ExplorerFacetChips listen={listen} insight={shelfInsight} drafts={threadDrafts} show="active" />
        </div>
        </div>
      </div>

      {searchError ? <Notice tone="error">{searchError}</Notice> : null}

      {!hasListen && echo === null ? (
        <p className={bodyClass}>
          {t(locale, "explorer.hint")}
        </p>
      ) : null}

      {echo ? (
        <EchoRange
          seed={echo.seed}
          drafts={echo.drafts}
          presence={echo.presence}
          format={formatParam}
          canWishlist={session !== null}
          locale={locale}
          layout={viewMode}
        />
      ) : null}

      {hasListen && !searchError && results.length === 0 ? (
        <div className="flex flex-col gap-4">
          <p className={`flex items-center gap-2 ${bodyClass}`}>
            <SearchX className="size-4 shrink-0" aria-hidden />
            {requestedPage > 1
              ? t(locale, "explorer.nothingMore")
              : isBarcodeQuery(query)
                ? t(locale, "explorer.nothingBarcode")
                : t(locale, "explorer.nothingSearch")}
          </p>
          {requestedPage > 1 ? (
            <ButtonLink href={explorerSearchHref({ ...listen, page: 1 })} variant="ghost" className="self-start">
              <ChevronLeft className="size-4 shrink-0" aria-hidden />
              {t(locale, "back.firstPressings")}
            </ButtonLink>
          ) : null}
        </div>
      ) : null}

      {results.length > 0 ? (
        <ExplorerFeed
          key={explorerSearchHref({ ...listen, page: undefined })}
          items={results.map((draft) => ({
            draft,
            presence: draft.discogsId
              ? (presence.get(draft.discogsId) ?? { status: "absent" })
              : { status: "absent" },
          }))}
          listen={listen}
          page={page}
          pages={pages}
          searchQuery={query}
          canWishlist={session !== null}
          locale={locale}
          layout={viewMode}
        />
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
  locale,
  layout,
}: {
  seed: EchoSeed;
  drafts: ReleaseDraft[];
  presence: Map<number, Exclude<ShelfPresence, { status: "absent" }>>;
  format?: ExplorerFormatParam;
  canWishlist: boolean;
  locale: Locale;
  layout: ViewMode;
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
          {t(locale, "explorer.echoTitle")}
        </SectionHeading>
        <p className={bodyClass}>{echoHeadline(seed, drafts.length, locale)}</p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={shelfHref} variant="ghost">
            <Library className="size-4 shrink-0" aria-hidden />
            {t(locale, "explorer.onYourShelf")}
          </ButtonLink>
          <ButtonLink href={explorerSearchHref({ ...further, format })}>
            {t(locale, "common.listenFurther")}
            <ChevronRight className="size-4 shrink-0" aria-hidden />
          </ButtonLink>
        </div>
      </div>
      <ul className={shelfResultsClass(layout)}>
        {drafts.map((draft, index) => (
          <li key={draft.discogsId ?? `${draft.artist}-${draft.title}`}>
            <ExplorerReleaseCard
              draft={draft}
              listen={further}
              searchQuery={seed.query}
              from={explorerSearchHref({ format })}
              priority={index < 4}
              canWishlist={canWishlist}
              locale={locale}
              layout={layout}
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
