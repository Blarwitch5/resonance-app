import type { RecordSide, RecordTrack } from "@/lib/collection/types";

export function pressingListen(sides: readonly RecordSide[]): string | null {
  const tracks = sides.flatMap((side) => side.tracks);

  if (tracks.length === 0) {
    return null;
  }

  const count = tracks.length === 1 ? "1 track" : `${tracks.length} tracks`;
  const runtime = runtimeLabel(tracks);

  if (!runtime) {
    return `This pressing holds ${count}.`;
  }

  return `This pressing holds ${count} and runs ${runtime}.`;
}

export function pressingRuntime(sides: readonly RecordSide[]): string | null {
  const label = runtimeLabel(sides.flatMap((side) => side.tracks));
  return label ? `This pressing runs ${label}.` : null;
}

export function sideRuntime(side: RecordSide | undefined): string | null {
  if (!side) {
    return null;
  }

  return runtimeLabel(side.tracks);
}

function runtimeLabel(tracks: readonly RecordTrack[]): string | null {
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

  return formatRuntimeLabel(totalSeconds);
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

function formatRuntimeLabel(totalSeconds: number): string {
  if (totalSeconds < 60) {
    const seconds = Math.max(1, Math.round(totalSeconds));
    return seconds === 1 ? "1 second" : `${seconds} seconds`;
  }

  const minutes = Math.round(totalSeconds / 60);

  if (minutes < 60) {
    return minutes === 1 ? "1 minute" : `${minutes} minutes`;
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const hourPart = hours === 1 ? "1 hour" : `${hours} hours`;

  if (rest === 0) {
    return hourPart;
  }

  const minutePart = rest === 1 ? "1 minute" : `${rest} minutes`;
  return `${hourPart} ${minutePart}`;
}
