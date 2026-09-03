"use client";

import { ScanSearch, Search } from "lucide-react";
import { useCallback } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { SearchField } from "@/components/ui/search-field";
import { useInstantSearch } from "@/components/ui/use-instant-search";
import { useT } from "@/components/locale-provider";
import { profileFromSearchInput, profileHref, type ProfileTab } from "@/lib/profile/types";

interface ProfileSearchProps {
  tab: ProfileTab;
  query: string;
  elsewhere: string | null;
  isQuiet: boolean;
}

export function ProfileSearch({ tab, query, elsewhere, isQuiet }: ProfileSearchProps) {
  const t = useT();
  const hrefFor = useCallback(
    (value: string) => profileHref(profileFromSearchInput(tab, value)),
    [tab],
  );
  const { value, setValue, isPending, onSubmit } = useInstantSearch(query, hrefFor);
  const hasQuery = query.length > 0;

  return (
    <form
      action="/profile"
      method="get"
      className="flex flex-wrap gap-3"
      aria-busy={isPending}
      onSubmit={onSubmit}
    >
      <input type="hidden" name="tab" value={tab} />
      <SearchField
        id="profile-q"
        name="q"
        value={value}
        onValueChange={setValue}
        isPending={isPending}
        placeholder={t("profile.searchPlaceholder")}
        label={t("profile.searchLabel")}
        clearLabel={t("common.clearSearch")}
      />
      <Button type="submit" className="shrink-0 px-4 sm:px-6" aria-label={t("common.search")}>
        <Search className="size-4 shrink-0" aria-hidden />
        <span className="hidden sm:inline">{t("common.search")}</span>
      </Button>
      {hasQuery && elsewhere ? (
        <ButtonLink href={elsewhere} variant={isQuiet ? "primary" : "ghost"}>
          <ScanSearch className="size-4 shrink-0" aria-hidden />
          {t("common.hearElsewhere")}
        </ButtonLink>
      ) : null}
    </form>
  );
}
