"use client";

import { ScanSearch, Search, SearchX } from "lucide-react";
import { useCallback } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { SearchField } from "@/components/ui/search-field";
import { useInstantSearch } from "@/components/ui/use-instant-search";
import { profileFromSearchInput, profileHref, type ProfileTab } from "@/lib/profile/types";

interface ProfileSearchProps {
  tab: ProfileTab;
  query: string;
  elsewhere: string | null;
  isQuiet: boolean;
}

export function ProfileSearch({ tab, query, elsewhere, isQuiet }: ProfileSearchProps) {
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
      className="flex flex-col gap-3 sm:flex-row"
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
        placeholder="Title, artist, label, barcode, memory…"
        label="Search what you keep close, what is waiting, and the memories beside them"
      />
      <Button type="submit">
        <Search className="size-4 shrink-0" aria-hidden />
        Search
      </Button>
      {hasQuery && elsewhere ? (
        <ButtonLink href={elsewhere} variant={isQuiet ? "primary" : "ghost"}>
          <ScanSearch className="size-4 shrink-0" aria-hidden />
          Hear it elsewhere
        </ButtonLink>
      ) : null}
      {hasQuery ? (
        <ButtonLink href={profileHref({ tab })} variant="ghost">
          <SearchX className="size-4 shrink-0" aria-hidden />
          Clear search
        </ButtonLink>
      ) : null}
    </form>
  );
}
