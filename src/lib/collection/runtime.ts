import type { RecordSide, RecordTrack } from "@/lib/collection/types";
import { t } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/settings/types";

export function pressingListen(sides: readonly RecordSide[], locale: Locale = "en"): string | null {
  const tracks = sides.flatMap((side) => side.tracks);

  if (tracks.length === 0) {
    return null;
  }

  const count =
    tracks.length === 1 ? t(locale, "journal.trackOne") : t(locale, "journal.tracks", { count: tracks.length });
  const runtime = runtimeLabel(tracks, locale);

  if (!runtime) {
    return t(locale, "journal.holdsTracks", { count });
  }

  return t(locale, "journal.holdsAndRuns", { count, runtime });
}

export function pressingRuntime(sides: readonly RecordSide[], locale: Locale = "en"): string | null {
  const label = runtimeLabel(sides.flatMap((side) => side.tracks), locale);
  return label ? t(locale, "journal.runs", { runtime: label }) : null;
}

export function sideRuntime(side: RecordSide | undefined, locale: Locale = "en"): string | null {
  if (!side) {
    return null;
  }

  return runtimeLabel(side.tracks, locale);
}

function runtimeLabel(tracks: readonly RecordTrack[], locale: Locale = "en"): string | null {
  if (tracks.length === 0) {
    return null;
  }

  let totalSeconds = 0;

  for (const track of tracks) {
    const seconds = parseDurationSeconds(track.duration);

    if (seconds === null) {
      return null;
    }

    totalSeconds += seconds;
  }

  return formatRuntimeLabel(totalSeconds, locale);
}

function parseDurationSeconds(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parts = value.trim().split(":");

  if (parts.length !== 2 && parts.length !== 3) {
    return null;
  }

  const numbers = parts.map((part) => Number.parseInt(part, 10));

  if (numbers.some((part) => !Number.isInteger(part) || part < 0)) {
    return null;
  }

  if (parts.length === 2) {
    const [minutes, seconds] = numbers;
    return (minutes ?? 0) * 60 + (seconds ?? 0);
  }

  const [hours, minutes, seconds] = numbers;
  return (hours ?? 0) * 3600 + (minutes ?? 0) * 60 + (seconds ?? 0);
}

function formatRuntimeLabel(totalSeconds: number, locale: Locale): string {
  if (totalSeconds < 60) {
    const seconds = Math.max(1, Math.round(totalSeconds));
    return seconds === 1 ? t(locale, "journal.secondOne") : t(locale, "journal.seconds", { count: seconds });
  }

  const minutes = Math.round(totalSeconds / 60);

  if (minutes < 60) {
    return minutes === 1 ? t(locale, "journal.minuteOne") : t(locale, "journal.minutes", { count: minutes });
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const hourPart = hours === 1 ? t(locale, "journal.hourOne") : t(locale, "journal.hours", { count: hours });

  if (rest === 0) {
    return hourPart;
  }

  const minutePart = rest === 1 ? t(locale, "journal.minuteOne") : t(locale, "journal.minutes", { count: rest });
  return `${hourPart} ${minutePart}`;
}
