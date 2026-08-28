"use client";

import { Ear, Image, Languages, LayoutGrid, Monitor, Moon, Save, Sun, UserRound } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

import { saveSettingsAction, type SaveSettingsState } from "@/app/profile/actions";
import { Button } from "@/components/ui/button";
import { choiceChipClass } from "@/components/ui/chip";
import { fieldsetClass, legendClass } from "@/components/ui/control";
import { TextAreaField, TextField } from "@/components/ui/field";
import { formatIcons, formatLabels } from "@/components/ui/format-icon";
import { Notice } from "@/components/ui/notice";
import { MEDIA_FORMATS, type MediaFormat } from "@/lib/collection/types";
import { t } from "@/lib/i18n/translate";
import { MAX_DISPLAY_NAME, MAX_PORTRAIT_URL } from "@/lib/profile/types";
import {
  LOCALES,
  THEME_PREFERENCES,
  VIEW_MODES,
  enabledFormats,
  preferredFormat,
  type Locale,
  type ThemePreference,
  type UserSettings,
} from "@/lib/settings/types";

const initialState: SaveSettingsState = { error: null, saved: false };

const themeIcons = {
  light: Sun,
  dark: Moon,
  auto: Monitor,
} as const;

const viewIcons = {
  list: Monitor,
  grid: LayoutGrid,
} as const;

interface ProfileSettingsFormProps {
  name: string;
  image?: string | null;
  settings: UserSettings;
}

export function ProfileSettingsForm({ name, image = null, settings }: ProfileSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(saveSettingsAction, initialState);
  const [locale, setLocale] = useState<Locale>(settings.locale);
  const leadingFormat = preferredFormat(enabledFormats(settings), settings.defaultFormat);

  useEffect(() => {
    setLocale(settings.locale);
  }, [settings.locale]);

  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <TextField
        id="name"
        name="name"
        type="text"
        label={t(locale, "settings.name")}
        autoComplete="name"
        required
        maxLength={MAX_DISPLAY_NAME}
        defaultValue={name}
        icon={UserRound}
      />

      <TextField
        id="portrait"
        name="portrait"
        type="url"
        label={t(locale, "settings.portrait")}
        autoComplete="photo"
        inputMode="url"
        maxLength={MAX_PORTRAIT_URL}
        defaultValue={image ?? ""}
        placeholder={t(locale, "settings.portraitPlaceholder")}
        icon={Image}
      />
      <p className="-mt-3 text-sm leading-6 text-text-secondary">{t(locale, "settings.portraitHint")}</p>

      <TextAreaField
        id="bio"
        name="bio"
        label={t(locale, "settings.bio")}
        rows={3}
        maxLength={280}
        defaultValue={settings.bio ?? ""}
        placeholder={t(locale, "settings.bioPlaceholder")}
      />

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>{t(locale, "settings.language")}</legend>
        <div className="flex flex-wrap gap-2">
          {LOCALES.map((option) => (
            <label key={option} className={choiceChipClass}>
              <input
                type="radio"
                name="locale"
                value={option}
                checked={option === locale}
                className="sr-only"
                onChange={() => setLocale(option)}
              />
              <Languages className="size-4 shrink-0" aria-hidden />
              {t(locale, option === "en" ? "settings.english" : "settings.french")}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>{t(locale, "settings.theme")}</legend>
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
                {themeLabel(locale, theme)}
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>{t(locale, "settings.shelfLayout")}</legend>
        <p className="text-sm leading-6 text-text-secondary">{t(locale, "settings.shelfLayoutHint")}</p>
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
                {t(locale, view === "list" ? "settings.layoutAuto" : "settings.layoutGrid")}
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>{t(locale, "settings.formats")}</legend>
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
        <legend className={legendClass}>{t(locale, "settings.leading")}</legend>
        <p className="text-sm leading-6 text-text-secondary">{t(locale, "settings.leadingHint")}</p>
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

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>{t(locale, "settings.market")}</legend>
        <p className="text-sm leading-6 text-text-secondary">{t(locale, "settings.marketHint")}</p>
        <label className={choiceChipClass}>
          <input
            type="checkbox"
            name="marketValueEnabled"
            defaultChecked={settings.marketValueEnabled}
            className="sr-only"
          />
          <Ear className="size-4 shrink-0" aria-hidden />
          {t(locale, "settings.marketOn")}
        </label>
      </fieldset>

      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      {state.saved ? <Notice tone="success">{t(locale, "settings.saved")}</Notice> : null}

      <Button type="submit" disabled={isPending}>
        <Save className="size-4 shrink-0" aria-hidden />
        {isPending ? t(locale, "settings.saving") : t(locale, "settings.save")}
      </Button>
    </form>
  );
}

function themeLabel(locale: Locale, theme: ThemePreference): string {
  if (theme === "light") {
    return t(locale, "settings.light");
  }

  if (theme === "dark") {
    return t(locale, "settings.dark");
  }

  return t(locale, "settings.auto");
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
