import { Bookmark, ChevronLeft, Download, FolderDown, Heart, KeyRound, Settings, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ChangePasswordForm } from "@/app/profile/change-password-form";
import { CollectionStats } from "@/app/profile/collection-stats";
import { ExportResonanceLink } from "@/app/profile/export-resonance-link";
import { ImportDiscogsForm } from "@/app/profile/import-discogs-form";
import { ProfileFeed } from "@/app/profile/profile-feed";
import { RestoreResonanceForm } from "@/app/profile/restore-resonance-form";
import { ProfileSearch } from "@/app/profile/profile-search";
import { ProfileSettingsForm } from "@/app/profile/profile-settings-form";
import { SignOutButton } from "@/components/ui/sign-out-button";
import { AppShell } from "@/components/layouts/app-shell";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader, SectionHeading } from "@/components/ui/page-header";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { ProfileChips } from "@/components/ui/profile-chips";
import { ProfileSettingsSheet } from "@/components/ui/profile-settings-sheet";
import { SearchListenPane } from "@/components/ui/search-listen";
import { bodyClass, sectionTitleClass } from "@/components/ui/type";
import { ViewChips } from "@/components/ui/view-chips";
import { feedPageCount } from "@/lib/collection/feed";
import {
  countCollectionItems,
  listCollectionItems,
  listCollectionStatItems,
} from "@/lib/collection/repository";
import { summarizeCollection } from "@/lib/collection/stats";
import { MAX_COLLECTION_PAGE, parseCollectionPage } from "@/lib/collection/types";
import { explorerSearchHref } from "@/lib/discogs/href";
import { profileDocumentTitle } from "@/lib/document-title";
import { t } from "@/lib/i18n/translate";
import { getLocale } from "@/lib/i18n/locale";
import {
  parseProfileTab,
  parseSettingsFlag,
  profileEngagement,
  profileHref,
  PROFILE_SHELF_SIZE,
  toProfileShelfItem,
  type ProfileShelfItem,
} from "@/lib/profile/types";
import { requireSession } from "@/lib/session";
import { getUserSettings } from "@/lib/settings/repository";
import { enabledFormats, type Locale, type ViewMode } from "@/lib/settings/types";

export async function generateMetadata({ searchParams }: ProfilePageProps): Promise<Metadata> {
  const { tab, q, settings } = await searchParams;
  const query = (q ?? "").trim();
  const locale = await getLocale();

  return {
    title: profileDocumentTitle({
      tab: parseProfileTab(tab, query.length > 0),
      settings: parseSettingsFlag(settings, tab),
      query,
      locale,
    }),
  };
}

interface ProfilePageProps {
  searchParams: Promise<{ tab?: string; fav?: string; wish?: string; q?: string; settings?: string }>;
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const session = await requireSession();
  const { tab: rawTab, fav: rawFav, wish: rawWish, q: rawQuery, settings: rawSettings } = await searchParams;
  const query = (rawQuery ?? "").trim();
  const hasQuery = query.length > 0;
  const favPage = parseCollectionPage(rawFav);
  const wishPage = parseCollectionPage(rawWish);
  const tab = parseProfileTab(rawTab, hasQuery);
  const settingsOpen = parseSettingsFlag(rawSettings, rawTab);
  const listen = { query: hasQuery ? query : undefined };
  const listenHref = {
    tab,
    query: listen.query,
    favPage,
    wishPage,
  };
  const [settings, owned, favorites, favoritesTotal, wishlist, wishlistTotal, keptCloseTotal, waitingTotal] =
    await Promise.all([
      getUserSettings(session.user.id),
      tab === "resonance" ? listCollectionStatItems(session.user.id) : Promise.resolve([]),
      tab === "close"
        ? listCollectionItems(session.user.id, {
            kind: "favorite",
            query: listen.query,
            page: favPage,
            pageSize: PROFILE_SHELF_SIZE,
          })
        : Promise.resolve([]),
      tab === "close"
        ? countCollectionItems(session.user.id, { kind: "favorite", query: listen.query })
        : Promise.resolve(0),
      tab === "waiting"
        ? listCollectionItems(session.user.id, {
            kind: "wishlist",
            query: listen.query,
            page: wishPage,
            pageSize: PROFILE_SHELF_SIZE,
          })
        : Promise.resolve([]),
      tab === "waiting"
        ? countCollectionItems(session.user.id, { kind: "wishlist", query: listen.query })
        : Promise.resolve(0),
      tab === "resonance" ? countCollectionItems(session.user.id, { kind: "favorite" }) : Promise.resolve(0),
      tab === "resonance" ? countCollectionItems(session.user.id, { kind: "wishlist" }) : Promise.resolve(0),
    ]);

  const insight = summarizeCollection(owned);
  const engagement = profileEngagement({ keptClose: keptCloseTotal, waiting: waitingTotal }, settings.locale);
  const favoritePages = pageCount(favoritesTotal);
  const wishlistPages = pageCount(wishlistTotal);
  const elsewhere = hasQuery ? explorerSearchHref({ query }) : null;
  const shelfQuiet =
    (tab === "close" && favorites.length === 0) || (tab === "waiting" && wishlist.length === 0);
  const formats = enabledFormats(settings);

  return (
    <AppShell>
      <PageHeader
        title={t(settings.locale, "profile.title")}
        description={`${session.user.name} · ${session.user.email}`}
        extra={
          <>
            {settings.bio ? (
              <p className={`max-w-xl ${bodyClass}`}>{settings.bio}</p>
            ) : null}
            <div className="pt-1 lg:hidden">
              <SignOutButton layout="page" />
            </div>
          </>
        }
        action={
          <div className="flex items-center gap-1">
            <ProfileSettingsSheet
              isOpen={settingsOpen}
              href={profileHref({ ...listenHref, settings: true })}
              closeHref={profileHref(listenHref)}
            >
              {settingsOpen ? (
                <>
                  <SheetSection icon={FolderDown} title={t(settings.locale, "settings.discogsShelf")}>
                    <ImportDiscogsForm />
                  </SheetSection>
                  <SheetSection icon={Download} title={t(settings.locale, "settings.keepACopy")}>
                    <ExportResonanceLink />
                    <RestoreResonanceForm />
                  </SheetSection>
                  <SheetSection icon={Settings} title={t(settings.locale, "settings.title")}>
                    <ProfileSettingsForm name={session.user.name} image={session.user.image} settings={settings} />
                  </SheetSection>
                  <SheetSection icon={KeyRound} title={t(settings.locale, "settings.password")}>
                    <ChangePasswordForm />
                  </SheetSection>
                  <SignOutButton />
                </>
              ) : null}
            </ProfileSettingsSheet>
            <ProfileAvatar name={session.user.name} imageUrl={session.user.image} formats={formats} />
          </div>
        }
      />

      {tab === "close" || tab === "waiting" ? (
        <div className="flex flex-col gap-4">
          <ProfileChips active={tab} query={listen.query} />
          <ProfileSearch tab={tab} query={query} elsewhere={elsewhere} isQuiet={shelfQuiet}>
            <SearchListenPane>
      {hasQuery && shelfQuiet && elsewhere ? (
        <p className={bodyClass}>
          {t(settings.locale, "collection.emptyElsewhere")}
        </p>
      ) : null}

      {tab === "close" ? (
        <ProfileShelf
          icon={Heart}
          title={t(settings.locale, "profile.favorites")}
          empty={hasQuery ? t(settings.locale, "profile.emptyCloseQuery") : t(settings.locale, "profile.emptyClose")}
          emptyFurther={t(settings.locale, "profile.emptyCloseFurther")}
          items={favorites.map(toProfileShelfItem)}
          kind="favorite"
          query={listen.query}
          from={profileHref(listenHref)}
          page={favPage}
          pages={favoritePages}
          hrefFor={(next) => profileHref({ tab: "close", query: listen.query, favPage: next })}
          canKeepClose
          further={t(settings.locale, "profile.furtherClose")}
          end={t(settings.locale, "profile.endClose")}
          label={t(settings.locale, "profile.moreClose")}
          locale={settings.locale}
          layout={settings.viewMode}
        />
      ) : null}

      {tab === "waiting" ? (
        <ProfileShelf
          icon={Bookmark}
          title={t(settings.locale, "profile.wishlist")}
          empty={hasQuery ? t(settings.locale, "profile.emptyWaitQuery") : t(settings.locale, "profile.emptyWait")}
          emptyFurther={t(settings.locale, "profile.emptyWaitFurther")}
          items={wishlist.map(toProfileShelfItem)}
          kind="wishlist"
          query={listen.query}
          from={profileHref(listenHref)}
          page={wishPage}
          pages={wishlistPages}
          hrefFor={(next) => profileHref({ tab: "waiting", query: listen.query, wishPage: next })}
          further={t(settings.locale, "profile.furtherWait")}
          end={t(settings.locale, "profile.endWait")}
          label={t(settings.locale, "profile.moreWait")}
          locale={settings.locale}
          layout={settings.viewMode}
        />
      ) : null}
            </SearchListenPane>
          </ProfileSearch>
        </div>
      ) : (
        <>
          <ProfileChips active={tab} query={listen.query} />
          {tab === "resonance" ? (
            <CollectionStats insight={insight} engagement={engagement} locale={settings.locale} />
          ) : null}
          {tab === "resonance" && insight.total === 0 && engagement.length === 0 ? (
            <p className={bodyClass}>{t(settings.locale, "profile.emptyShelf")}</p>
          ) : null}
        </>
      )}
    </AppShell>
  );
}

function SheetSection({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <p className={`flex items-center gap-2 ${sectionTitleClass}`}>
        <Icon className="size-5 shrink-0 text-text-secondary" aria-hidden />
        {title}
      </p>
      {children}
    </section>
  );
}

function pageCount(total: number): number {
  return feedPageCount(total, PROFILE_SHELF_SIZE, MAX_COLLECTION_PAGE);
}

function ProfileShelf({
  icon: Icon,
  title,
  empty,
  emptyFurther,
  items,
  kind,
  query,
  from,
  page,
  pages,
  hrefFor,
  canKeepClose = false,
  further,
  end,
  label,
  locale,
  layout,
}: {
  icon: LucideIcon;
  title: string;
  empty: string;
  emptyFurther: string;
  items: ProfileShelfItem[];
  kind: "favorite" | "wishlist";
  query?: string;
  from: string;
  page: number;
  pages: number;
  hrefFor: (page: number) => string;
  canKeepClose?: boolean;
  further: string;
  end: string;
  label: string;
  locale: Locale;
  layout: ViewMode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionHeading icon={Icon}>{title}</SectionHeading>
        <ViewChips active={layout} next={from} />
      </div>
      {items.length === 0 ? (
        <div className="flex flex-col gap-4">
          <p className={bodyClass}>{page > 1 ? emptyFurther : empty}</p>
          {page > 1 ? (
            <ButtonLink href={hrefFor(1)} variant="ghost" className="self-start">
              <ChevronLeft className="size-4 shrink-0" aria-hidden />
              {t(locale, "back.firstRecords")}
            </ButtonLink>
          ) : null}
        </div>
      ) : (
        <ProfileFeed
          key={`${kind}-${query ?? ""}`}
          items={items}
          page={page}
          pages={pages}
          kind={kind}
          query={query}
          from={from}
          canKeepClose={canKeepClose}
          further={further}
          end={end}
          label={label}
          earlierHref={hrefFor(page - 1)}
          locale={locale}
          layout={layout}
        />
      )}
    </section>
  );
}
