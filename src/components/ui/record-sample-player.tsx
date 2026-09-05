"use client";

import { Pause, Play, SkipBack, SkipForward, X } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";

import { sampleDockClass } from "@/components/ui/chrome";
import { CoverArt } from "@/components/ui/cover-art";
import { Notice } from "@/components/ui/notice";
import { PressingText } from "@/components/ui/pressing-text";
import { RecordSideHeading } from "@/components/ui/record-side-heading";
import { recordTitleClass } from "@/components/ui/type";
import { useT, useLocale } from "@/components/locale-provider";
import type { RecordSide } from "@/lib/collection/types";
import {
  adjacentSample,
  hasQuietSampleTracks,
  sampleCueLabel,
  sampleCues,
  sampleListenHref,
  sampleNowPlaying,
  samplePlaybackFailure,
  samplePositionState,
  sampleSeekRatio,
  sampleSeekSeconds,
  shouldToggleSampleOnSpace,
  trackHasSample,
  type SampleCue,
} from "@/lib/deezer/preview";

interface RecordSamplePlayerProps {
  sides: RecordSide[];
  artist?: string;
  title?: string;
  coverUrl?: string | null;
  compactUrl?: string | null;
  keepClose?: ReactNode;
}

export function RecordSamplePlayer({
  sides,
  artist,
  title,
  coverUrl,
  compactUrl = null,
  keepClose,
}: RecordSamplePlayerProps) {
  const t = useT();
  const locale = useLocale();
  const audioRef = useRef<HTMLAudioElement>(null);
  const seekRef = useRef<HTMLDivElement>(null);
  const headingId = useId();
  const cues = useMemo(() => sampleCues(sides), [sides]);
  const [queued, setQueued] = useState<SampleCue | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const canSkip = cues.length > 1;
  const hasQuietTracks = useMemo(() => hasQuietSampleTracks(sides), [sides]);
  const previous = queued ? adjacentSample(cues, queued.key, -1) : null;
  const next = queued ? adjacentSample(cues, queued.key, 1) : null;
  const nowPlaying = queued
    ? sampleNowPlaying({
        track: queued.title,
        artist,
        album: title,
        coverUrl,
      })
    : null;

  useEffect(() => {
    const audio = audioRef.current;

    return () => {
      audio?.pause();
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const desk = window.matchMedia("(min-width: 1024px)");

    function syncDock() {
      if (!queued) {
        root.style.removeProperty("--rs-sample-dock");
        return;
      }

      root.style.setProperty("--rs-sample-dock", desk.matches ? "11rem" : "10rem");
    }

    syncDock();
    desk.addEventListener("change", syncDock);

    return () => {
      desk.removeEventListener("change", syncDock);
      root.style.removeProperty("--rs-sample-dock");
    };
  }, [queued]);

  const startSample = useCallback(async (sample: SampleCue) => {
    const audio = audioRef.current;
    const href = sampleListenHref(sample.url);

    if (!audio || !href) {
      setQueued(sample);
      setIsPlaying(false);
      setError(t("sample.couldNotHear"));
      return;
    }

    setQueued(sample);
    setProgress(0);
    setDuration(0);
    setError(null);
    audio.src = href;

    try {
      await audio.play();
      setIsPlaying(true);
    } catch (cause) {
      if (samplePlaybackFailure(cause) === "abort") {
        return;
      }

      setIsPlaying(false);
      setError(sampleErrorMessage(cause, t));
    }
  }, [t]);

  const togglePlayback = useCallback(async () => {
    const audio = audioRef.current;

    if (!audio || !queued) {
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audio.play();
      setIsPlaying(true);
      setError(null);
    } catch (cause) {
      if (samplePlaybackFailure(cause) === "abort") {
        return;
      }

      setIsPlaying(false);
      setError(sampleErrorMessage(cause, t));
    }
  }, [isPlaying, queued, t]);

  const stopSample = useCallback(() => {
    const audio = audioRef.current;
    audio?.pause();

    if (audio) {
      audio.removeAttribute("src");
      audio.load();
    }

    setQueued(null);
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
    setError(null);
  }, []);

  const hearCue = useCallback(
    async (cue: SampleCue | null) => {
      if (!cue) {
        return;
      }

      await startSample(cue);
    },
    [startSample],
  );

  useEffect(() => {
    if (!("mediaSession" in navigator)) {
      return;
    }

    if (!nowPlaying) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = "none";
      return;
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: nowPlaying.title,
      artist: nowPlaying.artist,
      album: nowPlaying.album,
      artwork: nowPlaying.artwork
        ? [{ src: nowPlaying.artwork, sizes: "600x600", type: "image/jpeg" }]
        : [],
    });
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    navigator.mediaSession.setActionHandler("play", () => {
      void togglePlayback();
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      void togglePlayback();
    });
    try {
      navigator.mediaSession.setActionHandler("stop", () => {
        stopSample();
      });
    } catch {
      // Some rooms do not name a stop action.
    }
    navigator.mediaSession.setActionHandler("previoustrack", canSkip ? () => void hearCue(previous) : null);
    navigator.mediaSession.setActionHandler("nexttrack", canSkip ? () => void hearCue(next) : null);

    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      try {
        navigator.mediaSession.setActionHandler("stop", null);
      } catch {
        // Some rooms do not name a stop action.
      }
      navigator.mediaSession.setActionHandler("previoustrack", null);
      navigator.mediaSession.setActionHandler("nexttrack", null);
    };
  }, [canSkip, hearCue, isPlaying, next, nowPlaying, previous, stopSample, togglePlayback]);

  useEffect(() => {
    const position = samplePositionState({ duration, progress });

    if (!("mediaSession" in navigator) || !nowPlaying || !position) {
      return;
    }

    try {
      navigator.mediaSession.setPositionState(position);
    } catch {
      // Safari can reject position state before metadata is ready.
    }
  }, [duration, nowPlaying, progress]);

  useEffect(() => {
    if (!queued) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      const target = event.target;
      const shouldToggle = shouldToggleSampleOnSpace({
        key: event.key,
        hasQueued: true,
        isTyping: isTypingTarget(target),
        hasModal: Boolean(document.querySelector("[aria-modal='true']")),
        hasModifier: event.metaKey || event.ctrlKey || event.altKey,
        isOnButton: target instanceof HTMLElement && Boolean(target.closest("button")),
      });

      if (!shouldToggle) {
        return;
      }

      event.preventDefault();
      void togglePlayback();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [queued, togglePlayback]);

  async function hearTrack(key: string) {
    if (queued?.key === key) {
      await togglePlayback();
      return;
    }

    const cue = cues.find((entry) => entry.key === key);

    if (!cue) {
      return;
    }

    await startSample(cue);
  }

  function hearFollowing() {
    if (!queued) {
      setIsPlaying(false);
      setProgress(1);
      return;
    }

    const index = cues.findIndex((cue) => cue.key === queued.key);
    const following = index >= 0 ? cues[index + 1] : undefined;

    if (following) {
      void startSample(following);
      return;
    }

    setIsPlaying(false);
    setProgress(1);
  }

  function readAudioDuration(audio: HTMLAudioElement): number {
    return Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
  }

  function seekToRatio(ratio: number) {
    const audio = audioRef.current;
    const seconds = sampleSeekSeconds({ ratio, duration: audio ? readAudioDuration(audio) : 0 });

    if (!audio || seconds === null) {
      return;
    }

    audio.currentTime = seconds;
    setProgress(ratio);
    setDuration(readAudioDuration(audio));
  }

  function seekFromClientX(clientX: number) {
    const bar = seekRef.current;

    if (!bar) {
      return;
    }

    const rect = bar.getBoundingClientRect();
    seekToRatio(sampleSeekRatio({ clientX, left: rect.left, width: rect.width }));
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-6 text-text-secondary">
        {t("sample.intro")}{" "}
        <span className="text-text-tertiary">
          {hasQuietTracks ? t("sample.someQuiet") : t("sample.fromDeezer")}
        </span>
      </p>

      <div className="flex flex-col gap-6">
        {sides.map((side, sideIndex) => (
          <div key={`${side.heading ?? "side"}-${sideIndex}`} className="flex flex-col gap-3">
            <RecordSideHeading side={side} showRuntime={sides.length > 1} locale={locale} />
            <ol className="flex flex-col" aria-label={side.heading ?? t("sample.tracks")}>
              {side.tracks.map((track, trackIndex) => {
                const key = `${sideIndex}-${trackIndex}`;
                const isCurrent = queued?.key === key;

                return (
                  <li
                    key={`${track.position}-${track.title}-${trackIndex}`}
                    className="grid grid-cols-[2.75rem_2.75rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-border-subtle py-1 last:border-b-0"
                  >
                    {trackHasSample(track) ? (
                      <button
                        type="button"
                        className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full outline-none hover:bg-surface-pressed focus-visible:ring-2 focus-visible:ring-border-strong ${
                          isCurrent
                            ? "bg-primary-soft text-on-primary-soft"
                            : "border border-border bg-surface text-text-secondary"
                        }`}
                        aria-label={
                          isCurrent && isPlaying
                            ? t("sample.pauseTitle", { title: track.title })
                            : t("sample.hear", { title: track.title })
                        }
                        aria-pressed={isCurrent && isPlaying}
                        onClick={() => {
                          void hearTrack(key);
                        }}
                      >
                        {isCurrent && isPlaying ? (
                          <Pause className="size-4" aria-hidden />
                        ) : (
                          <Play className="size-4" aria-hidden />
                        )}
                      </button>
                    ) : (
                      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-text-disabled">
                        <Play className="size-4" aria-hidden />
                        <span className="sr-only">{t("sample.quietTrack", { title: track.title })}</span>
                      </span>
                    )}
                    <span className="font-mono text-xs leading-5 text-text-tertiary">
                      {track.position || "·"}
                    </span>
                    <span className="text-sm leading-6 text-text">
                      <PressingText>{track.title}</PressingText>
                    </span>
                    <span className="font-mono text-xs leading-5 tabular-nums text-text-tertiary">
                      {track.duration ?? ""}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>

      {queued && nowPlaying ? (
        <div
          className={sampleDockClass}
          role="region"
          aria-labelledby={headingId}
        >
          <div className="relative flex min-w-0 flex-col gap-2">
            <div className="absolute top-0 right-0 z-10 flex">
              {keepClose}
              <button
                type="button"
                className="inline-flex size-11 items-center justify-center rounded-full text-text-secondary outline-none hover:bg-surface-pressed hover:text-text focus-visible:ring-2 focus-visible:ring-border-strong"
                aria-label={t("sample.stopTitle", { title: sampleCueLabel(queued) })}
                onClick={stopSample}
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
            <div className={`flex min-w-0 items-center gap-3 ${keepClose ? "pr-24" : "pr-10"}`}>
              <CoverArt
                url={nowPlaying.artwork ?? coverUrl ?? null}
                compactUrl={compactUrl}
                alt=""
                sizes="48px"
                className="size-12 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p id={headingId} className={`line-clamp-2 ${recordTitleClass}`} title={nowPlaying.title}>
                  <PressingText>{nowPlaying.title}</PressingText>
                </p>
                <p className="truncate text-xs leading-5 text-text-secondary">
                  {queued.position ? `${queued.position} · ` : null}
                  <PressingText>{nowPlaying.artist}</PressingText> · {t("sample.fromDeezerLine")}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-1">
              <button
                type="button"
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-text-secondary outline-none hover:bg-surface-pressed hover:text-text focus-visible:ring-2 focus-visible:ring-border-strong disabled:text-text-disabled"
                aria-label={previous ? t("sample.hear", { title: previous.title }) : t("sample.noPrevious")}
                disabled={!canSkip}
                onClick={() => {
                  void hearCue(previous);
                }}
              >
                <SkipBack className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary outline-none hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-border-strong"
                aria-label={isPlaying ? t("sample.pause") : t("sample.play", { title: sampleCueLabel(queued) })}
                aria-pressed={isPlaying}
                onClick={() => {
                  void togglePlayback();
                }}
              >
                {isPlaying ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
              </button>
              <button
                type="button"
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-text-secondary outline-none hover:bg-surface-pressed hover:text-text focus-visible:ring-2 focus-visible:ring-border-strong disabled:text-text-disabled"
                aria-label={next ? t("sample.hear", { title: next.title }) : t("sample.noNext")}
                disabled={!canSkip}
                onClick={() => {
                  void hearCue(next);
                }}
              >
                <SkipForward className="size-4" aria-hidden />
              </button>
            </div>
            <div
              ref={seekRef}
              role="slider"
              tabIndex={0}
              aria-label={t("sample.position")}
              aria-valuemin={0}
              aria-valuemax={duration > 0 ? Math.round(duration) : 0}
              aria-valuenow={duration > 0 ? Math.round(progress * duration) : 0}
              aria-valuetext={
                duration > 0
                  ? t("sample.positionValue", {
                      now: Math.round(progress * duration),
                      duration: Math.round(duration),
                    })
                  : t("sample.position")
              }
              className="flex min-h-11 min-w-0 cursor-pointer items-center outline-none focus-visible:ring-2 focus-visible:ring-border-strong"
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                seekFromClientX(event.clientX);
              }}
              onPointerMove={(event) => {
                if (event.buttons === 0) {
                  return;
                }

                seekFromClientX(event.clientX);
              }}
              onKeyDown={(event) => {
                if (event.key === "Home") {
                  event.preventDefault();
                  seekToRatio(0);
                  return;
                }

                if (event.key === "End") {
                  event.preventDefault();
                  seekToRatio(1);
                  return;
                }

                if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
                  return;
                }

                event.preventDefault();
                const audio = audioRef.current;
                const length = audio ? readAudioDuration(audio) : 0;

                if (length <= 0) {
                  return;
                }

                const delta = event.key === "ArrowRight" ? 2 : -2;
                const current = audio?.currentTime ?? 0;
                seekToRatio(sampleSeekRatio({ clientX: current + delta, left: 0, width: length }));
              }}
            >
              <div className="h-1 w-full overflow-hidden rounded-full bg-border-subtle" aria-hidden>
                <div className="h-full bg-primary" style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
            </div>
            {error ? <Notice tone="error">{error}</Notice> : null}
          </div>
        </div>
      ) : null}

      <audio
        ref={audioRef}
        preload="none"
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={hearFollowing}
        onLoadedMetadata={() => {
          const audio = audioRef.current;
          setDuration(audio ? readAudioDuration(audio) : 0);
        }}
        onTimeUpdate={() => {
          const audio = audioRef.current;

          if (!audio) {
            return;
          }

          const length = readAudioDuration(audio);
          setDuration(length);

          if (length <= 0) {
            return;
          }

          setProgress(audio.currentTime / length);
        }}
        onError={() => {
          setIsPlaying(false);
          setError(t("sample.couldNotHear"));
        }}
      />
    </div>
  );
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  const tag = target.tagName;

  if (tag === "TEXTAREA" || tag === "SELECT") {
    return true;
  }

  if (target instanceof HTMLInputElement) {
    const type = target.type;
    return type !== "button" && type !== "submit" && type !== "checkbox" && type !== "radio" && type !== "file";
  }

  return false;
}

function sampleErrorMessage(
  cause: unknown,
  t: (path: string) => string,
): string {
  return samplePlaybackFailure(cause) === "blocked" ? t("sample.couldNotStart") : t("sample.couldNotHear");
}
