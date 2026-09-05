"use client";

import { Calendar, Hourglass, Music, Tag, type LucideIcon } from "lucide-react";

import { ChipLink } from "@/components/ui/chip";
import { PressingText } from "@/components/ui/pressing-text";
import { useLocale } from "@/components/locale-provider";
import { decadeName } from "@/lib/i18n/labels";
import type { CollectionInsight } from "@/lib/collection/stats";
import type { ReleaseDraft } from "@/lib/collection/types";
import { explorerSearchHref, type ExplorerQuery } from "@/lib/discogs/href";
import {
  explorerThreadSuggestions,
  type ExplorerThreadChip,
  type ExplorerThreadKind,
} from "@/lib/discogs/threads";

const THREAD_ICONS: Record<ExplorerThreadKind, LucideIcon> = {
  genre: Music,
  label: Tag,
  decade: Hourglass,
  year: Calendar,
};

interface ExplorerFacetChipsProps {
  listen: ExplorerQuery;
  insight?: CollectionInsight | null;
  drafts?: readonly ReleaseDraft[];
  show?: "all" | "active" | "suggestions";
  source?: ExplorerThreadChip["source"];
}

export function ExplorerFacetChips({
  listen,
  insight = null,
  drafts = [],
  show = "all",
  source,
}: ExplorerFacetChipsProps) {
  const locale = useLocale();
  const suggestions =
    show === "active" ? [] : explorerThreadSuggestions({ listen, insight, drafts, locale });
  const visible = source ? suggestions.filter((chip) => chip.source === source) : suggestions;
  const hasActive = Boolean(
    listen.genre || listen.label || listen.decade !== undefined || listen.year !== undefined,
  );
  const showActive = show !== "suggestions";
  const showSuggestions = show !== "active";

  if (show === "active" && !hasActive) {
    return null;
  }

  if (show === "suggestions" && visible.length === 0) {
    return null;
  }

  if (show === "all" && !hasActive && visible.length === 0) {
    return null;
  }

  return (
    <>
      {showActive && listen.genre ? (
        <ChipLink href={explorerSearchHref({ ...listen, genre: undefined, page: 1 })} isActive>
          <Music className="size-4 shrink-0" aria-hidden />
          <PressingText>{listen.genre}</PressingText>
        </ChipLink>
      ) : null}
      {showActive && listen.label ? (
        <ChipLink href={explorerSearchHref({ ...listen, label: undefined, page: 1 })} isActive>
          <Tag className="size-4 shrink-0" aria-hidden />
          <PressingText>{listen.label}</PressingText>
        </ChipLink>
      ) : null}
      {showActive && listen.decade !== undefined ? (
        <ChipLink href={explorerSearchHref({ ...listen, decade: undefined, page: 1 })} isActive>
          <Hourglass className="size-4 shrink-0" aria-hidden />
          {decadeName(locale, listen.decade)}
        </ChipLink>
      ) : null}
      {showActive && listen.year !== undefined ? (
        <ChipLink href={explorerSearchHref({ ...listen, year: undefined, page: 1 })} isActive>
          <Calendar className="size-4 shrink-0" aria-hidden />
          {listen.year}
        </ChipLink>
      ) : null}
      {showSuggestions
        ? visible.map((suggestion) => {
            const Icon = THREAD_ICONS[suggestion.kind];

            return (
              <ChipLink
                key={suggestion.key}
                href={explorerSearchHref({ ...listen, ...suggestion.listen, page: 1 })}
                isActive={false}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {suggestion.kind === "genre" || suggestion.kind === "label" ? (
                  <PressingText>{suggestion.label}</PressingText>
                ) : (
                  suggestion.label
                )}
              </ChipLink>
            );
          })
        : null}
    </>
  );
}
