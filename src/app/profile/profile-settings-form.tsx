"use client";

import { LayoutGrid, Monitor, Moon, Save, Sun, UserRound } from "lucide-react";
import { useActionState, useEffect } from "react";

import { saveSettingsAction, type SaveSettingsState } from "@/app/profile/actions";
import { Button } from "@/components/ui/button";
import { choiceChipClass } from "@/components/ui/chip";
import { fieldsetClass, legendClass } from "@/components/ui/control";
import { TextAreaField, TextField } from "@/components/ui/field";
import { formatIcons, formatLabels } from "@/components/ui/format-icon";
import { Notice } from "@/components/ui/notice";
import { MEDIA_FORMATS, type MediaFormat } from "@/lib/collection/types";
import { MAX_DISPLAY_NAME } from "@/lib/profile/types";
import {
  THEME_PREFERENCES,
  VIEW_MODES,
  enabledFormats,
  preferredFormat,
  type ThemePreference,
  type UserSettings,
  type ViewMode,
} from "@/lib/settings/types";

const initialState: SaveSettingsState = { error: null, saved: false };

const themeLabel: Record<ThemePreference, string> = {
  light: "Light",
  dark: "Dark",
  auto: "Auto",
};

const themeIcons = {
  light: Sun,
  dark: Moon,
  auto: Monitor,
} as const;

const viewLabel: Record<ViewMode, string> = {
  list: "Auto",
  grid: "Grid",
};

const viewIcons = {
  list: Monitor,
  grid: LayoutGrid,
} as const;

interface ProfileSettingsFormProps {
  name: string;
  settings: UserSettings;
}

export function ProfileSettingsForm({ name, settings }: ProfileSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(saveSettingsAction, initialState);
  const leadingFormat = preferredFormat(enabledFormats(settings), settings.defaultFormat);

  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <TextField
        id="name"
        name="name"
        type="text"
        label="Name"
        autoComplete="name"
        required
        maxLength={MAX_DISPLAY_NAME}
        defaultValue={name}
        icon={UserRound}
      />

      <TextAreaField
        id="bio"
        name="bio"
        label="Bio"
        rows={3}
        maxLength={280}
        defaultValue={settings.bio ?? ""}
        placeholder="A few words about the records that stay with you."
      />

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>Theme</legend>
        <div className="flex flex-wrap gap-2">
          {THEME_PREFERENCES.map((theme) => {
            const Icon = themeIcons[theme];

            return (
              <label key={theme} className={choiceChipClass}>
                <input
                  type="radio"
                  name="theme"
                  value={theme}
                  defaultChecked={theme === settings.theme}
                  className="sr-only"
                  onChange={() => applyTheme(theme)}
                />
                <Icon className="size-4 shrink-0" aria-hidden />
                {themeLabel[theme]}
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>Shelf layout</legend>
        <p className="text-sm leading-6 text-text-secondary">
          Auto keeps a list in your hand, and opens the covers on a wide desk.
        </p>
        <div className="flex flex-wrap gap-2">
          {VIEW_MODES.map((view) => {
            const Icon = viewIcons[view];

            return (
              <label key={view} className={choiceChipClass}>
                <input
                  type="radio"
                  name="viewMode"
                  value={view}
                  defaultChecked={view === settings.viewMode}
                  className="sr-only"
                />
                <Icon className="size-4 shrink-0" aria-hidden />
                {viewLabel[view]}
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>Formats you collect</legend>
        <div className="flex flex-wrap gap-2">
          {MEDIA_FORMATS.map((format) => {
            const Icon = formatIcons[format];

            return (
              <label key={format} className={choiceChipClass}>
                <input
                  type="checkbox"
                  name={`${format}Enabled`}
                  defaultChecked={isFormatEnabled(settings, format)}
                  className="sr-only"
                />
                <Icon className="size-4 shrink-0" aria-hidden />
                {formatLabels[format]}
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>The format that leads</legend>
        <p className="text-sm leading-6 text-text-secondary">
          Explorer starts here. Confirm follows when this pressing already lives with you.
        </p>
        <div className="flex flex-wrap gap-2">
          {MEDIA_FORMATS.map((format) => {
            const Icon = formatIcons[format];

            return (
              <label key={format} className={choiceChipClass}>
                <input
                  type="radio"
                  name="defaultFormat"
                  value={format}
                  defaultChecked={format === leadingFormat}
                  className="sr-only"
                />
                <Icon className="size-4 shrink-0" aria-hidden />
                {formatLabels[format]}
              </label>
            );
          })}
        </div>
      </fieldset>

      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      {state.saved ? <Notice tone="success">Your space is updated.</Notice> : null}

      <Button type="submit" disabled={isPending}>
        <Save className="size-4 shrink-0" aria-hidden />
        {isPending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}

function isFormatEnabled(settings: UserSettings, format: MediaFormat): boolean {
  if (format === "vinyl") {
    return settings.vinylEnabled;
  }

  if (format === "cassette") {
    return settings.cassetteEnabled;
  }

  return settings.cdEnabled;
}

function applyTheme(theme: ThemePreference) {
  try {
    window.localStorage.setItem("resonance-theme", theme);
    const isDark =
      theme === "dark" ||
      (theme !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  } catch {
    document.documentElement.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
  }
}
