"use client";

import { ScanSearch, Search } from "lucide-react";
import { useCallback, type ReactNode } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { BusyGlyph } from "@/components/ui/listening-wave";
import { SearchField } from "@/components/ui/search-field";
import { SearchListenRoot } from "@/components/ui/search-listen";
import { useInstantSearch } from "@/components/ui/use-instant-search";
import { useT } from "@/components/locale-provider";
import { profileFromSearchInput, profileHref, type ProfileTab } from "@/lib/profile/types";

interface ProfileSearchProps {
  tab: ProfileTab;
  query: string;
  elsewhere: string | null;
  isQuiet: boolean;
  children: ReactNode;
}

export function ProfileSearch({ tab, query, elsewhere, isQuiet, children }: ProfileSearchProps) {
  const t = useT();
  const hrefFor = useCallback(
    (value: string) => profileHref(profileFromSearchInput(tab, value)),
    [tab],
  );
  const { value, setValue, isListening, onSubmit } = useInstantSearch(query, hrefFor);
  const hasQuery = query.length > 0;

  return (
    <SearchListenRoot isListening={isListening} label={t("common.listening")}>
      <form
        action="/profile"
        method="get"
        className="flex flex-wrap gap-3"
        aria-busy={isListening}
        onSubmit={onSubmit}
      >
        <input type="hidden" name="tab" value={tab} />
        <SearchField
          id="profile-q"
          name="q"
          value={value}
          onValueChange={setValue}
          isPending={isListening}
          placeholder={t("profile.searchPlaceholder")}
          label={t("profile.searchLabel")}
          clearLabel={t("common.clearSearch")}
        />
        <Button
          type="submit"
          className="shrink-0 px-4 sm:px-6"
          aria-label={isListening ? t("common.listening") : t("common.search")}
        >
          <BusyGlyph isBusy={isListening}>
            <Search className="size-4 shrink-0" aria-hidden />
          </BusyGlyph>
          <span>{isListening ? t("common.listening") : t("common.search")}</span>
        </Button>
        {hasQuery && elsewhere ? (
          <ButtonLink href={elsewhere} variant={isQuiet ? "primary" : "ghost"}>
            <ScanSearch className="size-4 shrink-0" aria-hidden />
            {t("common.hearElsewhere")}
          </ButtonLink>
        ) : null}
      </form>
      <div className="flex flex-col gap-4">{children}</div>
    </SearchListenRoot>
  );
}
