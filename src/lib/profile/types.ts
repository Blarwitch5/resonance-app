export const PROFILE_TABS = ["resonance", "close", "waiting"] as const;

export type ProfileTab = (typeof PROFILE_TABS)[number];

export interface ProfileQuery {
  tab?: ProfileTab;
  query?: string;
  favPage?: number;
  wishPage?: number;
  settings?: boolean;
}

export function parseProfileTab(value: string | undefined, hasQuery = false): ProfileTab {
  if (value === "close" || value === "waiting" || value === "resonance") {
    return value;
  }

  return hasQuery ? "close" : "resonance";
}

export function parseSettingsFlag(settings: string | undefined, tab?: string): boolean {
  return settings === "1" || tab === "settings";
}

export type ProfileNavId = ProfileTab | "settings";

export function profileNavHref(
  id: ProfileNavId,
  listen: Pick<ProfileQuery, "tab" | "query"> = {},
): string {
  if (id === "settings") {
    return profileHref({ ...listen, settings: true });
  }

  if (id === "close" || id === "waiting") {
    return profileHref({ tab: id, query: listen.query });
  }

  return profileHref({ tab: "resonance" });
}

export function profileNavHrefForPath(
  id: ProfileNavId,
  pathname: string,
  listen: Pick<ProfileQuery, "tab" | "query"> = {},
): string {
  if (pathname !== "/profile") {
    return profileNavHref(id);
  }

  return profileNavHref(id, listen);
}

export function isProfileNavActive(
  id: ProfileNavId,
  current: { tab: ProfileTab; settings: boolean },
): boolean {
  if (id === "settings") {
    return current.settings;
  }

  return !current.settings && current.tab === id;
}

export interface ProfileEngagementCard {
  id: "close" | "waiting";
  label: string;
  value: string;
  href: string;
  ariaLabel: string;
}

export function profileEngagement(input: { keptClose: number; waiting: number }): ProfileEngagementCard[] {
  const cards: ProfileEngagementCard[] = [];

  if (input.keptClose > 0) {
    cards.push({
      id: "close",
      label: "Kept close",
      value: input.keptClose === 1 ? "1 record" : `${input.keptClose} records`,
      href: profileHref({ tab: "close" }),
      ariaLabel: "Hear the records you keep close",
    });
  }

  if (input.waiting > 0) {
    cards.push({
      id: "waiting",
      label: "Waiting",
      value: input.waiting === 1 ? "1 pressing" : `${input.waiting} pressings`,
      href: profileHref({ tab: "waiting" }),
      ariaLabel: "Hear what is waiting",
    });
  }

  return cards;
}

export function profileHref(input: ProfileQuery = {}): string {
  const params = new URLSearchParams();
  const tab = input.tab ?? "resonance";

  if (tab !== "resonance") {
    params.set("tab", tab);
  }

  if (input.query) {
    params.set("q", input.query);
  }

  if (input.favPage && input.favPage > 1) {
    params.set("fav", String(input.favPage));
  }

  if (input.wishPage && input.wishPage > 1) {
    params.set("wish", String(input.wishPage));
  }

  if (input.settings) {
    params.set("settings", "1");
  }

  const search = params.toString();
  return search.length > 0 ? `/profile?${search}` : "/profile";
}

export function profileFromSearchInput(tab: ProfileTab, value: string): ProfileQuery {
  const query = value.trim();

  return {
    tab,
    query: query.length > 0 ? query : undefined,
  };
}

export const MAX_DISPLAY_NAME = 80;

export function parseDisplayName(value: string | undefined): string | undefined {
  const name = value?.trim() ?? "";

  if (name.length === 0 || name.length > MAX_DISPLAY_NAME) {
    return undefined;
  }

  return name;
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter((part) => part.length > 0);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    const word = parts[0] ?? "";
    return Array.from(word).slice(0, 2).join("").toUpperCase();
  }

  const first = Array.from(parts[0] ?? "")[0] ?? "";
  const last = Array.from(parts[parts.length - 1] ?? "")[0] ?? "";
  return `${first}${last}`.toUpperCase();
}
