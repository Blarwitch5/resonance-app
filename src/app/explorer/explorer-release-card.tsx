import { CirclePlus, Library } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { moveWishlistToShelfAction } from "@/app/explorer/actions";
import { HoldWaitingSlot } from "@/app/explorer/wishlist-release-form";
import { Button, ButtonLink } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { CoverArt } from "@/components/ui/cover-art";
import { PressingText } from "@/components/ui/pressing-text";
import { formatIcons } from "@/components/ui/format-tokens";
import { RecordMenu } from "@/components/ui/record-menu";
import { RecordTileCaption } from "@/components/ui/record-tile";
import { ShelfThreadLine } from "@/components/ui/shelf-thread";
import { metaClass, recordTitleClass } from "@/components/ui/type";
import { shelfListHitClass } from "@/lib/collection/layout";
import { recordMenuElsewhereHref } from "@/lib/collection/record-menu";
import { shelfCardDetails } from "@/lib/collection/shelf-threads";
import type { ReleaseDraft, ShelfPresence } from "@/lib/collection/types";
import {
  discogsReleaseHref,
  explorerAddHref,
  explorerCardHref,
  type ExplorerQuery,
} from "@/lib/discogs/href";
import { explorerCardThreads } from "@/lib/discogs/threads";
import { coverAlt, formatLabel } from "@/lib/i18n/labels";
import { t } from "@/lib/i18n/translate";
import type { Locale, ViewMode } from "@/lib/settings/types";

interface ExplorerReleaseCardProps {
  draft: ReleaseDraft;
  presence: ShelfPresence;
  listen?: ExplorerQuery;
  searchQuery?: string;
  from?: string;
  canWishlist?: boolean;
  priority?: boolean;
  locale?: Locale;
  layout?: ViewMode;
}

export function ExplorerReleaseCard({
  draft,
  presence,
  listen = {},
  searchQuery = "",
  from,
  canWishlist = false,
  priority = false,
  locale = "en",
  layout = "grid",
}: ExplorerReleaseCardProps) {
  const headingId = `release-${draft.discogsId ?? "unknown"}-title`;
  const href = explorerCardHref(presence, draft.discogsId, from);
  const addHref = draft.discogsId ? explorerAddHref(draft.discogsId, from) : null;
  const elsewhereHref = recordMenuElsewhereHref(draft.artist, draft.title, draft.format, searchQuery);
  const threads = explorerCardThreads(draft, listen, locale);
  const FormatGlyph = formatIcons[draft.format];
  const cover = (
    <CoverArt
      url={draft.coverUrl}
      compactUrl={draft.coverThumbUrl}
      alt={href ? "" : coverAlt(locale, draft.title, draft.artist)}
      sizes={layout === "list" ? "64px" : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"}
      priority={priority}
      isInteractive={Boolean(href)}
    />
  );
  const heading = (
    <h2
      id={headingId}
      className={
        layout === "list"
          ? `truncate ${recordTitleClass}`
          : `line-clamp-2 w-fit max-w-full ${recordTitleClass}`
      }
    >
      <PressingText>{draft.title}</PressingText>
    </h2>
  );
  const linkedHeading = href ? (
    <Link
      href={href}
      prefetch={false}
      className="rounded-rs-sm outline-none focus-visible:ring-2 focus-visible:ring-border-strong"
    >
      {heading}
    </Link>
  ) : (
    heading
  );
  const meta = (
    <ShelfThreadLine
      compact
      threads={[threads.artist, ...shelfCardDetails(threads)]}
      className={metaClass}
    />
  );
  const action = (
    <CardAction draft={draft} presence={presence} from={from} locale={locale} layout={layout} />
  );
  const card =
    layout === "list" ? (
      <article className={`flex min-h-14 items-center gap-3 py-2 ${shelfListHitClass}`} aria-labelledby={headingId}>
        {href ? (
          <Link
            href={href}
            prefetch={false}
            data-record-link=""
            aria-label={explorerCardLabel(draft.title, presence, locale)}
            className="w-16 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-border-strong"
          >
            {cover}
          </Link>
        ) : (
          <div className="w-16 shrink-0">{cover}</div>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex min-w-0 items-start gap-2">
            <div className="min-w-0">{linkedHeading}</div>
            <span className="mt-0.5 inline-flex shrink-0 text-text-tertiary">
              <FormatGlyph className="size-3.5" aria-hidden />
              <span className="sr-only">{formatLabel(locale, draft.format)}</span>
            </span>
          </div>
          {meta}
        </div>
        <div className="shrink-0">{action}</div>
      </article>
    ) : (
      <article className="flex h-full flex-col gap-2" aria-labelledby={headingId}>
        {href ? (
          <Link
            href={href}
            prefetch={false}
            data-record-link=""
            aria-label={explorerCardLabel(draft.title, presence, locale)}
            className="group block rounded-rs-md outline-none focus-visible:ring-2 focus-visible:ring-border-strong"
          >
            {cover}
          </Link>
        ) : (
          cover
        )}
        <RecordTileCaption
          heading={linkedHeading}
          format={draft.format}
          formatName={formatLabel(locale, draft.format)}
          artist={threads.artist}
          details={shelfCardDetails(threads)}
        />
        <div className="mt-auto">{action}</div>
      </article>
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
      catalogNumber={draft.catalogNumber}
      elsewhereHref={elsewhereHref}
      canSwipe={layout === "list"}
      layout={layout}
    >
      {withHoldWaiting(card, draft, presence, canWishlist)}
    </RecordMenu>
  );
}

function withHoldWaiting(
  card: ReactNode,
  draft: ReleaseDraft,
  presence: ShelfPresence,
  canWishlist: boolean,
): ReactNode {
  if (!canWishlist || presence.status !== "absent" || !draft.discogsId) {
    return card;
  }

  return (
    <HoldWaitingSlot discogsId={draft.discogsId} format={draft.format}>
      {card}
    </HoldWaitingSlot>
  );
}

function CardAction({
  draft,
  presence,
  from,
  locale,
  layout,
}: {
  draft: ReleaseDraft;
  presence: ShelfPresence;
  from?: string;
  locale: Locale;
  layout: ViewMode;
}) {
  if (presence.status === "owned") {
    return (
      <StatusPill tone="primary" icon={Library}>
        {t(locale, "explorer.onYourShelf")}
      </StatusPill>
    );
  }

  if (presence.status === "wishlist") {
    return (
      <form action={moveWishlistToShelfAction} data-move-shelf="">
        <input type="hidden" name="itemId" value={presence.itemId} />
        <Button
          type="submit"
          className="min-h-11 px-4"
          aria-label={t(locale, "explorer.moveToShelfAria", { title: draft.title })}
        >
          <Library className="size-4 shrink-0" aria-hidden />
          {t(locale, "explorer.moveToShelf")}
        </Button>
      </form>
    );
  }

  if (!draft.discogsId) {
    return null;
  }

  const addHref = explorerAddHref(draft.discogsId, from);

  if (!addHref) {
    return null;
  }

  const isList = layout === "list";

  return (
    <ButtonLink
      href={addHref}
      className={isList ? "min-h-11 min-w-11 px-0 sm:min-h-11 sm:px-0" : "min-h-11 px-4"}
      aria-label={t(locale, "explorer.addAria", { title: draft.title })}
    >
      <CirclePlus className="size-4 shrink-0" aria-hidden />
      {isList ? null : t(locale, "common.add")}
    </ButtonLink>
  );
}

function explorerCardLabel(title: string, presence: ShelfPresence, locale: Locale): string {
  if (presence.status === "owned" || presence.status === "wishlist") {
    return t(locale, "explorer.openJournalAria", { title });
  }

  return t(locale, "thread.hearMoreOf", { title });
}
