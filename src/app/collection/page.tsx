import { ChevronLeft, Disc3, FaceSlightlySmilingPlus, Heart, MoonStar, ScanSearch, SearchX } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CollectionFeed } from "@/app/collection/collection-feed";
import { CollectionSearch } from "@/app/collection/collection-search";
import { AppShell } from "@/components/layouts/app-shell";
import { ButtonLink } from "@/components/ui/button";
import { CollectionListenSheet } from "@/components/ui/listen-sheet";
import { FacetChips } from "@/components/ui/facet-chips";
import { FormatChips } from "@/components/ui/format-chips";
import { KeptChip } from "@/components/ui/kept-chip";
import { PageHeader } from "@/components/ui/page-header";
import { SearchListenPane } from "@/components/ui/search-listen";
import { SortChips } from "@/components/ui/sort-chips";
import { bodyClass, hintClass, sectionTitleClass } from "@/components/ui/type";
import { ViewChips } from "@/components/ui/view-chips";
import { feedPageCount } from "@/lib/collection/feed";
import { collectionHref } from "@/lib/collection/href";
import { collectionListenCount, collectionShelfHref } from "@/lib/collection/listen";
import { countCollectionItems, hasShelfItems, listCollectionItems, SHELF_PAGE_SIZE } from "@/lib/collection/repository";
import {
  collectionListenFromParams,
  isCanonicalWhenParams,
  MAX_COLLECTION_PAGE,
  parseArtistFilter,
  parseFoundFilter,
  parseGenreFilter,
  parseKeptClose,
  parseLabelFilter,
  parseMediaCondition,
  parseMediaFormat,
  parseWhenFilter,
  toShelfCard,
  whenListenFromParams,
  type CollectionQuery,
} from "@/lib/collection/types";
import { explorerListenFromShelf, explorerSearchHref, hasExplorerListen } from "@/lib/discogs/href";
import { collectionDocumentTitle } from "@/lib/document-title";
import { conditionLabel, decadeName } from "@/lib/i18n/labels";
import { getLocale } from "@/lib/i18n/locale";
import { t } from "@/lib/i18n/translate";
import { requireSession } from "@/lib/session";
import { getUserSettings } from "@/lib/settings/repository";
import { enabledFormats, type Locale } from "@/lib/settings/types";

export async function generateMetadata({ searchParams }: CollectionPageProps): Promise<Metadata> {
  const params = await searchParams;
  const locale = await getLocale();
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
      locale,
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
  const { listen, page } = collectionListenFromParams(params, enabled);
  const query = listen.query ?? "";
  const sort = listen.sort ?? "recent";
  const keptClose = Boolean(listen.keptClose);
  const format = listen.format;
  const artist = listen.artist;
  const genre = listen.genre;
  const year = listen.year;
  const decade = listen.decade;
  const label = listen.label;
  const found = listen.found;
  const condition = listen.condition;
  const when = listen.when;
  const arrived = listen.arrived;

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
  const [rows, total] = await Promise.all([
    listCollectionItems(session.user.id, {
      ...filters,
      page,
      pageSize: SHELF_PAGE_SIZE,
    }),
    countCollectionItems(session.user.id, filters),
  ]);
  const items = rows.map(toShelfCard);
  const pages = feedPageCount(total, SHELF_PAGE_SIZE, MAX_COLLECTION_PAGE);
  const elsewhereListen = explorerListenFromShelf({ ...listen, format });
  const hasElsewhere = hasExplorerListen(elsewhereListen);
  const elsewhere = explorerSearchHref(elsewhereListen);
  const listenCount = collectionListenCount(listen);
  const shelfHref = listenCount > 0 ? collectionShelfHref(listen) : undefined;

  return (
    <AppShell>
      <PageHeader
        title={t(settings.locale, "collection.title")}
        description={shelfDescription(listen, settings.locale)}
        action={
          <div className="flex shrink-0 items-center gap-2">
            {total > 0 || hasQuery || hasFacet || keptClose ? (
              <ButtonLink
                href="/collection/tonight"
                variant="ghost"
                aria-label={t(settings.locale, "collection.tonightAria")}
                className="px-3 lg:px-6"
              >
                <MoonStar className="size-4 shrink-0" aria-hidden />
                <span className="hidden lg:inline">{t(settings.locale, "collection.tonight")}</span>
              </ButtonLink>
            ) : null}
            <div className="hidden lg:contents">
              <ButtonLink href={elsewhere} className="shrink-0">
                <FaceSlightlySmilingPlus className="size-4 shrink-0" aria-hidden />
                {t(settings.locale, "common.add")}
              </ButtonLink>
            </div>
          </div>
        }
      />

      <div className="flex flex-col gap-3">
        <CollectionSearch listen={listen} query={query}>
        <div className="flex flex-col gap-3">
          <div id="collection-listen" className="flex flex-wrap items-center gap-2">
            <FormatChips
              active={format}
              enabled={enabled}
              buildHref={(next) => collectionHref({ ...listen, format: next })}
              className="lg:hidden"
              locale={settings.locale}
            />
            <div className="hidden lg:contents">
              <KeptChip listen={listen} />
              <FacetChips listen={listen} locale={settings.locale} />
            </div>
            <CollectionListenSheet count={listenCount} clearHref={shelfHref}>
              <KeptChip listen={listen} />
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-text">{t(settings.locale, "sort.nav")}</p>
                <SortChips active={sort} listen={listen} />
              </div>
            </CollectionListenSheet>
            <div className="ms-auto lg:hidden">
              <ViewChips active={settings.viewMode} next={collectionHref({ ...listen, page })} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 lg:hidden">
            <FacetChips listen={listen} locale={settings.locale} />
          </div>
          <div className="hidden flex-wrap items-center justify-between gap-3 lg:flex">
            <SortChips active={sort} listen={listen} />
            <ViewChips active={settings.viewMode} next={collectionHref({ ...listen, page })} />
          </div>
        </div>
        <SearchListenPane>
      {items.length === 0 ? (
        <section className="rounded-rs-lg border border-border bg-surface px-6 py-16 text-center">
          {hasQuery || hasFacet ? (
            <SearchX className="mx-auto size-8 text-text-tertiary" aria-hidden />
          ) : keptClose ? (
            <Heart className="mx-auto size-8 text-text-tertiary" aria-hidden />
          ) : (
            <Disc3 className="mx-auto size-8 text-text-tertiary" aria-hidden />
          )}
          <p className={`mt-4 ${sectionTitleClass}`}>
            {hasQuery || hasFacet
              ? t(settings.locale, "collection.emptyMatch")
              : page > 1
                ? t(settings.locale, "collection.emptyPage")
                : keptClose
                  ? t(settings.locale, "collection.emptyKept")
                  : t(settings.locale, "collection.emptyShelf")}
          </p>
          <p className={`mx-auto mt-2 max-w-sm ${bodyClass}`}>
            {hasElsewhere
              ? t(settings.locale, "collection.emptyElsewhere")
              : hasFacet
                ? t(settings.locale, "collection.emptyFacet")
                : page > 1
                  ? t(settings.locale, "collection.emptyEarlier")
                  : keptClose
                    ? t(settings.locale, "collection.emptyKeptHint")
                    : t(settings.locale, "collection.emptyHint")}
          </p>
          {hasElsewhere ? (
            <div className="mt-6 flex flex-col items-center gap-3">
              <ButtonLink href={elsewhere}>
                <ScanSearch className="size-4 shrink-0" aria-hidden />
                {t(settings.locale, "common.hearElsewhere")}
              </ButtonLink>
              {hasQuery ? (
                <ButtonLink href={collectionHref({ ...listen, query: undefined })} variant="ghost">
                  <SearchX className="size-4 shrink-0" aria-hidden />
                  {t(settings.locale, "common.clearSearch")}
                </ButtonLink>
              ) : (
                <ButtonLink
                  href={collectionHref({ format, sort, keptClose })}
                  variant="ghost"
                >
                  <SearchX className="size-4 shrink-0" aria-hidden />
                  {t(settings.locale, "common.showWholeShelf")}
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
              {t(settings.locale, "common.showWholeShelf")}
            </ButtonLink>
          ) : page > 1 ? (
            <ButtonLink href={collectionHref({ ...listen })} variant="ghost" className="mt-6">
              <ChevronLeft className="size-4 shrink-0" aria-hidden />
              {t(settings.locale, "back.firstRecords")}
            </ButtonLink>
          ) : keptClose ? (
            <ButtonLink href={collectionHref({ format, sort })} variant="ghost" className="mt-6">
              <Heart className="size-4 shrink-0" aria-hidden />
              {t(settings.locale, "common.showWholeShelf")}
            </ButtonLink>
          ) : (
            <ButtonLink href="/explorer" className="mt-6">
              <FaceSlightlySmilingPlus className="size-4 shrink-0" aria-hidden />
              {t(settings.locale, "collection.addFirst")}
            </ButtonLink>
          )}
        </section>
      ) : (
        <>
          <p className={hintClass}>{t(settings.locale, "collection.leaveHint")}</p>
          <CollectionFeed
            key={collectionHref(listen)}
            viewMode={settings.viewMode}
            items={items}
            page={page}
            pages={pages}
            listen={listen}
            sort={sort}
            arrived={arrived}
            locale={settings.locale}
          />
          {hasElsewhere ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6 text-text-secondary">
                {t(settings.locale, "collection.otherPressings")}
              </p>
              <ButtonLink href={elsewhere} variant="ghost" className="self-start">
                <ScanSearch className="size-4 shrink-0" aria-hidden />
                {t(settings.locale, "common.hearElsewhere")}
              </ButtonLink>
            </div>
          ) : null}
        </>
      )}
        </SearchListenPane>
        </CollectionSearch>
      </div>
    </AppShell>
  );
}

function shelfDescription(listen: CollectionQuery, locale: Locale): string {
  const thread: string[] = [];

  if (listen.artist) {
    thread.push(listen.artist);
  }

  if (listen.label) {
    thread.push(listen.label);
  }

  if (listen.found) {
    thread.push(t(locale, "collection.foundIn", { place: listen.found }));
  }

  if (listen.when !== undefined) {
    thread.push(listen.found ? String(listen.when) : t(locale, "collection.foundIn", { place: listen.when }));
  }

  if (listen.arrived !== undefined) {
    thread.push(t(locale, "collection.arrivedIn", { year: listen.arrived }));
  }

  if (listen.condition) {
    thread.push(conditionLabel(locale, listen.condition).toLowerCase());
  }

  if (listen.genre) {
    thread.push(listen.genre);
  }

  if (listen.decade !== undefined) {
    thread.push(t(locale, "collection.theDecade", { decade: decadeName(locale, listen.decade) }));
  }

  if (listen.year !== undefined) {
    thread.push(String(listen.year));
  }

  if (thread.length > 0) {
    const line = thread.join(" · ");
    return listen.keptClose
      ? t(locale, "collection.keptCloseLine", { line })
      : t(locale, "collection.shelfLine", { line });
  }

  return listen.keptClose ? t(locale, "collection.keptClosest") : t(locale, "collection.recordsKeptClose");
}

