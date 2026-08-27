import { parseMediaFormat, type MediaFormat } from "@/lib/collection/types";

export const THEME_PREFERENCES = ["light", "dark", "auto"] as const;

export type ThemePreference = (typeof THEME_PREFERENCES)[number];

export const VIEW_MODES = ["list", "grid"] as const;

export type ViewMode = (typeof VIEW_MODES)[number];

export interface UserSettings {
  vinylEnabled: boolean;
  cassetteEnabled: boolean;
  cdEnabled: boolean;
  theme: ThemePreference;
  viewMode: ViewMode;
  defaultFormat: MediaFormat | null;
  bio: string | null;
  onboardedAt: Date | null;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  vinylEnabled: true,
  cassetteEnabled: true,
  cdEnabled: true,
  theme: "auto",
  viewMode: "list",
  defaultFormat: "vinyl",
  bio: null,
  onboardedAt: null,
};

export function enabledFormats(settings: UserSettings): MediaFormat[] {
  const formats: MediaFormat[] = [];

  if (settings.vinylEnabled) {
    formats.push("vinyl");
  }

  if (settings.cassetteEnabled) {
    formats.push("cassette");
  }

  if (settings.cdEnabled) {
    formats.push("cd");
  }

  return formats.length > 0 ? formats : ["vinyl"];
}

export function preferredFormat(
  enabled: readonly MediaFormat[],
  stored?: MediaFormat | null,
): MediaFormat {
  if (stored && enabled.includes(stored)) {
    return stored;
  }

  return enabled[0] ?? "vinyl";
}

export function parseDefaultFormat(value: string | undefined): MediaFormat | undefined {
  return parseMediaFormat(value);
}

export function parseThemePreference(value: string | undefined): ThemePreference | undefined {
  if (value === "light" || value === "dark" || value === "auto") {
    return value;
  }

  return undefined;
}

export function parseViewMode(value: string | undefined): ViewMode | undefined {
  if (value === "list" || value === "grid") {
    return value;
  }

  return undefined;
}

export function resolveShelfLayout(stored: ViewMode, isWide: boolean): ViewMode {
  if (stored === "grid") {
    return "grid";
  }

  return isWide ? "grid" : "list";
}
