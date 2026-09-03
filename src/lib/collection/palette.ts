import { mainNavHref, type MainNavPath } from "@/components/return-path";
import { collectionHref, journalFromHref } from "@/lib/collection/href";
import type { MediaFormat } from "@/lib/collection/types";
import { explorerSearchHref } from "@/lib/discogs/href";
import { formatLabel } from "@/lib/i18n/labels";
import { t } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/settings/types";

export const PALETTE_QUERY_MAX = 80;
export const PALETTE_RECORD_MAX = 8;
export const KEYS_HELP_EVENT = "resonance:keys";

export const PALETTE_GO_HREFS = {
  c: "/collection",
  t: "/collection/tonight",
  e: "/explorer",
  p: "/profile",
  k: "/profile?tab=close",
  w: "/profile?tab=waiting",
  s: "/profile?settings=1",
} as const;

const PALETTE_GO_FORMAT_KEYS: Record<string, MediaFormat> = {
  v: "vinyl",
  a: "cassette",
  d: "cd",
};

const FORMAT_PALETTE_HINT: Record<MediaFormat, string> = {
  vinyl: "g v",
  cassette: "g a",
  cd: "g d",
};

export interface PaletteNavContext {
  location: { pathname: string; search: string };
  stored: Partial<Record<MainNavPath, string | null>>;
}

const PALETTE_GO_TABS: Record<string, MainNavPath> = {
  c: "/collection",
  e: "/explorer",
  p: "/profile",
};

const PALETTE_COMMAND_TABS: Record<string, MainNavPath> = {
  collection: "/collection",
  explorer: "/explorer",
  profile: "/profile",
};

export function paletteGoHref(
  key: string,
  formats: readonly MediaFormat[] = [],
  nav?: PaletteNavContext,
): string | undefined {
  const quiet = PALETTE_GO_HREFS[key as keyof typeof PALETTE_GO_HREFS];

  if (quiet) {
    const tab = PALETTE_GO_TABS[key];

    if (tab && nav) {
      return mainNavHref(tab, nav.location, nav.stored[tab] ?? null);
    }

    return quiet;
  }

  if (formats.length <= 1) {
    return undefined;
  }

  const format = PALETTE_GO_FORMAT_KEYS[key];

  if (!format || !formats.includes(format)) {
    return undefined;
  }

  return collectionHref({ format });
}

function withPaletteNav(command: PaletteCommand, nav?: PaletteNavContext): PaletteCommand {
  const tab = PALETTE_COMMAND_TABS[command.id];

  if (!tab || !nav) {
    return command;
  }

  return {
    ...command,
    href: mainNavHref(tab, nav.location, nav.stored[tab] ?? null),
  };
}

export interface PaletteCommand {
  id: string;
  label: string;
  hint?: string;
  keywords: string[];
  href?: string;
  action?: "focus-search" | "focus-listen" | "keys";
}

export interface PaletteRecord {
  id: string;
  artist: string;
  title: string;
}

export const PALETTE_COMMANDS: PaletteCommand[] = [
  {
    id: "search",
    label: "Search this shelf",
    hint: "/",
    keywords: ["search", "find", "hear"],
    action: "focus-search",
  },
  {
    id: "listen",
    label: "Shape this listen",
    hint: "l",
    keywords: ["listen", "thread", "genre", "shape"],
    action: "focus-listen",
  },
  {
    id: "collection",
    label: "Collection",
    hint: "g c",
    keywords: ["shelf", "records", "vinyl"],
    href: PALETTE_GO_HREFS.c,
  },
  {
    id: "tonight",
    label: "Tonight on the shelf",
    hint: "g t",
    keywords: ["tonight", "play", "now"],
    href: PALETTE_GO_HREFS.t,
  },
  {
    id: "explorer",
    label: "Explorer",
    hint: "n",
    keywords: ["add", "discogs", "scan"],
    href: "/explorer",
  },
  {
    id: "profile",
    label: "Profile",
    hint: "g p",
    keywords: ["you", "stats", "bio"],
    href: PALETTE_GO_HREFS.p,
  },
  {
    id: "close",
    label: "Kept close",
    hint: "g k",
    keywords: ["favorite", "kept"],
    href: PALETTE_GO_HREFS.k,
  },
  {
    id: "waiting",
    label: "Waiting",
    hint: "g w",
    keywords: ["wishlist", "want", "waiting"],
    href: PALETTE_GO_HREFS.w,
  },
  {
    id: "settings",
    label: "Settings",
    hint: "g s",
    keywords: ["theme", "formats", "copy", "password"],
    href: PALETTE_GO_HREFS.s,
  },
  {
    id: "keys",
    label: "Keys",
    hint: "?",
    keywords: ["shortcuts", "help"],
    action: "keys",
  },
];

const PALETTE_LABEL_KEY: Record<string, string> = {
  search: "palette.search",
  listen: "palette.listen",
  collection: "palette.collection",
  tonight: "palette.tonight",
  explorer: "palette.explorer",
  profile: "palette.profile",
  close: "palette.close",
  waiting: "palette.waiting",
  settings: "palette.settings",
  keys: "palette.keys",
};

export function paletteFormatCommands(
  formats: readonly MediaFormat[],
  locale: Locale = "en",
): PaletteCommand[] {
  if (formats.length <= 1) {
    return [];
  }

  return formats.map((format) => ({
    id: `format:${format}`,
    label: formatLabel(locale, format),
    hint: FORMAT_PALETTE_HINT[format],
    keywords: [format, "format"],
    href: collectionHref({ format }),
  }));
}

export function paletteCommands(
  formats: readonly MediaFormat[] = [],
  nav?: PaletteNavContext,
  locale: Locale = "en",
): PaletteCommand[] {
  const formatRows = paletteFormatCommands(formats, locale);
  const commands = PALETTE_COMMANDS.map((command) => {
    const key = PALETTE_LABEL_KEY[command.id];
    const labeled = key ? { ...command, label: t(locale, key) } : command;
    return withPaletteNav(labeled, nav);
  });

  if (formatRows.length === 0) {
    return commands;
  }

  const collectionIndex = commands.findIndex((command) => command.id === "collection");
  commands.splice(collectionIndex + 1, 0, ...formatRows);
  return commands;
}

export function filterPaletteCommands(query: string, commands: readonly PaletteCommand[]): PaletteCommand[] {
  const needle = query.trim().toLowerCase();

  if (needle.length === 0) {
    return [...commands];
  }

  return commands.filter((command) => {
    if (command.label.toLowerCase().includes(needle)) {
      return true;
    }

    return command.keywords.some((keyword) => keyword.includes(needle) || needle.includes(keyword));
  });
}

export function paletteRecordRows(
  records: readonly PaletteRecord[],
  query: string,
  from?: string | null,
): PaletteCommand[] {
  const needle = query.trim().toLowerCase();
  const matched =
    needle.length === 0
      ? records
      : records.filter((record) => {
          return record.artist.toLowerCase().includes(needle) || record.title.toLowerCase().includes(needle);
        });

  return matched.slice(0, PALETTE_RECORD_MAX).map((record) => ({
    id: `record:${record.id}`,
    label: `${record.artist} — ${record.title}`,
    keywords: [],
    href: journalFromHref(record.id, from),
  }));
}

export function paletteRows(
  query: string,
  records: readonly PaletteRecord[] = [],
  formats: readonly MediaFormat[] = [],
  from?: string | null,
  nav?: PaletteNavContext,
  locale: Locale = "en",
): PaletteCommand[] {
  const typed = query.trim().slice(0, PALETTE_QUERY_MAX);
  const rows: PaletteCommand[] = [];

  if (typed.length > 0) {
    rows.push({
      id: "hear-shelf",
      label: t(locale, "palette.hearShelf", { query: typed }),
      keywords: [],
      href: collectionHref({ query: typed }),
    });
    rows.push({
      id: "hear-explorer",
      label: t(locale, "palette.hearExplorer", { query: typed }),
      keywords: [],
      href: explorerSearchHref({ query: typed }),
    });
  }

  rows.push(...paletteRecordRows(records, typed, from));
  rows.push(...filterPaletteCommands(typed, paletteCommands(formats, nav, locale)));
  return rows;
}
