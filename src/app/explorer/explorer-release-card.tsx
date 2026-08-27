import {
  Bookmark,
  BookOpen,
  FaceSlightlySmilingPlus,
  Library,
  Music,
  ScanSearch,
} from "lucide-react";
import Link from "next/link";

import { moveWishlistToShelfAction } from "@/app/explorer/actions";
import { WishlistReleaseForm } from "@/app/explorer/wishlist-release-form";
import { Button, ButtonLink } from "@/components/ui/button";
import { ChipLink, StatusPill } from "@/components/ui/chip";
import { CoverArt } from "@/components/ui/cover-art";
import { FormatIcon } from "@/components/ui/format-icon";
import { ThreadLink } from "@/components/ui/pressing-threads";
import { RecordMenu } from "@/components/ui/record-menu";
import { ShelfThreadLine } from "@/components/ui/shelf-thread";
import { journalFromHref } from "@/lib/collection/href";
import { recordMenuElsewhereHref } from "@/lib/collection/record-menu";
import type { ReleaseDraft, ShelfPresence } from "@/lib/collection/types";
import {
  discogsReleaseHref,
  explorerAddHref,
  explorerCardHref,
  type ExplorerQuery,
} from "@/lib/discogs/href";
import { explorerCardThreads } from "@/lib/discogs/threads";

interface ExplorerReleaseCardProps {
  draft: ReleaseDraft;
  presence: ShelfPresence;
  listen?: ExplorerQuery;
  searchQuery?: string;
  from?: string;
  canWishlist?: boolean;
  priority?: boolean;
}

export function ExplorerReleaseCard({
  draft,
  presence,
  listen = {},
  searchQuery = "",
  from,
  canWishlist = false,
  priority = false,
}: ExplorerReleaseCardProps) {
  const headingId = `release-${draft.discogsId ?? "unknown"}-title`;
  const href = explorerCardHref(presence, draft.discogsId, from);
  const addHref = draft.discogsId ? explorerAddHref(draft.discogsId, from) : null;
  const elsewhereHref = recordMenuElsewhereHref(draft.artist, draft.title, draft.format, searchQuery);
  const threads = explorerCardThreads(draft, listen);
  const cover = (
    <CoverArt
      url={draft.coverUrl}
      alt={href ? "" : `Cover of ${draft.title} by ${draft.artist}`}
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      priority={priority}
      isInteractive={Boolean(href)}
    />
  );
  const heading = (
    <h2 id={headingId} className="line-clamp-2 text-sm leading-snug font-semibold text-text">
      {draft.title}
    </h2>
  );

  return (
    <RecordMenu
      href={href ?? addHref ?? "/explorer"}
      title={draft.title}
      artist={draft.artist}
      presence={presence}
      addHref={addHref}
      canHold={canWishlist}
      shareHref={draft.discogsId ? discogsReleaseHref(draft.discogsId) : null}
      barcode={draft.barcode}
      elsewhereHref={elsewhereHref}
    >
      <article className="flex h-full flex-col gap-3" aria-labelledby={headingId}>
        {href ? (
          <Link
            href={href}
            data-record-link=""
            aria-label={explorerCardLabel(draft.title, presence)}
            className="group flex flex-col gap-3 rounded-rs-md outline-none focus-visible:ring-2 focus-visible:ring-border-strong"
          >
            {cover}
            {heading}
          </Link>
        ) : (
          <>
            {cover}
            {heading}
          </>
        )}
        <FormatIcon
          format={draft.format}
          href={threads.format.href ?? undefined}
          aria-label={threads.format.ariaLabel ?? undefined}
        />
        <CardArtist artist={threads.artist} />
        <CardThreads threads={threads} />
        <div className="mt-auto">
          <CardAction
            draft={draft}
            presence={presence}
            from={from}
            canWishlist={canWishlist}
            elsewhereHref={elsewhereHref}
          />
        </div>
      </article>
    </RecordMenu>
  );
}

function CardArtist({ artist }: { artist: ReturnType<typeof explorerCardThreads>["artist"] }) {
  if (!artist) {
    return null;
  }

  if (artist.href && artist.ariaLabel) {
    return (
      <p className="truncate text-xs leading-5 text-text-secondary">
        <ThreadLink href={artist.href} ariaLabel={artist.ariaLabel}>
          {artist.label}
        </ThreadLink>
      </p>
    );
  }

  return <p className="truncate text-xs leading-5 text-text-secondary">{artist.label}</p>;
}

function CardThreads({ threads }: { threads: ReturnType<typeof explorerCardThreads> }) {
  if (!threads.year && !threads.decade && !threads.label && !threads.genre) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ShelfThreadLine
        threads={[threads.year, threads.decade, threads.label]}
        className="text-xs leading-5 text-text-tertiary"
      />
      {threads.genre ? (
        <ChipLink href={threads.genre.href} isActive={false} aria-label={threads.genre.ariaLabel}>
          <Music className="size-4 shrink-0" aria-hidden />
          {threads.genre.label}
        </ChipLink>
      ) : null}
    </div>
  );
}

function CardAction({
  draft,
  presence,
  from,
  canWishlist,
  elsewhereHref,
}: {
  draft: ReleaseDraft;
  presence: ShelfPresence;
  from?: string;
  canWishlist: boolean;
  elsewhereHref: string | null;
}) {
  if (presence.status === "owned") {
    return (
      <div className="flex flex-col gap-2">
        <StatusPill tone="primary" icon={Library}>
          On your shelf
        </StatusPill>
        <OpenJournalLink itemId={presence.itemId} title={draft.title} from={from} />
        <HearElsewhereLink title={draft.title} artist={draft.artist} href={elsewhereHref} />
      </div>
    );
  }

  if (presence.status === "wishlist") {
    return (
      <div className="flex flex-col gap-2">
        <StatusPill tone="secondary" icon={Bookmark}>
          Wishlisted
        </StatusPill>
        <form action={moveWishlistToShelfAction} data-move-shelf="">
          <input type="hidden" name="itemId" value={presence.itemId} />
          <Button
            type="submit"
            className="w-full min-h-11 px-3 text-xs"
            aria-label={`Move ${draft.title} to your shelf`}
          >
            <Library className="size-4 shrink-0" aria-hidden />
            Move to shelf
          </Button>
        </form>
        <OpenJournalLink itemId={presence.itemId} title={draft.title} from={from} />
        <HearElsewhereLink title={draft.title} artist={draft.artist} href={elsewhereHref} />
      </div>
    );
  }

  if (!draft.discogsId) {
    return null;
  }

  const addHref = explorerAddHref(draft.discogsId, from);

  if (!addHref) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <ButtonLink
        href={addHref}
        className="w-full min-h-11 px-3 text-xs"
        aria-label={`Add ${draft.title} to your resonance`}
      >
        <FaceSlightlySmilingPlus className="size-4 shrink-0" aria-hidden />
        Add
      </ButtonLink>
      {canWishlist ? (
        <WishlistReleaseForm discogsId={draft.discogsId} format={draft.format} title={draft.title} />
      ) : null}
    </div>
  );
}

function explorerCardLabel(title: string, presence: ShelfPresence): string {
  if (presence.status === "owned" || presence.status === "wishlist") {
    return `Open ${title} in your journal`;
  }

  return `Hear more of ${title}`;
}

function OpenJournalLink({ itemId, title, from }: { itemId: string; title: string; from?: string }) {
  return (
    <ButtonLink
      href={journalFromHref(itemId, from)}
      variant="ghost"
      className="w-full min-h-11 px-3 text-xs"
      aria-label={`Open ${title} in your journal`}
    >
      <BookOpen className="size-4 shrink-0" aria-hidden />
      Open journal
    </ButtonLink>
  );
}

function HearElsewhereLink({
  title,
  artist,
  href,
}: {
  title: string;
  artist: string;
  href: string | null;
}) {
  if (!href) {
    return null;
  }

  return (
    <ButtonLink
      href={href}
      variant="ghost"
      className="w-full min-h-11 px-3 text-xs"
      aria-label={`Hear other pressings of ${title} by ${artist}`}
    >
      <ScanSearch className="size-4 shrink-0" aria-hidden />
      Hear it elsewhere
    </ButtonLink>
  );
}
