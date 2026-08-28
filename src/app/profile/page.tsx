import { Bookmark, ChevronLeft, ChevronRight, Download, FolderDown, Heart, KeyRound, Settings, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { KeptCloseSlot } from "@/app/collection/[id]/kept-close-form";
import { ReleaseSlot } from "@/app/collection/[id]/release-record-form";
import { ChangePasswordForm } from "@/app/profile/change-password-form";
import { CollectionStats } from "@/app/profile/collection-stats";
import { ExportResonanceLink } from "@/app/profile/export-resonance-link";
import { ImportDiscogsForm } from "@/app/profile/import-discogs-form";
import { RestoreResonanceForm } from "@/app/profile/restore-resonance-form";
import { ProfileSearch } from "@/app/profile/profile-search";
import { ProfileSettingsForm } from "@/app/profile/profile-settings-form";
import { SignOutButton } from "@/app/profile/sign-out-button";
import { AppShell } from "@/components/layouts/app-shell";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader, SectionHeading } from "@/components/ui/page-header";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { ProfileChips } from "@/components/ui/profile-chips";
import { ProfileSettingsSheet } from "@/components/ui/profile-settings-sheet";
import { RecordMenu } from "@/components/ui/record-menu";
import { RecordTile } from "@/components/ui/record-tile";
import { journalFromHref } from "@/lib/collection/href";
import { recordMenuElsewhereHref } from "@/lib/collection/record-menu";
import { shelfCardThreads } from "@/lib/collection/shelf-threads";
import {
  countCollectionItems,
  listCollectionItems,
  listCollectionStatItems,
} from "@/lib/collection/repository";
import { summarizeCollection } from "@/lib/collection/stats";
import { MAX_COLLECTION_PAGE, parseCollectionPage, type MediaCondition, type MediaFormat } from "@/lib/collection/types";
import { discogsReleaseHref, explorerSearchHref } from "@/lib/discogs/href";
import { profileDocumentTitle } from "@/lib/document-title";
import { parseProfileTab, parseSettingsFlag, profileEngagement, profileHref } from "@/lib/profile/types";
import { requireSession } from "@/lib/session";
import { getUserSettings } from "@/lib/settings/repository";
import { enabledFormats } from "@/lib/settings/types";

export async function generateMetadata({ searchParams }: ProfilePageProps): Promise<Metadata> {
  const { tab, q, settings } = await searchParams;
  const query = (q ?? "").trim();

  return {
    title: profileDocumentTitle({
      tab: parseProfileTab(tab, query.length > 0),
      settings: parseSettingsFlag(settings, tab),
      query,
    }),
  };
}

const PROFILE_SHELF_SIZE = 8;

type ProfileShelfItem = {
  id: string;
  title: string;
  artist: string;
  year: number | null;
  label: string | null;
  genres: string[];
  coverUrl: string | null;
  isFavorite: boolean;
  format: MediaFormat;
  discogsId: number | null;
  barcode: string | null;
  catalogNumber: string | null;
  condition: MediaCondition | null;
  purchaseLocation: string | null;
  purchaseDate: Date | null;
};

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
  const engagement = profileEngagement({ keptClose: keptCloseTotal, waiting: waitingTotal });
  const favoritePages = pageCount(favoritesTotal);
  const wishlistPages = pageCount(wishlistTotal);
  const elsewhere = hasQuery ? explorerSearchHref({ query }) : null;
  const shelfQuiet =
    (tab === "close" && favorites.length === 0) || (tab === "waiting" && wishlist.length === 0);
  const formats = enabledFormats(settings);

  return (
    <AppShell>
      <PageHeader
        title="Profile"
        description={`${session.user.name} · ${session.user.email}`}
        extra={
          settings.bio ? (
            <p className="max-w-xl text-sm leading-6 text-text-secondary">{settings.bio}</p>
          ) : null
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
                  <SheetSection icon={FolderDown} title="Discogs shelf">
                    <ImportDiscogsForm />
                  </SheetSection>
                  <SheetSection icon={Download} title="Keep a copy">
                    <ExportResonanceLink />
                    <RestoreResonanceForm />
                  </SheetSection>
                  <SheetSection icon={Settings} title="Settings">
                    <ProfileSettingsForm name={session.user.name} image={session.user.image} settings={settings} />
                  </SheetSection>
                  <SheetSection icon={KeyRound} title="Password">
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

      <ProfileChips active={tab} query={listen.query} />

      {tab === "resonance" ? <CollectionStats insight={insight} engagement={engagement} /> : null}

      {tab === "resonance" && insight.total === 0 && engagement.length === 0 ? (
        <p className="text-sm leading-6 text-text-secondary">
          Your shelf is waiting. Add a record, and the story of your sound will gather here.
        </p>
      ) : null}

      {tab === "close" || tab === "waiting" ? (
        <ProfileSearch tab={tab} query={query} elsewhere={elsewhere} isQuiet={shelfQuiet} />
      ) : null}

      {hasQuery && shelfQuiet && elsewhere ? (
        <p className="text-sm leading-6 text-text-secondary">
          These sounds may still be waiting beyond the shelf.
        </p>
      ) : null}

      {tab === "close" ? (
        <ProfileShelf
          icon={Heart}
          title="Favorites"
          empty={hasQuery ? "Nothing you keep close matches that." : "Nothing marked yet. Let a record stay."}
          emptyFurther="Nothing more marked this close."
          items={favorites}
          from={profileHref(listenHref)}
          page={favPage}
          pages={favoritePages}
          hrefFor={(next) => profileHref({ tab: "close", query: listen.query, favPage: next })}
          canKeepClose
          further="There are more records you keep close."
          end="These are all the records you keep close."
          label="More favorites"
        />
      ) : null}

      {tab === "waiting" ? (
        <ProfileShelf
          icon={Bookmark}
          title="Wishlist"
          empty={hasQuery ? "Nothing waiting matches that." : "Albums you want to acquire will wait here."}
          emptyFurther="Nothing more is waiting on this row."
          items={wishlist}
          from={profileHref(listenHref)}
          page={wishPage}
          pages={wishlistPages}
          hrefFor={(next) => profileHref({ tab: "waiting", query: listen.query, wishPage: next })}
          further="There are more pressings waiting."
          end="You have heard the last of what is waiting."
          label="More waiting"
        />
      ) : null}
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
      <p className="flex items-center gap-2 text-lg font-semibold text-text">
        <Icon className="size-5 shrink-0 text-text-secondary" aria-hidden />
        {title}
      </p>
      {children}
    </section>
  );
}

function pageCount(total: number): number {
  return Math.max(1, Math.min(MAX_COLLECTION_PAGE, Math.ceil(total / PROFILE_SHELF_SIZE)));
}

function ProfileShelf({
  icon: Icon,
  title,
  empty,
  emptyFurther,
  items,
  from,
  page,
  pages,
  hrefFor,
  canKeepClose = false,
  further,
  end,
  label,
}: {
  icon: LucideIcon;
  title: string;
  empty: string;
  emptyFurther: string;
  items: ProfileShelfItem[];
  from: string;
  page: number;
  pages: number;
  hrefFor: (page: number) => string;
  canKeepClose?: boolean;
  further: string;
  end: string;
  label: string;
}) {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeading icon={Icon}>{title}</SectionHeading>
      {items.length === 0 ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm leading-6 text-text-secondary">{page > 1 ? emptyFurther : empty}</p>
          {page > 1 ? (
            <ButtonLink href={hrefFor(1)} variant="ghost" className="self-start">
              <ChevronLeft className="size-4 shrink-0" aria-hidden />
              Back to the first records
            </ButtonLink>
          ) : null}
        </div>
      ) : (
        <>
          <ItemRow items={items} from={from} canKeepClose={canKeepClose} />
          <ProfilePager
            page={page}
            pages={pages}
            hrefFor={hrefFor}
            further={further}
            end={end}
            label={label}
          />
        </>
      )}
    </section>
  );
}

function ProfilePager({
  page,
  pages,
  hrefFor,
  further,
  end,
  label,
}: {
  page: number;
  pages: number;
  hrefFor: (page: number) => string;
  further: string;
  end: string;
  label: string;
}) {
  if (pages <= 1) {
    return null;
  }

  const hasEarlier = page > 1;
  const hasFurther = page < pages;

  return (
    <nav aria-label={label} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm leading-6 text-text-secondary">{hasFurther ? further : end}</p>
      <div className="flex flex-wrap gap-3">
        {hasEarlier ? (
          <ButtonLink href={hrefFor(page - 1)} variant="ghost">
            <ChevronLeft className="size-4 shrink-0" aria-hidden />
            The ones before
          </ButtonLink>
        ) : null}
        {hasFurther ? (
          <ButtonLink href={hrefFor(page + 1)}>
            Listen further
            <ChevronRight className="size-4 shrink-0" aria-hidden />
          </ButtonLink>
        ) : null}
      </div>
    </nav>
  );
}

function ItemRow({
  items,
  from,
  canKeepClose = false,
}: {
  items: ProfileShelfItem[];
  from: string;
  canKeepClose?: boolean;
}) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
      {items.map((item) => {
        const href = journalFromHref(item.id, from);
        const tile = (
          <RecordTile
            href={href}
            coverUrl={item.coverUrl}
            title={item.title}
            artist={item.artist}
            year={item.year}
            format={item.format}
            threads={shelfCardThreads(
              {
                artist: item.artist,
                year: item.year,
                label: item.label,
                genres: item.genres,
                format: item.format,
                condition: item.condition,
                found: item.purchaseLocation,
                foundWhen: item.purchaseDate,
              },
              {},
            )}
          />
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
              catalogNumber={item.catalogNumber}
              canKeepClose={canKeepClose}
              canRelease={true}
              isFavorite={item.isFavorite}
            >
              <ReleaseSlot id={item.id}>
                {canKeepClose ? (
                  <KeptCloseSlot id={item.id} isFavorite={item.isFavorite} layout="cover">
                    {tile}
                  </KeptCloseSlot>
                ) : (
                  tile
                )}
              </ReleaseSlot>
            </RecordMenu>
          </li>
        );
      })}
    </ul>
  );
}
